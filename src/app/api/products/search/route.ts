import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchProducts as kassalSearch } from "@/lib/kassal";

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
  const products = await prisma.product.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
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
    orderBy: { name: "asc" },
  });

  if (products.length === 0) {
    try {
      const kassalResult = await kassalSearch(q, page, limit);
      for (const kp of kassalResult.data) {
        if (kp.ean) {
          await prisma.product.upsert({
            where: { ean: kp.ean },
            update: { name: kp.name, brand: kp.brand, vendor: kp.vendor, imageUrl: kp.image },
            create: { ean: kp.ean, name: kp.name, brand: kp.brand, vendor: kp.vendor, imageUrl: kp.image },
          });
        }
      }
      return NextResponse.json({
        products: kassalResult.data.map((kp) => ({
          ean: kp.ean, name: kp.name, brand: kp.brand, vendor: kp.vendor,
          imageUrl: kp.image, currentPrice: kp.current_price?.price ?? null,
          chain: kp.current_price?.store?.name ?? null,
        })),
        source: "kassal", page, limit,
      });
    } catch {
      return NextResponse.json({ products: [], source: "none", page, limit });
    }
  }

  return NextResponse.json({
    products: products.map((p) => ({
      ean: p.ean, name: p.name, brand: p.brand, vendor: p.vendor,
      imageUrl: p.imageUrl, currentPrice: p.prices[0] ? Number(p.prices[0].price) : null,
      chain: p.prices[0]?.chain ?? null,
    })),
    source: "db", page, limit,
  });
}
