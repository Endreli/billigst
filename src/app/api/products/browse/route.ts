import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  // Get all categories with product counts
  const products = await prisma.product.findMany({
    where: category ? { category } : undefined,
    include: {
      prices: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: [{ searchCount: "desc" }, { name: "asc" }],
  });

  // Get unique categories with counts
  const allProducts = await prisma.product.groupBy({
    by: ["category"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const categories = allProducts
    .filter((c) => c.category != null)
    .map((c) => ({ name: c.category!, count: c._count.id }));

  return NextResponse.json({
    products: products.map((p) => ({
      ean: p.ean,
      name: p.name,
      brand: p.brand,
      vendor: p.vendor,
      imageUrl: p.imageUrl,
      category: p.category,
      currentPrice: p.prices[0] ? Number(p.prices[0].price) : null,
      chain: p.prices[0]?.chain ?? null,
    })),
    categories,
    selectedCategory: category,
  });
}
