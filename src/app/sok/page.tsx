import { SearchBar } from "@/components/search-bar";
import { ProductCard } from "@/components/product-card";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1");

  if (!query) {
    return (
      <div className="pt-8">
        <SearchBar />
        <p className="text-gray-500 text-center mt-8">Skriv inn et produktnavn for å søke.</p>
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
    <div className="space-y-6">
      <SearchBar defaultValue={query} />
      <p className="text-sm text-gray-500">
        Søkeresultater for &ldquo;{query}&rdquo;
      </p>
      {data.products.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Ingen produkter funnet for &ldquo;{query}&rdquo;
        </p>
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
