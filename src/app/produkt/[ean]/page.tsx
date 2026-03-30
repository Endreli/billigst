import { PriceChart } from "@/components/price-chart";
import { StorePrices } from "@/components/store-prices";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ ean: string }>;
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { ean } = await params;
  const product = await getProduct(ean);

  if (!product) notFound();

  const cheapest = product.latestPrices.length > 0
    ? Math.min(...product.latestPrices.map((p: any) => Number(p.price)))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="w-28 h-28 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-4xl">📦</span>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">
            {[product.vendor, product.brand].filter(Boolean).join(" / ")}
          </div>
          <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          {cheapest != null && (
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-bold text-white">{cheapest.toFixed(2)} kr</span>
            </div>
          )}
        </div>
      </div>
      <PriceChart ean={ean} />
      {product.latestPrices.length > 0 && (
        <StorePrices
          prices={product.latestPrices.map((p: any) => ({
            chain: p.chain, price: Number(p.price), date: p.date,
          }))}
        />
      )}
    </div>
  );
}
