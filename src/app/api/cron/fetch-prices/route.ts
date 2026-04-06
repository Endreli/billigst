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

        // Save current prices from all stores
        for (const store of item.stores || []) {
          const chain = normalizeChain(store.name);
          const price = parseFloat(store.current_price);
          if (isNaN(price)) continue;

          const date = new Date(store.last_checked);
          date.setHours(0, 0, 0, 0);

          await prisma.price.upsert({
            where: {
              productId_chain_date: { productId, chain, date },
            },
            update: { price },
            create: { productId, chain, price, date },
          });
          totalSaved++;
        }

        // Save price history entries
        for (const entry of item.price_history || []) {
          const chain = normalizeChain(entry.store);
          const date = new Date(entry.date);
          date.setHours(0, 0, 0, 0);

          try {
            await prisma.price.upsert({
              where: {
                productId_chain_date: { productId, chain, date },
              },
              update: { price: entry.price },
              create: { productId, chain, price: entry.price, date },
            });
            totalSaved++;
          } catch {
            // Skip duplicates / race conditions
          }
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
