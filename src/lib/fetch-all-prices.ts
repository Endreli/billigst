import { prisma } from "@/lib/db";
import { getProductByEan, getPricesBulk, getKassalPrice, getKassalStore } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";
import { findOdaPrice } from "@/lib/oda";

/**
 * Fetches prices from ALL available sources and saves them to the database.
 *
 * Data sources:
 * 1. Kassal bulk prices API — Spar, Meny, Joker, Bunnpris (when active)
 * 2. Kassal EAN endpoint — All store variants (fallback)
 * 3. Oda direct API — Always fresh, real-time prices
 *
 * Call this whenever a product is newly discovered or has stale data.
 */
export async function fetchAndSaveAllPrices(eans: string[]): Promise<number> {
  if (eans.length === 0) return 0;

  const products = await prisma.product.findMany({
    where: { ean: { in: eans } },
    select: { id: true, ean: true, name: true, brand: true },
  });

  if (products.length === 0) return 0;

  const eanToProduct = new Map(products.map((p) => [p.ean, p]));
  const validEans = products.map((p) => p.ean);
  let totalSaved = 0;

  // ── Source 1: Kassal bulk prices API ──
  try {
    const result = await getPricesBulk(validEans, 30);

    for (const item of result.data) {
      const product = eanToProduct.get(item.ean);
      if (!product) continue;

      for (const store of item.stores || []) {
        const chain = normalizeChain(store.name);
        const price = parseFloat(store.current_price);
        if (isNaN(price)) continue;

        const date = new Date(store.last_checked);
        date.setHours(0, 0, 0, 0);

        try {
          await prisma.price.upsert({
            where: { productId_chain_date: { productId: product.id, chain, date } },
            update: { price },
            create: { productId: product.id, chain, price, date },
          });
          totalSaved++;
        } catch { /* skip */ }
      }

      for (const entry of item.price_history || []) {
        const chain = normalizeChain(entry.store);
        const date = new Date(entry.date);
        date.setHours(0, 0, 0, 0);

        try {
          await prisma.price.upsert({
            where: { productId_chain_date: { productId: product.id, chain, date } },
            update: { price: entry.price },
            create: { productId: product.id, chain, price: entry.price, date },
          });
          totalSaved++;
        } catch { /* skip */ }
      }
    }
  } catch (error) {
    console.error("Bulk prices failed:", error);
  }

  // ── Source 2: Kassal EAN endpoint (fallback for sparse data) ──
  for (const ean of validEans) {
    const product = eanToProduct.get(ean);
    if (!product) continue;

    const chainCount = await prisma.price.findMany({
      where: { productId: product.id },
      distinct: ["chain"],
      select: { chain: true },
    });

    if (chainCount.length < 3) {
      try {
        const eanResult = await getProductByEan(ean);
        const eanProducts = eanResult.data?.products || [];

        for (const p of eanProducts) {
          const storeName = getKassalStore(p);
          const price = getKassalPrice(p);
          if (!storeName || price == null) continue;

          const chain = normalizeChain(storeName);
          let date: Date;
          if (p.current_price && typeof p.current_price === "object" && "date" in p.current_price) {
            date = new Date(p.current_price.date);
          } else {
            date = new Date();
          }
          date.setHours(0, 0, 0, 0);

          try {
            await prisma.price.upsert({
              where: { productId_chain_date: { productId: product.id, chain, date } },
              update: { price },
              create: { productId: product.id, chain, price, date },
            });
            totalSaved++;
          } catch { /* skip */ }
        }
      } catch { /* skip */ }
    }
  }

  // ── Source 3: Oda direct API (always fresh!) ──
  for (const ean of validEans) {
    const product = eanToProduct.get(ean);
    if (!product) continue;

    // Check if we already have a fresh Oda price (< 1 day old)
    const existingOda = await prisma.price.findFirst({
      where: {
        productId: product.id,
        chain: "Oda",
        date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existingOda) {
      try {
        const odaMatch = await findOdaPrice(product.name, product.brand);
        if (odaMatch) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          await prisma.price.upsert({
            where: { productId_chain_date: { productId: product.id, chain: "Oda", date: today } },
            update: { price: odaMatch.price },
            create: { productId: product.id, chain: "Oda", price: odaMatch.price, date: today },
          });
          totalSaved++;
        }
      } catch { /* skip */ }
    }
  }

  return totalSaved;
}
