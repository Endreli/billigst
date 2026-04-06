import path from "node:path";
import { defineConfig } from "prisma/config";

// Use Turso URL if available, otherwise local SQLite
const tursoUrl = process.env.TURSO_DATABASE_URL;
const dbPath = path.resolve(__dirname, "prisma", "hvakosta.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: tursoUrl || `file:${dbPath}`,
  },
});
