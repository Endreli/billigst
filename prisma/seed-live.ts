/**
 * Seed script that fetches REAL products from Kassalapp API
 * and stores them in the local SQLite database.
 *
 * Usage: npx tsx prisma/seed-live.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "prisma", "hvakosta.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const API_KEY = process.env.KASSAL_API_KEY || "";
const BASE_URL = "https://kassal.app/api/v1";

const CHAIN_PATTERNS: [RegExp, string][] = [
  [/^rema\s*1000/i, "Rema 1000"],
  [/^coop\s+extra/i, "Coop Extra"],
  [/^coop\s+mega/i, "Coop Mega"],
  [/^coop\s+obs/i, "Coop Obs"],
  [/^coop\s+prix/i, "Coop Prix"],
  [/^kiwi/i, "Kiwi"],
  [/^meny/i, "Meny"],
  [/^spar\b/i, "Spar"],
  [/^joker/i, "Joker"],
  [/^oda\b/i, "Oda"],
  [/^bunnpris/i, "Bunnpris"],
];

function normalizeChain(name: string): string {
  for (const [pattern, chain] of CHAIN_PATTERNS) {
    if (pattern.test(name.trim())) return chain;
  }
  return name.trim();
}

async function fetchProducts(query: string, size = 10): Promise<any[]> {
  const res = await fetch(
    `${BASE_URL}/products?search=${encodeURIComponent(query)}&size=${size}`,
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  );
  if (!res.ok) {
    console.error(`  API error for "${query}": ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.data || [];
}

async function main() {
  if (!API_KEY) {
    console.error("Set KASSAL_API_KEY in .env.local");
    process.exit(1);
  }

  const searches = [
    "tine lettmelk", "tine helmelk", "norvegia", "jarlsberg",
    "grandiosa", "freia melkesjokolade", "kvikk lunsj",
    "gilde kjøttdeig", "gilde bacon", "prior egg",
    "coca cola", "pepsi max", "solo",
    "tine yoghurt", "tine smør", "tine fløte",
    "kneippbrød", "pålegg leverpostei",
    "friele kaffe", "evergood kaffe",
    "lerøy laks", "fiskeburger",
    "idun ketchup", "mills majones",
    "ris", "pasta", "havregryn",
  ];

  let totalProducts = 0;
  let totalPrices = 0;

  for (const query of searches) {
    console.log(`Searching: "${query}"...`);
    const products = await fetchProducts(query, 5);
    console.log(`  Found ${products.length} products`);

    for (const kp of products) {
      if (!kp.ean) continue;

      try {
        const product = await prisma.product.upsert({
          where: { ean: kp.ean },
          update: {
            name: kp.name,
            brand: kp.brand,
            vendor: kp.vendor,
            imageUrl: kp.image,
            category: kp.category?.[0]?.name ?? null,
          },
          create: {
            ean: kp.ean,
            name: kp.name,
            brand: kp.brand,
            vendor: kp.vendor,
            imageUrl: kp.image,
            category: kp.category?.[0]?.name ?? null,
          },
        });
        totalProducts++;

        // Save current price
        // API returns current_price as a number, store as separate field
        const priceVal = typeof kp.current_price === "number" ? kp.current_price : null;
        const storeName = kp.store?.name;
        if (priceVal != null && storeName) {
          const chainName = normalizeChain(storeName);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          try {
            await prisma.price.upsert({
              where: {
                productId_chain_date: {
                  productId: product.id,
                  chain: chainName,
                  date: today,
                },
              },
              update: { price: priceVal },
              create: {
                productId: product.id,
                chain: chainName,
                price: priceVal,
                date: today,
              },
            });
            totalPrices++;
          } catch {}

          // Save price history
          if (kp.price_history && Array.isArray(kp.price_history)) {
            for (const ph of kp.price_history) {
              if (typeof ph.price !== "number") continue;
              const phDate = new Date(ph.date);
              phDate.setHours(0, 0, 0, 0);
              try {
                await prisma.price.upsert({
                  where: {
                    productId_chain_date: {
                      productId: product.id,
                      chain: chainName,
                      date: phDate,
                    },
                  },
                  update: { price: ph.price },
                  create: {
                    productId: product.id,
                    chain: chainName,
                    price: ph.price,
                    date: phDate,
                  },
                });
                totalPrices++;
              } catch {}
            }
          }
        }
      } catch (e: any) {
        console.error(`  Error saving ${kp.ean}: ${e.message}`);
      }
    }

    // Rate limit: wait 1.1s between searches
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log(`\nDone! Added/updated:`);
  console.log(`  ${totalProducts} products`);
  console.log(`  ${totalPrices} price records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
