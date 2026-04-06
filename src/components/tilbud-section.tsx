"use client";

import { useBasketContext } from "@/components/basket-provider";
import { ChainLogo } from "@/components/chain-logo";
import { formatKr, formatPercent } from "@/lib/format";

interface TilbudItem {
  ean: string;
  name: string;
  brand: string | null;
  chain: string;
  currentPrice: number;
  avgPrice30d: number;
  dropPercent: number;
  inBasket: boolean;
}

export function TilbudSection({ items }: { items: TilbudItem[] }) {
  const { addItem } = useBasketContext();

  if (items.length === 0) return null;

  return (
    <div className="bg-surface rounded-card p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🏷️</span>
        <h3 className="text-white font-semibold text-[15px]">Tilbud på varene dine</h3>
        <span className="bg-red-500/15 text-red-400 text-[11px] font-semibold px-2 py-0.5 rounded-md ml-auto">
          {items.length} tilbud
        </span>
      </div>

      <div className="space-y-2">
        {items.slice(0, 6).map((t) => {
          return (
            <div key={`${t.ean}-${t.chain}`} className="flex items-center gap-3 bg-surface-hover rounded-xl p-4">
              <ChainLogo chain={t.chain} size={32} />
              <div className="flex-1 min-w-0">
                <div className="text-white text-[15px] truncate">{t.name}</div>
                <div className="text-text-muted text-[13px]">{t.chain}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-[13px] line-through tabular-nums">{formatKr(t.avgPrice30d)}</span>
                  <span className="text-white text-[15px] font-semibold tabular-nums">{formatKr(t.currentPrice)}</span>
                </div>
              </div>
              <span className="bg-primary/15 text-primary text-[13px] font-semibold px-2 py-1 rounded-lg flex-shrink-0">
                -{formatPercent(t.dropPercent)}
              </span>
              {!t.inBasket && (
                <button
                  onClick={() => addItem({ ean: t.ean, name: t.name, brand: t.brand, imageUrl: null })}
                  className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/20 transition-colors active:scale-90"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
