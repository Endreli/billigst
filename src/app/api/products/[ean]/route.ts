import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProductByEan } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  const { ean } = await params;

  let product = await prisma.product.findUnique({
    where: { ean },
    include: { prices: { orderBy: { date: "desc" }, take: 1 } },
  });

  // If not in DB, try Kassalapp
  if (!product) {
    try {
      const kassalResult = await getProductByEan(ean);
      const kp = kassalResult.data;
      product = await prisma.product.create({
        data: {
          ean: kp.ean,
          name: kp.name,
          brand: kp.brand,
          vendor: kp.vendor,
          imageUrl: kp.image,
          category: kp.category?.[0]?.name ?? null,
        },
        include: { prices: { orderBy: { date: "desc" }, take: 1 } },
      });

      // Save current price
      const priceVal = typeof kp.current_price === "number" ? kp.current_price : null;
      if (priceVal != null && kp.store?.name) {
        const chainName = normalizeChain(kp.store.name);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await prisma.price.create({
          data: {
            productId: product.id,
            chain: chainName,
            price: priceVal,
            date: today,
          },
        }).catch(() => {});
      }
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
    category: product.category ?? null,
    latestPrices: latestPrices.map((p) => ({
      chain: p.chain, price: Number(p.price), date: p.date,
    })),
  });
}
