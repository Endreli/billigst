"use client";

import Link from "next/link";
import { useBasketContext } from "@/components/basket-provider";
import { ProductImage } from "@/components/product-image";
import { formatKr } from "@/lib/format";

interface ProductCardProps {
  ean: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  chain: string | null;
}

export function ProductCard({ ean, name, brand, imageUrl, currentPrice, chain }: ProductCardProps) {
  const { addItem, hasItem } = useBasketContext();
  const inBasket = hasItem(ean);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ean, name, brand, imageUrl });
  }

  return (
    <div className="bg-surface border border-border rounded-card hover:border-primary/20 transition-colors relative group press-scale">
      <Link href={`/produkt/${ean}`} className="block p-5">
        <div className="flex gap-4">
          <ProductImage src={imageUrl} alt={name} size="lg" />
          <div className="flex-1 min-w-0">
            {brand && <div className="text-[13px] text-text-muted uppercase">{brand}</div>}
            <div className="text-white font-medium text-[15px] line-clamp-2">{name}</div>
            <div className="flex items-baseline gap-2 mt-1.5">
              {currentPrice != null && (
                <span className="text-white font-bold text-[15px]">{formatKr(currentPrice)}</span>
              )}
              {chain && <span className="text-[13px] text-text-muted">{chain}</span>}
            </div>
          </div>
        </div>
      </Link>
      <button
        onClick={handleAdd}
        className={`absolute top-4 right-4 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
          inBasket
            ? "bg-primary/15 text-primary"
            : "bg-surface-hover text-text-muted hover:text-primary hover:bg-primary/10 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
        title={inBasket ? "I handlekurven" : "Legg til i handlekurv"}
      >
        {inBasket ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>
    </div>
  );
}
