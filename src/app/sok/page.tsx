import { SearchBar } from "@/components/search-bar";
import { RecentSearches } from "@/components/recent-searches";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/db";
import { searchProducts as kassalSearch } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q;
  if (!q) return { title: "Søk — Billigst" };
  return {
    title: `"${q}" — Søk | Billigst`,
    description: `Søkeresultater for "${q}" — sammenlign priser på tvers av norske dagligvarekjeder.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1");

  if (!query) {
    return (
      <div className="space-y-6">
        <SearchBar />
        <RecentSearches />
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b92a8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-text-muted text-[15px]">Skriv inn et produktnavn for å søke</p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {["Melk", "Ost", "Brød", "Kjøtt", "Fisk", "Egg", "Juice", "Pizza"].map((term) => (
              <a
                key={term}
                href={`/sok?q=${encodeURIComponent(term)}`}
                className="bg-surface-hover border border-border px-4 py-2.5 rounded-full text-[13px] text-text-muted hover:text-white hover:border-primary/30 transition-colors active:scale-95"
              >
                {term}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const limit = 20;
  const offset = (page - 1) * limit;
  const searchTerm = `%${query}%`;

  const dbProducts = await prisma.$queryRawUnsafe<
    { id: number; ean: string; name: string; brand: string | null; vendor: string | null; image_url: string | null; search_count: number }[]
  >(
    `SELECT id, ean, name, brand, vendor, image_url, search_count,
      CASE
        WHEN LOWER(name) = LOWER(?) THEN 100
        WHEN LOWER(name) LIKE LOWER(? || '%') THEN 80
        WHEN LOWER(name) LIKE LOWER('%' || ? || '%') THEN 60
        WHEN LOWER(brand) LIKE LOWER('%' || ? || '%') THEN 40
        WHEN LOWER(vendor) LIKE LOWER('%' || ? || '%') THEN 30
        WHEN LOWER(category) LIKE LOWER('%' || ? || '%') THEN 20
        ELSE 10
      END as relevance
    FROM products
    WHERE LOWER(name) LIKE LOWER(?)
       OR LOWER(brand) LIKE LOWER(?)
       OR LOWER(vendor) LIKE LOWER(?)
       OR LOWER(category) LIKE LOWER(?)
    ORDER BY relevance DESC, search_count DESC, name ASC
    LIMIT ? OFFSET ?`,
    query, query, query, query, query, query,
    searchTerm, searchTerm, searchTerm, searchTerm,
    limit, offset
  );

  let data: { products: any[] };

  if (dbProducts.length > 0) {
    const productIds = dbProducts.map((p) => p.id);
    const placeholders = productIds.map(() => "?").join(",");

    const prices = await prisma.$queryRawUnsafe<
      { product_id: number; chain: string; price: number }[]
    >(
      `SELECT product_id, chain, price FROM (
        SELECT product_id, chain, price,
          ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY date DESC) as rn
        FROM prices
        WHERE product_id IN (${placeholders})
      ) WHERE rn = 1`,
      ...productIds
    );

    const priceMap = new Map<number, { price: number; chain: string }>();
    for (const p of prices) {
      priceMap.set(p.product_id, { price: Number(p.price), chain: p.chain });
    }

    // Increment search count (fire-and-forget)
    prisma.$queryRawUnsafe(
      `UPDATE products SET search_count = search_count + 1 WHERE id IN (${placeholders})`,
      ...productIds
    ).catch(() => {});

    data = {
      products: dbProducts.map((p) => {
        const priceInfo = priceMap.get(p.id);
        return {
          ean: p.ean,
          name: p.name,
          brand: p.brand,
          vendor: p.vendor,
          imageUrl: p.image_url,
          currentPrice: priceInfo?.price ?? null,
          chain: priceInfo?.chain ?? null,
        };
      }),
    };
  } else {
    // Fall back to Kassalapp API
    try {
      const kassalResult = await kassalSearch(query, page, limit);

      // Save found products to DB for future searches (fire-and-forget)
      for (const kp of kassalResult.data) {
        if (kp.ean) {
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

            const priceVal = typeof kp.current_price === "number" ? kp.current_price : null;
            const storeName = kp.store?.name;
            if (priceVal != null && storeName) {
              const chainName = normalizeChain(storeName);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
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
              }).catch(() => {});
            }
          } catch {
            // Skip individual product save errors
          }
        }
      }

      data = {
        products: kassalResult.data
          .filter((kp: any) => kp.ean)
          .map((kp: any) => ({
            ean: kp.ean,
            name: kp.name,
            brand: kp.brand,
            vendor: kp.vendor,
            imageUrl: kp.image,
            currentPrice: typeof kp.current_price === "number" ? kp.current_price : null,
            chain: kp.store?.name ? normalizeChain(kp.store.name) : null,
          })),
      };
    } catch {
      data = { products: [] };
    }
  }

  return (
    <div className="space-y-4">
      <SearchBar defaultValue={query} />
      <div className="flex items-center justify-between">
        <p className="text-[15px] text-text-muted">
          {data.products.length > 0
            ? `${data.products.length} resultater for "${query}"`
            : `Ingen resultater for "${query}"`}
        </p>
      </div>
      {data.products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-[15px]">Prøv et annet søkeord</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.products.map((p: any) => (
            <ProductCard key={p.ean} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
