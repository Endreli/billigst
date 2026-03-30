import Link from "next/link";

interface ProductCardProps {
  ean: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  chain: string | null;
}

export function ProductCard({ ean, name, brand, imageUrl, currentPrice, chain }: ProductCardProps) {
  return (
    <Link
      href={`/produkt/${ean}`}
      className="bg-surface border border-border rounded-xl p-4 hover:border-gray-600 transition-colors block"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-surface-hover rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl">📦</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {brand && <div className="text-xs text-gray-500 uppercase">{brand}</div>}
          <div className="text-white font-medium text-sm truncate">{name}</div>
          <div className="flex items-baseline gap-2 mt-1">
            {currentPrice != null && (
              <span className="text-white font-bold">{currentPrice.toFixed(2)} kr</span>
            )}
            {chain && <span className="text-xs text-gray-500">{chain}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
