import { prisma } from "@/lib/db";
import { getPricesBulk } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";

/**
 * Fetches prices from ALL chains for the given EANs via Kassal's bulk API,
 * and saves them to the database. This ensures products don't just show
 * a single chain's price.
 *
 * Call this whenever a product is newly discovered (via search or product page).
 * It's safe to call for existing products too — upsert prevents duplicates.
 */
export async function fetchAndSaveAllPrices(eans: string[]): Promise<number> {
  if (eans.length === 0) return 0;

  // Look up product IDs for these EANs
  const products = await prisma.product.findMany({
    where: { ean: { in: eans } },
    select: { id: true, ean: true },
  });

  if (products.length === 0) return 0;

  const eanToId = new Map(products.map((p) => [p.ean, p.id]));
  const validEans = products.map((p) => p.ean);

  let totalSaved = 0;

  try {
    // Fetch price history from all chains (last 30 days is enough for current prices)
    const result = await getPricesBulk(validEans, 30);

    for (const item of result.data) {
      const productId = eanToId.get(item.ean);
      if (!productId) continue;

      for (const priceEntry of item.prices) {
        const chain = normalizeChain(priceEntry.store.name);
        const date = new Date(priceEntry.date);
        date.setHours(0, 0, 0, 0);

        try {
          await prisma.price.upsert({
            where: {
              productId_chain_date: { productId, chain, date },
            },
            update: { price: priceEntry.price },
            create: { productId, chain, price: priceEntry.price, date },
          });
          totalSaved++;
        } catch {
          // Skip individual price save errors (e.g. race conditions)
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch bulk prices:", error);
  }

  return totalSaved;
}
