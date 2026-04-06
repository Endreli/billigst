"use client";

import { formatKr } from "@/lib/format";
import { ChainLogo } from "@/components/chain-logo";

interface BasketSummaryCardProps {
  cheapestChain: string;
  cheapestTotal: number;
  itemCount: number;
  savingsAmount: number;
  storeName?: string | null;
  storeAddress?: string | null;
  distanceKm?: number | null;
  durationMin?: number | null;
}

export function BasketSummaryCard({
  cheapestChain, cheapestTotal, itemCount, savingsAmount,
  storeName, storeAddress, distanceKm, durationMin,
}: BasketSummaryCardProps) {
  return (
    <div className="bg-surface rounded-card p-5 animate-fade-in">
      <div className="flex items-center gap-4">
        <ChainLogo chain={cheapestChain} size={56} />
        <div className="flex-1">
          <div className="text-text-muted text-[13px]">Billigst for deg</div>
          <div className="text-white font-bold text-lg leading-tight">{cheapestChain}</div>
          <div className="text-text-muted text-[13px]">{itemCount} varer</div>
        </div>
        <div className="text-right">
          <div className="text-primary text-xl font-bold tabular-nums">{formatKr(cheapestTotal)}</div>
          {savingsAmount > 0 && (
            <div className="text-primary/70 text-[13px]">Spar {formatKr(savingsAmount)}</div>
          )}
        </div>
      </div>

      {/* Nearest store location */}
      {(storeName || distanceKm != null) && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-[13px] text-text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate">
            {storeName && storeName !== cheapestChain ? storeName : `Nærmeste ${cheapestChain}`}
            {storeAddress && ` · ${storeAddress}`}
          </span>
          {distanceKm != null && (
            <span className="flex-shrink-0 font-medium text-white">
              {distanceKm} km
              {durationMin != null && ` · ${durationMin} min`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
