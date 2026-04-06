/**
 * Seed script for Turso database.
 * Copies all data from local SQLite to Turso.
 */
import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import path from "node:path";

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
const localDb = new Database(path.join(process.cwd(), "prisma", "hvakosta.db"));

async function main() {
  console.log("Syncing local SQLite → Turso...\n");

  // Clear Turso tables
  await turso.batch([
    "DELETE FROM prices",
    "DELETE FROM products",
  ]);
  console.log("Cleared Turso tables.");

  // Copy products
  const products = localDb.prepare("SELECT * FROM products").all() as any[];
  console.log(`Copying ${products.length} products...`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await turso.batch(
      batch.map((p) => ({
        sql: "INSERT INTO products (id, ean, name, brand, vendor, image_url, category, search_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [p.id, p.ean, p.name, p.brand, p.vendor, p.image_url, p.category, p.search_count, p.created_at, p.updated_at],
      }))
    );
  }
  console.log(`  ✓ ${products.length} products copied.`);

  // Copy prices in larger batches
  const priceCount = localDb.prepare("SELECT COUNT(*) as c FROM prices").get() as any;
  console.log(`Copying ${priceCount.c} prices...`);

  const PRICE_BATCH = 200;
  let offset = 0;
  let copied = 0;

  while (true) {
    const prices = localDb.prepare("SELECT * FROM prices ORDER BY id LIMIT ? OFFSET ?").all(PRICE_BATCH, offset) as any[];
    if (prices.length === 0) break;

    await turso.batch(
      prices.map((p) => ({
        sql: "INSERT INTO prices (id, product_id, chain, price, date, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [p.id, p.product_id, p.chain, p.price, p.date, p.created_at],
      }))
    );

    copied += prices.length;
    offset += PRICE_BATCH;

    if (copied % 2000 === 0 || prices.length < PRICE_BATCH) {
      console.log(`  ${copied} / ${priceCount.c} prices...`);
    }
  }

  console.log(`  ✓ ${copied} prices copied.`);

  // Verify
  const tProducts = await turso.execute("SELECT COUNT(*) as c FROM products");
  const tPrices = await turso.execute("SELECT COUNT(*) as c FROM prices");
  console.log(`\nTurso now has:`);
  console.log(`  ${tProducts.rows[0].c} products`);
  console.log(`  ${tPrices.rows[0].c} prices`);
  console.log("\nDone! ✓");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
