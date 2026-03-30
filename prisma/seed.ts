import { PrismaClient } from "@prisma/client";
import { fetchCpiData } from "../src/lib/ssb";
import { searchProducts, getPricesBulk } from "../src/lib/kassal";
import { normalizeChain } from "../src/lib/chains";

const prisma = new PrismaClient();

const SEED_QUERIES = ["melk", "brød", "ost", "pizza", "kjøtt", "fisk", "yoghurt", "juice", "smør", "egg"];

async function seedProducts() {
  console.log("Seeding products from Kassalapp...");
  let totalProducts = 0;
  const allEans: string[] = [];

  for (const query of SEED_QUERIES) {
    try {
      const result = await searchProducts(query, 1, 50);
      for (const kp of result.data) {
        if (!kp.ean) continue;
        await prisma.product.upsert({
          where: { ean: kp.ean },
          update: { name: kp.name, brand: kp.brand, vendor: kp.vendor, imageUrl: kp.image },
          create: { ean: kp.ean, name: kp.name, brand: kp.brand, vendor: kp.vendor, imageUrl: kp.image },
        });
        allEans.push(kp.ean);
        totalProducts++;
      }
      // Rate limit
      await new Promise((r) => setTimeout(r, 1100));
    } catch (e) {
      console.error(`Failed to seed "${query}":`, e);
    }
  }
  console.log(`Seeded ${totalProducts} products.`);

  // Fetch price history in bulk
  console.log("Fetching price history...");
  const products = await prisma.product.findMany({ select: { id: true, ean: true } });
  const eanToId = Object.fromEntries(products.map((p) => [p.ean, p.id]));
  let priceCount = 0;

  for (let i = 0; i < allEans.length; i += 100) {
    const batch = allEans.slice(i, i + 100);
    try {
      const result = await getPricesBulk(batch, 90);
      for (const item of result.data) {
        const productId = eanToId[item.ean];
        if (!productId) continue;
        for (const pe of item.prices) {
          const chain = normalizeChain(pe.store.name);
          await prisma.price.upsert({
            where: { productId_chain_date: { productId, chain, date: new Date(pe.date) } },
            update: { price: pe.price },
            create: { productId, chain, price: pe.price, date: new Date(pe.date) },
          });
          priceCount++;
        }
      }
      await new Promise((r) => setTimeout(r, 1100));
    } catch (e) {
      console.error(`Price batch failed:`, e);
    }
  }
  console.log(`Seeded ${priceCount} price entries.`);
}

async function seedCpi() {
  console.log("Seeding CPI data from SSB...");
  const cpiData = await fetchCpiData(2020);
  let cpiCount = 0;
  for (const entry of cpiData) {
    await prisma.cpiData.upsert({
      where: { year_month: { year: entry.year, month: entry.month } },
      update: { value: entry.value },
      create: { year: entry.year, month: entry.month, value: entry.value },
    });
    cpiCount++;
  }
  console.log(`Seeded ${cpiCount} CPI entries.`);
}

async function main() {
  await seedProducts();
  await seedCpi();
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
