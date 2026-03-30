import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
import { TrendingList } from "@/components/trending-list";

async function getTrending() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/trending`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const trendingData = await getTrending();

  return (
    <div className="space-y-6">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-3xl font-bold mb-2">HvaKosta.no</h1>
        <p className="text-gray-500 text-sm mb-6">
          Se hva ting koster — og hva de kostet før
        </p>
        <div className="max-w-lg mx-auto">
          <SearchBar />
        </div>
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {["Grandiosa", "Melk", "Kvikk Lunsj", "Norvegia", "Smør"].map((term) => (
            <a
              key={term}
              href={`/sok?q=${encodeURIComponent(term)}`}
              className="bg-surface-hover border border-border px-3 py-1.5 rounded-full text-xs text-gray-400 hover:text-white transition-colors"
            >
              {term}
            </a>
          ))}
        </div>
      </div>

      {trendingData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="KPI siste måned"
              value={trendingData.stats.latestCpi ? `${Number(trendingData.stats.latestCpi.value).toFixed(1)}` : "—"}
              color="red"
            />
            <StatCard
              label="Mest økt (30d)"
              value={trendingData.trending[0] ? `${trendingData.trending[0].name} +${trendingData.trending[0].change.toFixed(0)} kr` : "—"}
            />
            <StatCard
              label="Produkter"
              value={trendingData.stats.productCount.toLocaleString("no-NO")}
              color="green"
            />
          </div>
          <TrendingList items={trendingData.trending} />
        </>
      )}
    </div>
  );
}
