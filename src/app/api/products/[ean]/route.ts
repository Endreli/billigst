import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProductByEan } from "@/lib/kassal";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  const { ean } = await params;

  let product = await prisma.product.findUnique({
    where: { ean },
    include: { prices: { orderBy: { date: "desc" }, take: 1 } },
  });

  if (!product) {
    try {
      const kassalResult = await getProductByEan(ean);
      const kp = kassalResult.data;
      product = await prisma.product.create({
        data: { ean: kp.ean, name: kp.name, brand: kp.brand, vendor: kp.vendor, imageUrl: kp.image },
        include: { prices: { orderBy: { date: "desc" }, take: 1 } },
      });
    } catch {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
  }

  const latestPrices = await prisma.price.findMany({
    where: { productId: product.id },
    orderBy: { date: "desc" },
    distinct: ["chain"],
  });

  return NextResponse.json({
    ean: product.ean, name: product.name, brand: product.brand,
    vendor: product.vendor, imageUrl: product.imageUrl,
    latestPrices: latestPrices.map((p) => ({
      chain: p.chain, price: Number(p.price), date: p.date,
    })),
  });
}
