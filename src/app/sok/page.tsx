import { SearchBar } from "@/components/search-bar";
import { RecentSearches } from "@/components/recent-searches";
import { ProductCard } from "@/components/product-card";
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

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`,
    { cache: "no-store" }
  );
  const data = await res.json();

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
