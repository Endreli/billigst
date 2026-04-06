"use client";

import Link from "next/link";
import { useBasketContext } from "@/components/basket-provider";
import { ProductImage } from "@/components/product-image";
import { formatKr } from "@/lib/format";
import { getFormattedUnitPrice } from "@/lib/unit-price";
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
    <div className="bg-surface border border-border rounded-card hover:border-primary/20 transition-colors group">
      {/* Tappable product info area → goes to detail page */}
      <Link href={`/produkt/${ean}`} className="block p-4 pb-3">
        <div className="flex gap-3">
          <ProductImage src={imageUrl} alt={name} size="lg" />
          <div className="flex-1 min-w-0">
            {brand && <div className="text-[12px] text-text-muted uppercase tracking-wide">{brand}</div>}
            <div className="text-white font-medium text-[15px] line-clamp-2 leading-snug">{name}</div>
            <div className="flex items-baseline gap-2 mt-1.5">
              {currentPrice != null && (
                <span className="text-white font-bold text-[15px]">{formatKr(currentPrice)}</span>
              )}
              {currentPrice != null && (() => {
                const unitPrice = getFormattedUnitPrice(name, currentPrice);
                return unitPrice ? (
                  <span className="text-[12px] text-text-muted">{unitPrice}</span>
                ) : null;
              })()}
              {chain && <span className="text-[12px] text-text-muted">{chain}</span>}
            </div>
            <div className="text-text-muted text-[12px] mt-1 flex items-center gap-1 group-hover:text-primary transition-colors">
              Se priser i flere butikker
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Full-width add button — impossible to miss */}
      <div className="px-4 pb-4">
        <button
          onClick={handleToggle}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.97] ${
            inBasket
              ? "bg-primary/10 text-primary border border-primary/25"
              : "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20"
          } ${justAdded ? "animate-basket-pop" : ""}`}
          aria-label={inBasket ? `Fjern ${name} fra handlekurv` : `Legg til ${name} i handlekurv`}
        >
          {inBasket ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Lagt til{item && item.quantity > 1 ? ` (${item.quantity}×)` : ""}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Legg til i handlekurv
            </>
          )}
        </button>
      </div>
    </div>
  );
}
