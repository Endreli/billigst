import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RequestItem {
  ean: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  let body: { items: RequestItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Items array required" }, { status: 400 });
  }
  if (body.items.length > 30) {
    return NextResponse.json({ error: "Max 30 items" }, { status: 400 });
  }

  const requestItems = body.items.filter(
    (i) => typeof i.ean === "string" && typeof i.quantity === "number" && i.quantity >= 1 && i.quantity <= 99
  );

  if (requestItems.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  const eans = requestItems.map((i) => i.ean);
  const quantityMap = new Map(requestItems.map((i) => [i.ean, i.quantity]));

  // Get products
  const products = await prisma.product.findMany({
    where: { ean: { in: eans } },
    select: { id: true, ean: true, name: true, brand: true, imageUrl: true },
  });

  if (products.length === 0) {
    return NextResponse.json({
      chainTotals: [],
      productBreakdown: [],
      savings: null,
      splitBasket: null,
      tilbud: [],
    });
  }

  const productIdMap = new Map(products.map((p) => [p.id, p]));
  const eanToIdMap = new Map(products.map((p) => [p.ean, p.id]));
  const productIds = products.map((p) => p.id);

  // Get latest price per product per chain using raw SQL
  // Only include prices from the last year — older prices are unreliable
  const placeholders = productIds.map(() => "?").join(",");
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString();

  const latestPrices = await prisma.$queryRawUnsafe<
    { product_id: number; chain: string; price: number }[]
  >(
    `SELECT product_id, chain, price FROM (
      SELECT product_id, chain, price,
        ROW_NUMBER() OVER (PARTITION BY product_id, chain ORDER BY date DESC) as rn
      FROM prices
      WHERE product_id IN (${placeholders}) AND date >= ?
    ) WHERE rn = 1`,
    ...productIds,
    oneYearAgoStr
  );

  // Build price map: productId -> chain -> price
  const priceMap = new Map<number, Map<string, number>>();
  const allChains = new Set<string>();

  for (const row of latestPrices) {
    allChains.add(row.chain);
    if (!priceMap.has(row.product_id)) {
      priceMap.set(row.product_id, new Map());
    }
    priceMap.get(row.product_id)!.set(row.chain, Number(row.price));
  }

  const chains = Array.from(allChains).sort();

  // Calculate chain totals
  const chainTotals = chains.map((chain) => {
    let total = 0;
    let available = 0;
    let missing = 0;

    for (const product of products) {
      const qty = quantityMap.get(product.ean) || 1;
      const chainPrices = priceMap.get(product.id);
      const price = chainPrices?.get(chain);
      if (price != null) {
        total += price * qty;
        available++;
      } else {
        missing++;
      }
    }

    return { chain, total: Math.round(total * 100) / 100, itemsAvailable: available, itemsMissing: missing };
  });

  // Sort by total (only chains with all items first, then by total)
  chainTotals.sort((a, b) => {
    if (a.itemsMissing !== b.itemsMissing) return a.itemsMissing - b.itemsMissing;
    return a.total - b.total;
  });

  // Product breakdown
  const productBreakdown = products.map((product) => {
    const qty = quantityMap.get(product.ean) || 1;
    const chainPrices = priceMap.get(product.id) || new Map();
    const prices: Record<string, { price: number; subtotal: number }> = {};

    let cheapestChain = "";
    let cheapestPrice = Infinity;

    for (const [chain, price] of chainPrices) {
      prices[chain] = { price, subtotal: Math.round(price * qty * 100) / 100 };
      if (price < cheapestPrice) {
        cheapestPrice = price;
        cheapestChain = chain;
      }
    }

    return {
      ean: product.ean,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      quantity: qty,
      prices,
      cheapestChain,
      cheapestPrice: cheapestPrice === Infinity ? 0 : cheapestPrice,
    };
  });

  // Savings calculation
  const fullCoverageChains = chainTotals.filter((c) => c.itemsMissing === 0);
  let savings = null;
  if (fullCoverageChains.length >= 2) {
    const cheapest = fullCoverageChains[0];
    const mostExpensive = fullCoverageChains[fullCoverageChains.length - 1];
    const savingsAmount = Math.round((mostExpensive.total - cheapest.total) * 100) / 100;
    const savingsPercent = mostExpensive.total > 0
      ? Math.round((savingsAmount / mostExpensive.total) * 1000) / 10
      : 0;

    savings = {
      cheapestChain: cheapest.chain,
      cheapestTotal: cheapest.total,
      mostExpensiveChain: mostExpensive.chain,
      mostExpensiveTotal: mostExpensive.total,
      savingsAmount,
      savingsPercent,
    };
  }

  // Split basket optimization: cheapest per product
  const assignments: { ean: string; name: string; chain: string; price: number; quantity: number }[] = [];
  let splitTotal = 0;
  const storeVisitsSet = new Set<string>();

  for (const product of products) {
    const qty = quantityMap.get(product.ean) || 1;
    const chainPrices = priceMap.get(product.id);
    if (!chainPrices || chainPrices.size === 0) continue;

    let bestChain = "";
    let bestPrice = Infinity;
    for (const [chain, price] of chainPrices) {
      if (price < bestPrice) {
        bestPrice = price;
        bestChain = chain;
      }
    }

    assignments.push({ ean: product.ean, name: product.name, chain: bestChain, price: bestPrice, quantity: qty });
    splitTotal += bestPrice * qty;
    storeVisitsSet.add(bestChain);
  }

  splitTotal = Math.round(splitTotal * 100) / 100;
  const cheapestSingleStore = fullCoverageChains.length > 0 ? fullCoverageChains[0].total : splitTotal;
  const splitSavings = Math.round((cheapestSingleStore - splitTotal) * 100) / 100;

  const splitBasket = splitSavings > 2
    ? {
        totalOptimized: splitTotal,
        savingsVsSingleStore: splitSavings,
        assignments: assignments.sort((a, b) => a.chain.localeCompare(b.chain)),
        storeVisits: Array.from(storeVisitsSet).sort(),
      }
    : null;

  // Tilbud detection: products where current price is >10% below 30-day average
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

  const tilbudRaw = await prisma.$queryRawUnsafe<
    { product_id: number; chain: string; current_price: number; avg_price: number }[]
  >(
    `WITH avg_prices AS (
      SELECT product_id, chain, AVG(price) as avg_price, COUNT(*) as cnt
      FROM prices
      WHERE date >= ? AND product_id IN (${placeholders})
      GROUP BY product_id, chain
      HAVING cnt >= 2
    ),
    latest AS (
      SELECT product_id, chain, price as current_price,
        ROW_NUMBER() OVER (PARTITION BY product_id, chain ORDER BY date DESC) as rn
      FROM prices WHERE product_id IN (${placeholders})
    )
    SELECT l.product_id, l.chain, l.current_price, a.avg_price
    FROM latest l
    JOIN avg_prices a ON l.product_id = a.product_id AND l.chain = a.chain
    WHERE l.rn = 1 AND ((a.avg_price - l.current_price) / a.avg_price) > 0.05
    ORDER BY ((a.avg_price - l.current_price) / a.avg_price) DESC`,
    thirtyDaysAgoStr,
    ...productIds,
    ...productIds
  );

  const tilbud = tilbudRaw.map((t) => {
    const product = productIdMap.get(t.product_id);
    const dropPercent = Math.round(((Number(t.avg_price) - Number(t.current_price)) / Number(t.avg_price)) * 1000) / 10;
    return {
      ean: product?.ean || "",
      name: product?.name || "",
      brand: product?.brand || null,
      chain: t.chain,
      currentPrice: Number(t.current_price),
      avgPrice30d: Math.round(Number(t.avg_price) * 100) / 100,
      dropPercent,
      inBasket: product ? eans.includes(product.ean) : false,
    };
  });

  return NextResponse.json({
    chainTotals,
    productBreakdown,
    savings,
    splitBasket,
    tilbud,
  });
}
