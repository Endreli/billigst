"use client";

import { formatKr } from "@/lib/format";
import { ProductImage } from "@/components/product-image";

interface BasketItemProps {
  ean: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  quantity: number;
  cheapestPrice?: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function BasketItemRow({
  name,
  brand,
  imageUrl,
  quantity,
  cheapestPrice,
  onQuantityChange,
  onRemove,
}: BasketItemProps) {
  return (
    <div className="py-4 px-4 group animate-fade-in">
      <div className="flex items-center gap-3">
        <ProductImage src={imageUrl} alt={name} size="md" />

        <div className="flex-1 min-w-0">
          <div className="text-white text-[15px] font-medium leading-tight">{name}</div>
          {brand && <div className="text-text-muted text-[13px]">{brand}</div>}
        </div>

        <button
          onClick={onRemove}
          aria-label={`Fjern ${name} fra handlekurven`}
          className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors flex-shrink-0 rounded-xl hover:bg-red-500/10 active:scale-90"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mt-3 pl-[60px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            aria-label={`Reduser antall ${name}`}
            className="w-11 h-11 rounded-xl bg-surface-hover text-text-muted hover:text-white hover:bg-border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold active:scale-90"
          >
            -
          </button>
          <span className="w-10 text-center text-white text-[15px] font-semibold tabular-nums" aria-label={`Antall: ${quantity}`}>{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={quantity >= 99}
            aria-label={`Øk antall ${name}`}
            className="w-11 h-11 rounded-xl bg-surface-hover text-text-muted hover:text-white hover:bg-border flex items-center justify-center transition-colors disabled:opacity-30 text-lg font-bold active:scale-90"
          >
            +
          </button>
        </div>

        {cheapestPrice != null && (
          <div className="text-white text-[15px] font-semibold tabular-nums">
            {formatKr(cheapestPrice * quantity)}
          </div>
        )}
      </div>
    </div>
  );
}
