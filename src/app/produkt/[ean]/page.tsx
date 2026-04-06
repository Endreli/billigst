import { PriceChart } from "@/components/price-chart";
import { StorePrices } from "@/components/store-prices";
import { AddToBasketButton } from "@/components/add-to-basket-button";
import { BackButton } from "@/components/back-button";
import { formatKr, formatDate } from "@/lib/format";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ ean: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { ean } = await params;
  const product = await getProduct(ean);
  if (!product) return { title: "Produkt ikke funnet — Billigst" };

  const cheapest = product.latestPrices.length > 0
    ? Math.min(...product.latestPrices.map((p: any) => Number(p.price)))
    : null;

  return {
    title: `${product.name} — ${cheapest ? formatKr(cheapest) : "Pris"} | Billigst`,
    description: `Sammenlign priser for ${product.name} på tvers av norske dagligvarekjeder. ${cheapest ? `Billigst: ${formatKr(cheapest)}.` : ""} Se prishistorikk og finn beste tilbud.`,
    openGraph: {
      title: `${product.name} — ${cheapest ? formatKr(cheapest) : "Pris"} | Billigst`,
      description: `Sammenlign priser for ${product.name} på tvers av norske dagligvarekjeder.`,
    },
  };
}

async function getProduct(ean: string) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products/${ean}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

function getFallbackEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("melk") || n.includes("fløte") || n.includes("rømme") || n.includes("yoghurt")) return "🥛";
  if (n.includes("ost") || n.includes("norvegia") || n.includes("jarlsberg") || n.includes("brunost")) return "🧀";
  if (n.includes("egg")) return "🥚";
  if (n.includes("brød") || n.includes("kneipp") || n.includes("polarbrød")) return "🍞";
  if (n.includes("kjøtt") || n.includes("bacon") || n.includes("pølse") || n.includes("kylling")) return "🥩";
  if (n.includes("laks") || n.includes("fisk")) return "🐟";
  if (n.includes("pizza") || n.includes("grandiosa")) return "🍕";
  if (n.includes("sjokolade") || n.includes("kvikk") || n.includes("freia")) return "🍫";
  if (n.includes("juice") || n.includes("cola") || n.includes("brus")) return "🥤";
  if (n.includes("ketchup")) return "🍅";
  if (n.includes("smør")) return "🧈";
  return "🛒";
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { ean } = await params;
  const product = await getProduct(ean);

  if (!product) notFound();

  const prices = product.latestPrices.map((p: any) => Number(p.price));
  const cheapest = prices.length > 0 ? Math.min(...prices) : null;
  const mostExpensive = prices.length > 0 ? Math.max(...prices) : null;
  const storeCount = product.latestPrices.length;

  return (
    <div className="space-y-6">
      <BackButton />

      {/* Product header */}
      <div className="flex gap-5">
        <div className="w-28 h-28 bg-surface rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-5xl">{getFallbackEmoji(product.name)}</span>
          )}
        </div>
        <div className="flex-1">
          {product.category && (
            <span className="inline-block bg-primary/15 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1">
              {product.category}
            </span>
          )}
          <div className="text-[13px] text-text-muted uppercase">
            {[product.vendor, product.brand].filter(Boolean).join(" / ")}
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">{product.name}</h1>
          {cheapest != null && (
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-primary">{formatKr(cheapest)}</span>
              {mostExpensive != null && mostExpensive !== cheapest && (
                <span className="text-[15px] text-text-muted line-through">{formatKr(mostExpensive)}</span>
              )}
            </div>
          )}
          {storeCount > 0 && (
            <div className="text-[13px] text-text-muted mt-1">
              Tilgjengelig i {storeCount} {storeCount === 1 ? "butikkjede" : "butikkjeder"}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      {cheapest != null && mostExpensive != null && mostExpensive !== cheapest && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-primary text-lg font-bold">{formatKr(cheapest)}</div>
            <div className="text-text-muted text-[12px] mt-0.5">Billigste pris</div>
          </div>
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-white text-lg font-bold">{formatKr(mostExpensive - cheapest)}</div>
            <div className="text-text-muted text-[12px] mt-0.5">Prisforskjell</div>
          </div>
        </div>
      )}

      {/* Product info card */}
      <div className="bg-surface rounded-xl p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide">Produktinformasjon</h2>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[14px]">
          {product.brand && (
            <>
              <span className="text-text-muted">Merke</span>
              <span className="text-white font-medium">{product.brand}</span>
            </>
          )}
          {product.vendor && (
            <>
              <span className="text-text-muted">Leverandør</span>
              <span className="text-white font-medium">{product.vendor}</span>
            </>
          )}
          {product.category && (
            <>
              <span className="text-text-muted">Kategori</span>
              <span className="text-white font-medium">{product.category}</span>
            </>
          )}
          <span className="text-text-muted">Strekkode</span>
          <span className="text-white font-medium font-mono text-[13px]">{ean}</span>
        </div>
      </div>

      <AddToBasketButton
        ean={ean}
        name={product.name}
        brand={product.brand}
        imageUrl={product.imageUrl}
      />

      <PriceChart ean={ean} />

      {product.latestPrices.length > 0 && (
        <>
          <StorePrices
            prices={product.latestPrices.map((p: any) => ({
              chain: p.chain, price: Number(p.price), date: p.date,
            }))}
          />
          {(() => {
            const dates = product.latestPrices.map((p: any) => p.date).filter(Boolean);
            const latest = dates.length > 0
              ? dates.sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())[0]
              : null;
            return latest ? (
              <p className="text-text-muted text-[12px] text-center -mt-3">
                Priser oppdatert {formatDate(latest)}
              </p>
            ) : null;
          })()}
        </>
      )}
    </div>
  );
}
