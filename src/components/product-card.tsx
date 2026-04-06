"use client";

import Link from "next/link";
import { useBasketContext } from "@/components/basket-provider";
import { ProductImage } from "@/components/product-image";
import { formatKr } from "@/lib/format";
import { useState } from "react";

interface ProductCardProps {
  ean: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  chain: string | null;
}

export function ProductCard({ ean, name, brand, imageUrl, currentPrice, chain }: ProductCardProps) {
  const { addItem, hasItem, removeItem, items } = useBasketContext();
  const inBasket = hasItem(ean);
  const item = items.find((i) => i.ean === ean);
  const [justAdded, setJustAdded] = useState(false);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inBasket) {
      removeItem(ean);
    } else {
      addItem({ ean, name, brand, imageUrl });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 600);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-card hover:border-primary/20 transition-colors relative group">
      {/* Tappable product info area → goes to detail page */}
      <Link href={`/produkt/${ean}`} className="block p-4">
        <div className="flex gap-3">
          <ProductImage src={imageUrl} alt={name} size="lg" />
          <div className="flex-1 min-w-0 pr-12">
            {brand && <div className="text-[12px] text-text-muted uppercase tracking-wide">{brand}</div>}
            <div className="text-white font-medium text-[15px] line-clamp-2 leading-snug">{name}</div>
            <div className="flex items-baseline gap-2 mt-1.5">
              {currentPrice != null && (
                <span className="text-white font-bold text-[15px]">{formatKr(currentPrice)}</span>
              )}
              {chain && <span className="text-[12px] text-text-muted">{chain}</span>}
            </div>
          </div>
        </div>
      </Link>

      {/* Add/remove button — clearly visible */}
      <button
        onClick={handleToggle}
        className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-90 ${
          inBasket
            ? "bg-primary/15 text-primary border border-primary/30"
            : "bg-primary text-white hover:bg-primary-hover shadow-sm"
        } ${justAdded ? "animate-basket-pop" : ""}`}
        aria-label={inBasket ? `Fjern ${name} fra handlekurv` : `Legg til ${name} i handlekurv`}
      >
        {inBasket ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {item && item.quantity > 1 && <span>{item.quantity}×</span>}
            Lagt til
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Legg til
          </>
        )}
      </button>
    </div>
  );
}
