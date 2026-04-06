import { prisma } from "@/lib/db";
import { getProductByEan, getPricesBulk, getKassalPrice, getKassalStore } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";

/**
 * Fetches prices from ALL chains for the given EANs and saves them to the database.
 *
 * Uses two strategies:
 * 1. Bulk prices API — returns current prices per store + history
 * 2. EAN endpoint fallback — returns all store variants for a single product
 *
 * Call this whenever a product is newly discovered or has stale data.
 */
export async function fetchAndSaveAllPrices(eans: string[]): Promise<number> {
  if (eans.length === 0) return 0;

  const products = await prisma.product.findMany({
    where: { ean: { in: eans } },
    select: { id: true, ean: true },
  });

  if (products.length === 0) return 0;

  const eanToId = new Map(products.map((p) => [p.ean, p.id]));
  const validEans = products.map((p) => p.ean);
  let totalSaved = 0;

  // Strategy 1: Bulk prices API (returns stores[] with current prices + price_history[])
  try {
    const result = await getPricesBulk(validEans, 30);

    for (const item of result.data) {
      const productId = eanToId.get(item.ean);
      if (!productId) continue;

      // Save current prices from all stores
      for (const store of item.stores || []) {
        const chain = normalizeChain(store.name);
        const price = parseFloat(store.current_price);
        if (isNaN(price)) continue;

        const date = new Date(store.last_checked);
        date.setHours(0, 0, 0, 0);

        try {
          await prisma.price.upsert({
            where: { productId_chain_date: { productId, chain, date } },
            update: { price },
            create: { productId, chain, price, date },
          });
          totalSaved++;
        } catch { /* skip */ }
      }

      // Also save price history entries
      for (const entry of item.price_history || []) {
        const chain = normalizeChain(entry.store);
        const date = new Date(entry.date);
        date.setHours(0, 0, 0, 0);

        try {
          await prisma.price.upsert({
            where: { productId_chain_date: { productId, chain, date } },
            update: { price: entry.price },
            create: { productId, chain, price: entry.price, date },
          });
          totalSaved++;
        } catch { /* skip */ }
      }
    }
  } catch (error) {
    console.error("Bulk prices failed:", error);
  }

  // Strategy 2: For products that got few results from bulk, try EAN endpoint
  // The EAN endpoint returns ALL store variants including inactive ones
  for (const ean of validEans) {
    const productId = eanToId.get(ean);
    if (!productId) continue;

    // Check how many chains we have now
    const chainCount = await prisma.price.findMany({
      where: { productId },
      distinct: ["chain"],
      select: { chain: true },
    });

    // If we have fewer than 3 chains, try the EAN endpoint for more
    if (chainCount.length < 3) {
      try {
        const eanResult = await getProductByEan(ean);
        const eanProducts = eanResult.data?.products || [];

        for (const p of eanProducts) {
          const storeName = getKassalStore(p);
          const price = getKassalPrice(p);
          if (!storeName || price == null) continue;

          const chain = normalizeChain(storeName);
          // Get date from the price object or use today
          let date: Date;
          if (
            p.current_price &&
            typeof p.current_price === "object" &&
            "date" in p.current_price
          ) {
            date = new Date(p.current_price.date);
          } else {
            date = new Date();
          }
          date.setHours(0, 0, 0, 0);

          try {
            await prisma.price.upsert({
              where: { productId_chain_date: { productId, chain, date } },
              update: { price },
              create: { productId, chain, price, date },
            });
            totalSaved++;
          } catch { /* skip */ }
        }
      } catch {
        // EAN endpoint failed, that's OK
      }
    }
  }

  return totalSaved;
}
