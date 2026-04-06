import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProductByEan, getKassalPrice, getKassalStore } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";
import { fetchAndSaveAllPrices } from "@/lib/fetch-all-prices";

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
      const eanData = kassalResult.data;
      const variants = eanData.products || [];

      // Find best variant (most recent price)
      const best = variants
        .filter((v) => getKassalPrice(v) != null && getKassalStore(v) != null)
        .sort((a, b) => {
          const dateA = a.current_price && typeof a.current_price === "object" ? new Date(a.current_price.date).getTime() : 0;
          const dateB = b.current_price && typeof b.current_price === "object" ? new Date(b.current_price.date).getTime() : 0;
          return dateB - dateA;
        })[0] || variants[0];

      if (!best) throw new Error("No product data");

      product = await prisma.product.create({
        data: {
          ean: eanData.ean,
          name: best.name,
          brand: best.brand,
          vendor: best.vendor,
          imageUrl: best.image,
          category: best.category?.[0]?.name ?? null,
        },
        include: { prices: { orderBy: { date: "desc" }, take: 1 } },
      });

      // Save ALL prices from ALL store variants
      for (const variant of variants) {
        const price = getKassalPrice(variant);
        const storeName = getKassalStore(variant);
        if (price == null || !storeName) continue;

        const chain = normalizeChain(storeName);
        let date: Date;
        if (variant.current_price && typeof variant.current_price === "object" && "date" in variant.current_price) {
          date = new Date(variant.current_price.date);
        } else {
          date = new Date();
        }
        date.setHours(0, 0, 0, 0);

        await prisma.price.upsert({
          where: { productId_chain_date: { productId: product.id, chain, date } },
          update: { price },
          create: { productId: product.id, chain, price, date },
        }).catch(() => {});
      }

      // Also fetch bulk prices for additional history
      await fetchAndSaveAllPrices([ean]).catch(() => {});
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
