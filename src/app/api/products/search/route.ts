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

  // Search local DB first
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { brand: { contains: q } },
        { vendor: { contains: q } },
        { category: { contains: q } },
      ],
    },
    include: {
      prices: {
        orderBy: { date: "desc" },
        take: 1,
        ...(chain ? { where: { chain } } : {}),
      },
    },
    skip: offset,
    take: limit,
    orderBy: [
      { searchCount: "desc" },
      { name: "asc" },
    ],
  });

  // Increment search count (fire-and-forget)
  if (products.length > 0) {
    const productIds = products.map((p) => p.id);
    prisma.$queryRawUnsafe(
      `UPDATE products SET search_count = search_count + 1 WHERE id IN (${productIds.map(() => "?").join(",")})`,
      ...productIds
    ).catch(() => {});
  }

  // If local has results, return them
  if (products.length > 0) {
    return NextResponse.json({
      products: products.map((p) => ({
        ean: p.ean, name: p.name, brand: p.brand, vendor: p.vendor,
        imageUrl: p.imageUrl, currentPrice: p.prices[0] ? Number(p.prices[0].price) : null,
        chain: p.prices[0]?.chain ?? null,
      })),
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

          // Save the current price if available
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
