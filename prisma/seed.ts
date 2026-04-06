import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "prisma", "hvakosta.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// ============================================================================
// Norwegian grocery products with realistic historical pricing
// ============================================================================
interface ProductSeed {
  ean: string;
  name: string;
  brand: string;
  vendor: string;
  category: string;
  basePrices: { chain: string; price2015: number; price2026: number }[];
}

const PRODUCTS: ProductSeed[] = [
  {
    ean: "7038010000539",
    name: "Lettmelk 1L",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Meieriprodukter",
    basePrices: [
      { chain: "Rema 1000", price2015: 14.90, price2026: 23.90 },
      { chain: "Kiwi", price2015: 14.90, price2026: 23.90 },
      { chain: "Coop Extra", price2015: 15.50, price2026: 24.90 },
      { chain: "Meny", price2015: 16.50, price2026: 25.90 },
    ],
  },
  {
    ean: "7038010000546",
    name: "Helmelk 1L",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Meieriprodukter",
    basePrices: [
      { chain: "Rema 1000", price2015: 15.90, price2026: 25.90 },
      { chain: "Kiwi", price2015: 15.90, price2026: 25.50 },
      { chain: "Coop Extra", price2015: 16.50, price2026: 26.90 },
      { chain: "Meny", price2015: 17.50, price2026: 27.90 },
    ],
  },
  {
    ean: "7037203626162",
    name: "Norvegia 1kg",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Ost",
    basePrices: [
      { chain: "Rema 1000", price2015: 79.90, price2026: 139.90 },
      { chain: "Kiwi", price2015: 79.90, price2026: 139.90 },
      { chain: "Coop Extra", price2015: 84.90, price2026: 144.90 },
      { chain: "Meny", price2015: 89.90, price2026: 149.90 },
    ],
  },
  {
    ean: "7038010009167",
    name: "Smør 500g",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Meieriprodukter",
    basePrices: [
      { chain: "Rema 1000", price2015: 34.90, price2026: 64.90 },
      { chain: "Kiwi", price2015: 34.90, price2026: 64.90 },
      { chain: "Coop Extra", price2015: 36.90, price2026: 66.90 },
      { chain: "Meny", price2015: 39.90, price2026: 69.90 },
    ],
  },
  {
    ean: "7020097400033",
    name: "Grandiosa Original",
    brand: "Grandiosa",
    vendor: "Orkla Foods",
    category: "Ferdigmat",
    basePrices: [
      { chain: "Rema 1000", price2015: 32.90, price2026: 59.90 },
      { chain: "Kiwi", price2015: 32.90, price2026: 59.90 },
      { chain: "Coop Extra", price2015: 35.90, price2026: 62.90 },
      { chain: "Meny", price2015: 37.90, price2026: 64.90 },
      { chain: "Spar", price2015: 36.90, price2026: 62.90 },
    ],
  },
  {
    ean: "7622210100610",
    name: "Kvikk Lunsj 3-pack",
    brand: "Kvikk Lunsj",
    vendor: "Mondelez",
    category: "Sjokolade",
    basePrices: [
      { chain: "Rema 1000", price2015: 29.90, price2026: 51.90 },
      { chain: "Kiwi", price2015: 29.90, price2026: 49.90 },
      { chain: "Coop Extra", price2015: 32.90, price2026: 54.90 },
      { chain: "Meny", price2015: 34.90, price2026: 56.90 },
    ],
  },
  {
    ean: "7035620001277",
    name: "Kneippbrød Grovt",
    brand: "Bakers",
    vendor: "Bakers AS",
    category: "Brød",
    basePrices: [
      { chain: "Rema 1000", price2015: 22.90, price2026: 42.90 },
      { chain: "Kiwi", price2015: 22.90, price2026: 42.90 },
      { chain: "Coop Extra", price2015: 24.90, price2026: 44.90 },
      { chain: "Meny", price2015: 26.90, price2026: 46.90 },
      { chain: "Joker", price2015: 27.90, price2026: 47.90 },
    ],
  },
  {
    ean: "7039610000127",
    name: "Egg Frittgående 12-pack",
    brand: "Prior",
    vendor: "Nortura",
    category: "Egg",
    basePrices: [
      { chain: "Rema 1000", price2015: 34.90, price2026: 62.90 },
      { chain: "Kiwi", price2015: 34.90, price2026: 61.90 },
      { chain: "Coop Extra", price2015: 36.90, price2026: 64.90 },
      { chain: "Meny", price2015: 38.90, price2026: 66.90 },
    ],
  },
  {
    ean: "7048840000364",
    name: "Lofoten Fiskeburger 4stk",
    brand: "Lofoten",
    vendor: "Lofoten AS",
    category: "Fisk",
    basePrices: [
      { chain: "Rema 1000", price2015: 39.90, price2026: 69.90 },
      { chain: "Kiwi", price2015: 39.90, price2026: 69.90 },
      { chain: "Meny", price2015: 44.90, price2026: 74.90 },
    ],
  },
  {
    ean: "7038010056710",
    name: "Yoghurt Skogsbær",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Meieriprodukter",
    basePrices: [
      { chain: "Rema 1000", price2015: 11.90, price2026: 21.90 },
      { chain: "Kiwi", price2015: 11.90, price2026: 21.90 },
      { chain: "Coop Extra", price2015: 12.90, price2026: 22.90 },
      { chain: "Meny", price2015: 13.90, price2026: 23.90 },
    ],
  },
  {
    ean: "7032069000019",
    name: "Appelsinjuice 1.5L",
    brand: "Tropicana",
    vendor: "Tropicana",
    category: "Drikke",
    basePrices: [
      { chain: "Rema 1000", price2015: 27.90, price2026: 49.90 },
      { chain: "Kiwi", price2015: 27.90, price2026: 49.90 },
      { chain: "Coop Extra", price2015: 29.90, price2026: 51.90 },
      { chain: "Meny", price2015: 32.90, price2026: 54.90 },
    ],
  },
  {
    ean: "7038010068552",
    name: "Rømme Lett 300g",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Meieriprodukter",
    basePrices: [
      { chain: "Rema 1000", price2015: 15.90, price2026: 28.90 },
      { chain: "Kiwi", price2015: 15.90, price2026: 28.90 },
      { chain: "Coop Extra", price2015: 17.90, price2026: 29.90 },
      { chain: "Meny", price2015: 18.90, price2026: 31.90 },
    ],
  },
  {
    ean: "7090007080021",
    name: "Kyllingfilet 700g",
    brand: "Solvinge",
    vendor: "Nortura",
    category: "Kjøtt",
    basePrices: [
      { chain: "Rema 1000", price2015: 64.90, price2026: 109.90 },
      { chain: "Kiwi", price2015: 64.90, price2026: 109.90 },
      { chain: "Coop Extra", price2015: 69.90, price2026: 114.90 },
      { chain: "Meny", price2015: 74.90, price2026: 119.90 },
    ],
  },
  {
    ean: "7037204310005",
    name: "Jarlsberg Skivet 150g",
    brand: "Jarlsberg",
    vendor: "TINE SA",
    category: "Ost",
    basePrices: [
      { chain: "Rema 1000", price2015: 27.90, price2026: 49.90 },
      { chain: "Kiwi", price2015: 27.90, price2026: 49.90 },
      { chain: "Coop Extra", price2015: 29.90, price2026: 51.90 },
      { chain: "Meny", price2015: 31.90, price2026: 54.90 },
    ],
  },
  {
    ean: "7310865068842",
    name: "Coca-Cola 1.5L",
    brand: "Coca-Cola",
    vendor: "Coca-Cola Europacific Partners",
    category: "Brus",
    basePrices: [
      { chain: "Rema 1000", price2015: 19.90, price2026: 34.90 },
      { chain: "Kiwi", price2015: 19.90, price2026: 34.90 },
      { chain: "Coop Extra", price2015: 21.90, price2026: 36.90 },
      { chain: "Meny", price2015: 23.90, price2026: 38.90 },
    ],
  },
  {
    ean: "7090006990010",
    name: "Kjøttdeig 400g",
    brand: "Gilde",
    vendor: "Nortura",
    category: "Kjøtt",
    basePrices: [
      { chain: "Rema 1000", price2015: 39.90, price2026: 72.90 },
      { chain: "Kiwi", price2015: 39.90, price2026: 72.90 },
      { chain: "Coop Extra", price2015: 42.90, price2026: 75.90 },
      { chain: "Meny", price2015: 44.90, price2026: 79.90 },
      { chain: "Bunnpris", price2015: 45.90, price2026: 78.90 },
    ],
  },
  {
    ean: "7038010058592",
    name: "Fløte 3dl",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Meieriprodukter",
    basePrices: [
      { chain: "Rema 1000", price2015: 17.90, price2026: 32.90 },
      { chain: "Kiwi", price2015: 17.90, price2026: 32.90 },
      { chain: "Coop Extra", price2015: 19.90, price2026: 34.90 },
      { chain: "Meny", price2015: 20.90, price2026: 35.90 },
    ],
  },
  {
    ean: "7040518400010",
    name: "Laks Fersk 400g",
    brand: "Lerøy",
    vendor: "Lerøy Seafood",
    category: "Fisk",
    basePrices: [
      { chain: "Rema 1000", price2015: 59.90, price2026: 119.90 },
      { chain: "Kiwi", price2015: 59.90, price2026: 119.90 },
      { chain: "Meny", price2015: 69.90, price2026: 129.90 },
    ],
  },
  {
    ean: "7035620040016",
    name: "Polarbrød Original",
    brand: "Polarbrød",
    vendor: "Polarbrød AB",
    category: "Brød",
    basePrices: [
      { chain: "Rema 1000", price2015: 24.90, price2026: 44.90 },
      { chain: "Kiwi", price2015: 24.90, price2026: 44.90 },
      { chain: "Coop Extra", price2015: 26.90, price2026: 46.90 },
      { chain: "Meny", price2015: 28.90, price2026: 49.90 },
    ],
  },
  {
    ean: "7040110050010",
    name: "Bacon Skivet 140g",
    brand: "Gilde",
    vendor: "Nortura",
    category: "Kjøtt",
    basePrices: [
      { chain: "Rema 1000", price2015: 25.90, price2026: 46.90 },
      { chain: "Kiwi", price2015: 25.90, price2026: 46.90 },
      { chain: "Coop Extra", price2015: 27.90, price2026: 48.90 },
      { chain: "Meny", price2015: 29.90, price2026: 49.90 },
    ],
  },
  {
    ean: "7038010043338",
    name: "Kulturmelk 1L",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Meieriprodukter",
    basePrices: [
      { chain: "Rema 1000", price2015: 15.90, price2026: 27.90 },
      { chain: "Kiwi", price2015: 15.90, price2026: 27.90 },
      { chain: "Coop Extra", price2015: 16.90, price2026: 28.90 },
      { chain: "Meny", price2015: 18.90, price2026: 29.90 },
    ],
  },
  {
    ean: "7622300748012",
    name: "Freia Melkesjokolade 200g",
    brand: "Freia",
    vendor: "Mondelez",
    category: "Sjokolade",
    basePrices: [
      { chain: "Rema 1000", price2015: 25.90, price2026: 46.90 },
      { chain: "Kiwi", price2015: 25.90, price2026: 46.90 },
      { chain: "Coop Extra", price2015: 27.90, price2026: 48.90 },
      { chain: "Meny", price2015: 29.90, price2026: 51.90 },
    ],
  },
  {
    ean: "7041110101106",
    name: "Wienerpølser 10pk",
    brand: "Gilde",
    vendor: "Nortura",
    category: "Kjøtt",
    basePrices: [
      { chain: "Rema 1000", price2015: 27.90, price2026: 49.90 },
      { chain: "Kiwi", price2015: 27.90, price2026: 49.90 },
      { chain: "Coop Extra", price2015: 29.90, price2026: 51.90 },
      { chain: "Meny", price2015: 31.90, price2026: 54.90 },
    ],
  },
  {
    ean: "7020655400010",
    name: "Idun Ketchup 500g",
    brand: "Idun",
    vendor: "Orkla Foods",
    category: "Sauser",
    basePrices: [
      { chain: "Rema 1000", price2015: 22.90, price2026: 39.90 },
      { chain: "Kiwi", price2015: 22.90, price2026: 39.90 },
      { chain: "Coop Extra", price2015: 24.90, price2026: 41.90 },
      { chain: "Meny", price2015: 25.90, price2026: 42.90 },
    ],
  },
  {
    ean: "7038010055980",
    name: "Brunost G35 500g",
    brand: "TINE",
    vendor: "TINE SA",
    category: "Ost",
    basePrices: [
      { chain: "Rema 1000", price2015: 54.90, price2026: 94.90 },
      { chain: "Kiwi", price2015: 54.90, price2026: 94.90 },
      { chain: "Coop Extra", price2015: 57.90, price2026: 97.90 },
      { chain: "Meny", price2015: 59.90, price2026: 99.90 },
    ],
  },
];

// ============================================================================
// Generate price history with realistic patterns
// ============================================================================
/** Round to realistic Norwegian grocery price (e.g. 24.90, 119.90, 32.50) */
function roundToNorwegianPrice(raw: number): number {
  if (raw < 20) {
    // Small items: round to nearest .50 or .90
    const base = Math.floor(raw);
    const frac = raw - base;
    return frac < 0.3 ? base - 0.10 : frac < 0.7 ? base + 0.50 : base + 0.90;
  }
  // Larger items: round to nearest .90
  return Math.round(raw) - 0.10;
}

function generatePriceHistory(
  basePrice: number,
  finalPrice: number,
): { date: Date; price: number }[] {
  const points: { date: Date; price: number }[] = [];
  const startDate = new Date(2015, 0, 1);
  const endDate = new Date(2026, 2, 31);

  const totalMonths = (2026 - 2015) * 12 + 3;
  const totalIncrease = finalPrice - basePrice;

  const current = new Date(startDate);
  let lastPrice = roundToNorwegianPrice(basePrice);

  while (current <= endDate) {
    const monthsSinceStart =
      (current.getFullYear() - 2015) * 12 + current.getMonth();

    // S-curve: slow 2015-2019, accelerating 2021-2023 (inflation spike), leveling 2024+
    const t = monthsSinceStart / totalMonths;
    const progression = 1 / (1 + Math.exp(-8 * (t - 0.55)));
    const targetPrice = basePrice + totalIncrease * progression;
    const rounded = roundToNorwegianPrice(targetPrice);

    // Price changes happen in steps (not every week) — realistic behavior
    // Only update if the rounded price actually changed
    if (rounded !== lastPrice) {
      lastPrice = rounded;
    }

    points.push({
      date: new Date(current),
      price: lastPrice,
    });

    // Advance 5-9 days (roughly weekly data)
    current.setDate(current.getDate() + 5 + Math.floor(Math.random() * 5));
  }

  return points;
}

// ============================================================================
// Main seed function
// ============================================================================
async function main() {
  console.log("Seeding HvaKosta database...\n");

  // Clear existing data
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();

  // --- Products & Prices ---
  let totalPrices = 0;
  for (const p of PRODUCTS) {
    console.log(`Creating ${p.name} (${p.ean})...`);
    const product = await prisma.product.create({
      data: {
        ean: p.ean,
        name: p.name,
        brand: p.brand,
        vendor: p.vendor,
        category: p.category,
      },
    });

    // Batch all prices for this product
    const allPrices: { productId: number; chain: string; price: number; date: Date }[] = [];
    for (const chainPrice of p.basePrices) {
      const history = generatePriceHistory(chainPrice.price2015, chainPrice.price2026);
      for (const h of history) {
        allPrices.push({
          productId: product.id,
          chain: chainPrice.chain,
          price: h.price,
          date: h.date,
        });
      }
    }
    await prisma.price.createMany({ data: allPrices });
    totalPrices += allPrices.length;
    console.log(`  ${p.basePrices.length} chains, ${allPrices.length} prices.`);
  }

  console.log(`\nDone! Created:`);
  console.log(`  ${PRODUCTS.length} products`);
  console.log(`  ${totalPrices} price records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
