-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ean" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "vendor" TEXT,
    "image_url" TEXT,
    "category" TEXT,
    "search_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_products" ("brand", "category", "created_at", "ean", "id", "image_url", "name", "updated_at", "vendor") SELECT "brand", "category", "created_at", "ean", "id", "image_url", "name", "updated_at", "vendor" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_ean_key" ON "products"("ean");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
