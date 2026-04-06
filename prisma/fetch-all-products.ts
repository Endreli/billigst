/**
 * Fetch products from Kassalapp and save ALL prices per chain.
 * Uses the free API (60 calls/min).
 */
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "prisma", "hvakosta.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const API_KEY = process.env.KASSAL_API_KEY || "VIYGpafHs3WFy7MbyHKXUjEKS1xyeFCeDtMpjck2";

const SEARCH_TERMS = [
  // Meieri
  "melk", "yoghurt", "ost", "smør", "fløte", "rømme", "brunost", "kremost",
  // Brød
  "brød", "lompe", "rundstykke", "knekkebrød", "polarbrød",
  // Kjøtt
  "kjøttdeig", "kylling", "svin", "biff", "pølse", "bacon", "lam",
  "karbonader", "kjøttboller", "leverpostei",
  // Fisk
  "laks", "torsk", "sei", "reker", "fiskepinner", "makrell", "tunfisk",
  // Pålegg
  "skinke", "salami", "kaviar", "nugatti", "syltetøy",
  // Frukt & grønt
  "banan", "eple", "appelsin", "tomat", "agurk", "paprika", "løk", "potet", "gulrot", "salat", "avokado",
  // Frossenvarer
  "pizza", "grandiosa", "findus", "frossen", "pommes", "is",
  // Drikke
  "cola", "fanta", "solo", "sprite", "juice", "vann", "saft",
  // Snacks
  "sjokolade", "chips", "potetgull", "nøtter", "godteri", "kvikk lunsj", "smash",
  // Frokost
  "havregryn", "cornflakes", "müsli", "egg",
  // Hermetikk
  "bønner", "mais", "erter", "tomatpuré",
  // Tørrvarer
  "pasta", "ris", "mel", "sukker",
  // Saus & krydder
  "ketchup", "sennep", "majones", "dressing", "taco",
  // Barnemat
  "barnemat", "grøt",
  // Husholdning
  "dopapir", "såpe", "tannkrem",
];

function normalizeChain(storeName: string): string {
  const s = storeName.toLowerCase();
  if (s.includes("kiwi")) return "Kiwi";
  if (s.includes("rema")) return "Rema 1000";
  if (s.includes("meny")) return "Meny";
  if (s.includes("coop extra") || s.includes("extra")) return "Coop Extra";
  if (s.includes("coop prix") || s.includes("prix")) return "Coop Prix";
  if (s.includes("coop mega") || s.includes("mega")) return "Coop Mega";
  if (s.includes("coop obs") || s.includes("obs")) return "Coop Obs";
  if (s.includes("spar")) return "Spar";
  if (s.includes("joker")) return "Joker";
  if (s.includes("bunnpris")) return "Bunnpris";
  if (s.includes("coop")) return "Coop Extra"; // Generic coop → Coop Extra
  return storeName;
}

// Only keep major Norwegian grocery chains
const VALID_CHAINS = new Set([
  "Kiwi", "Rema 1000", "Meny", "Coop Extra", "Coop Prix", "Coop Mega", "Coop Obs",
  "Spar", "Joker", "Bunnpris", "Oda",
]);

async function fetchPage(search: string, page: number): Promise<any[]> {
  const url = `https://kassal.app/api/v1/products?search=${encodeURIComponent(search)}&size=50&page=${page}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    if (res.status === 429) {
      console.log("  Rate limited, waiting 65s...");
      await new Promise(r => setTimeout(r, 65000));
      return fetchPage(search, page);
    }
    return [];
  }
  const data = await res.json();
  return data.data || [];
}

async function main() {
  console.log(`Fetching products from Kassalapp (${SEARCH_TERMS.length} terms)...\n`);

  let newProducts = 0;
  let newPrices = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < SEARCH_TERMS.length; i++) {
    const term = SEARCH_TERMS[i];
    process.stdout.write(`[${i + 1}/${SEARCH_TERMS.length}] "${term}"... `);

    let termPrices = 0;
    let termProducts = 0;

    // Fetch 2 pages (100 results) — each result may be the same EAN from a different store
    for (let page = 1; page <= 2; page++) {
      const results = await fetchPage(term, page);
      if (results.length === 0) break;

      for (const kp of results) {
        if (!kp.ean) continue;

        const storeName = kp.store?.name;
        if (!storeName) continue;

        const chain = normalizeChain(storeName);
        if (!VALID_CHAINS.has(chain)) continue;

        const price = typeof kp.current_price === "number" ? kp.current_price : null;
        if (price == null) continue;

        try {
          // Upsert product (keeps existing data, updates image if we get one)
          const product = await prisma.product.upsert({
            where: { ean: kp.ean },
            update: {
              ...(kp.image ? { imageUrl: kp.image } : {}),
              ...(kp.category?.[0]?.name ? { category: kp.category[0].name } : {}),
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

          if (product.createdAt.getTime() > Date.now() - 5000) {
            newProducts++;
            termProducts++;
          }

          // Save price for THIS specific chain
          await prisma.price.upsert({
            where: {
              productId_chain_date: {
                productId: product.id,
                chain,
                date: today,
              },
            },
            update: { price },
            create: { productId: product.id, chain, price, date: today },
          }).catch(() => {});

          newPrices++;
          termPrices++;
        } catch {
          // Skip errors
        }
      }

      await new Promise(r => setTimeout(r, 1100));
    }

    console.log(`${termProducts} new, ${termPrices} prices`);
  }

  // Final stats
  const totalProducts = await prisma.product.count();
  const totalPrices = await prisma.price.count();

  // Chain coverage
  const chainCoverage = await prisma.$queryRawUnsafe<{ chain: string; c: number }[]>(`
    SELECT chain, COUNT(DISTINCT product_id) as c
    FROM prices WHERE date >= ?
    GROUP BY chain ORDER BY c DESC
  `, today.toISOString());

  console.log(`\n========================================`);
  console.log(`Done!`);
  console.log(`  Total products: ${totalProducts}`);
  console.log(`  Total prices: ${totalPrices}`);
  console.log(`  New products: ${newProducts}`);
  console.log(`  New prices: ${newPrices}`);
  console.log(`\nToday's prices per chain:`);
  for (const r of chainCoverage) {
    console.log(`  ${r.chain}: ${r.c} products`);
  }
  console.log(`========================================`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
