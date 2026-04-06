import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPricesBulk } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";

export async function POST(request: NextRequest) {
  // Verify Vercel Cron secret
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products: { id: number; ean: string }[] = await prisma.product.findMany({ select: { id: true, ean: true } });
  const eans = products.map((p: { ean: string }) => p.ean);
  const eanToId = Object.fromEntries(products.map((p: { ean: string; id: number }) => [p.ean, p.id]));

  let totalSaved = 0;
  for (let i = 0; i < eans.length; i += 100) {
    const batch = eans.slice(i, i + 100);
    try {
      const result = await getPricesBulk(batch);
      for (const item of result.data) {
        const productId = eanToId[item.ean];
        if (!productId) continue;

        for (const priceEntry of item.prices) {
          const chain = normalizeChain(priceEntry.store.name);
          const date = new Date(priceEntry.date);

          await prisma.price.upsert({
            where: {
              productId_chain_date: { productId, chain, date },
            },
            update: { price: priceEntry.price },
            create: { productId, chain, price: priceEntry.price, date },
          });
          totalSaved++;
        }
      }
    } catch (error) {
      console.error(`Batch ${i}-${i + 100} failed:`, error);
    }

    if (i + 100 < eans.length) {
      await new Promise((r) => setTimeout(r, 1100));
    }
  }

  return NextResponse.json({ success: true, productsFetched: products.length, pricesSaved: totalSaved });
}
