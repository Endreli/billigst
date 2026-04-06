import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchProducts as kassalSearch } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const chain = searchParams.get("chain");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!q) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const offset = (page - 1) * limit;
  const searchTerm = `%${q}%`;

  // Search with relevance: exact name match first, then name contains, then brand/category
  const products = await prisma.$queryRawUnsafe<
    { id: number; ean: string; name: string; brand: string | null; vendor: string | null; image_url: string | null; search_count: number }[]
  >(
    `SELECT id, ean, name, brand, vendor, image_url, search_count,
      CASE
        WHEN LOWER(name) = LOWER(?) THEN 100
        WHEN LOWER(name) LIKE LOWER(? || '%') THEN 80
        WHEN LOWER(name) LIKE LOWER('%' || ? || '%') THEN 60
        WHEN LOWER(brand) LIKE LOWER('%' || ? || '%') THEN 40
        WHEN LOWER(vendor) LIKE LOWER('%' || ? || '%') THEN 30
        WHEN LOWER(category) LIKE LOWER('%' || ? || '%') THEN 20
        ELSE 10
      END as relevance
    FROM products
    WHERE LOWER(name) LIKE LOWER(?)
       OR LOWER(brand) LIKE LOWER(?)
       OR LOWER(vendor) LIKE LOWER(?)
       OR LOWER(category) LIKE LOWER(?)
    ORDER BY relevance DESC, search_count DESC, name ASC
    LIMIT ? OFFSET ?`,
    q, q, q, q, q, q,
    searchTerm, searchTerm, searchTerm, searchTerm,
    limit, offset
  );

  if (products.length > 0) {
    // Get latest price per product
    const productIds = products.map((p: any) => p.id);
    const placeholders = productIds.map(() => "?").join(",");

    const prices = await prisma.$queryRawUnsafe<
      { product_id: number; chain: string; price: number }[]
    >(
      `SELECT product_id, chain, price FROM (
        SELECT product_id, chain, price,
          ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY date DESC) as rn
        FROM prices
        WHERE product_id IN (${placeholders})
        ${chain ? "AND chain = ?" : ""}
      ) WHERE rn = 1`,
      ...productIds,
      ...(chain ? [chain] : [])
    );

    const priceMap = new Map<number, { price: number; chain: string }>();
    for (const p of prices) {
      priceMap.set(p.product_id, { price: Number(p.price), chain: p.chain });
    }

    // Increment search count (fire-and-forget)
    prisma.$queryRawUnsafe(
      `UPDATE products SET search_count = search_count + 1 WHERE id IN (${placeholders})`,
      ...productIds
    ).catch(() => {});

    return NextResponse.json({
      products: products.map((p: any) => {
        const priceInfo = priceMap.get(p.id);
        return {
          ean: p.ean,
          name: p.name,
          brand: p.brand,
          vendor: p.vendor,
          imageUrl: p.image_url,
          currentPrice: priceInfo?.price ?? null,
          chain: priceInfo?.chain ?? null,
        };
      }),
      source: "db", page, limit,
    });
  }

  // Fall back to Kassalapp API
  try {
    const kassalResult = await kassalSearch(q, page, limit);

    // Save found products to DB for future searches (fire-and-forget)
    for (const kp of kassalResult.data) {
      if (kp.ean) {
        try {
          const product = await prisma.product.upsert({
            where: { ean: kp.ean },
            update: {
              name: kp.name,
              brand: kp.brand,
              vendor: kp.vendor,
              imageUrl: kp.image,
              category: kp.category?.[0]?.name ?? null,
            },
            create: {
              ean: kp.ean,
              name: kp.name,
              brand: kp.brand,
              vendor: kp.vendor,
              imageUrl: kp.image,
              category: kp.category?.[0]?.name ?? null,
            },
          });

          const priceVal = typeof kp.current_price === "number" ? kp.current_price : null;
          const storeName = kp.store?.name;
          if (priceVal != null && storeName) {
            const chainName = normalizeChain(storeName);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await prisma.price.upsert({
              where: {
                productId_chain_date: {
                  productId: product.id,
                  chain: chainName,
                  date: today,
                },
              },
              update: { price: priceVal },
              create: {
                productId: product.id,
                chain: chainName,
                price: priceVal,
                date: today,
              },
            }).catch(() => {});
          }
        } catch {
          // Skip individual product save errors
        }
      }
    }

    return NextResponse.json({
      products: kassalResult.data
        .filter((kp) => kp.ean)
        .map((kp) => ({
          ean: kp.ean,
          name: kp.name,
          brand: kp.brand,
          vendor: kp.vendor,
          imageUrl: kp.image,
          currentPrice: typeof kp.current_price === "number" ? kp.current_price : null,
          chain: kp.store?.name ? normalizeChain(kp.store.name) : null,
        })),
      source: "kassal", page, limit,
    });
  } catch {
    return NextResponse.json({ products: [], source: "none", page, limit });
  }
}
