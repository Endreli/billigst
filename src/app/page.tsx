import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
import { TrendingList } from "@/components/trending-list";
import { PopularProducts } from "@/components/popular-products";
import { BasketPreview } from "@/components/basket-preview";
import Link from "next/link";

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
      {/* Hero — search first */}
      <div className="text-center pt-6 pb-1">
        <h1 className="text-3xl font-bold text-white mb-1">
          Spar penger på mathandelen
        </h1>
        <p className="text-[15px] text-text-muted mb-5">
          Sammenlign priser fra alle norske dagligvarekjeder
        </p>
        <div className="max-w-lg mx-auto">
          <SearchBar />
        </div>
        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] text-text-muted uppercase tracking-wider">Populære søk</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {["Grandiosa", "Melk", "Kvikk Lunsj", "Norvegia", "Egg"].map((term) => (
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

      {/* Handlekurv — shows live preview if items exist, otherwise static CTA */}
      <BasketPreview />
      <Link
        href="/handlekurv"
        className="block bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/25 rounded-card p-5 hover:border-primary/40 transition-all group press-scale"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-[15px]">Sammenlign handlekurven din</div>
            <div className="text-text-muted text-[13px] mt-0.5">
              Legg til varer og se hvilken butikk som er billigst
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b92a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform flex-shrink-0">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </Link>

      {/* How it works */}
      <div className="bg-surface rounded-card p-5">
        <h3 className="text-[13px] text-text-muted uppercase tracking-wider mb-4">Slik fungerer det</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: 1, title: "Søk og legg til varer", desc: "Finn produktene du trenger i handlekurven din" },
            { step: 2, title: "Vi sammenligner priser", desc: "Prisene sjekkes mot alle norske dagligvarekjeder" },
            { step: 3, title: "Se billigste butikk", desc: "Du får oversikt over hvor du sparer mest" },
          ].map((item) => (
            <div key={item.step} className="flex md:flex-col items-start md:items-center gap-3 md:text-center">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <div>
                <div className="text-white text-[14px] font-medium">{item.title}</div>
                <div className="text-text-muted text-[13px] mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular products */}
      <div className="bg-surface rounded-card p-5 space-y-3">
        <h3 className="text-[13px] text-text-muted uppercase tracking-wider">Populære varer</h3>
        <PopularProducts />
      </div>

      {trendingData && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Størst prisøkning"
              value={trendingData.trending[0] ? `+${trendingData.trending[0].change.toFixed(0)} kr` : "--"}
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
