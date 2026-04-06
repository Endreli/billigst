"use client";

import { useState } from "react";
import { ChainLogo } from "@/components/chain-logo";
import { formatKr } from "@/lib/format";

interface Assignment {
  ean: string;
  name: string;
  chain: string;
  price: number;
  quantity: number;
}

interface SplitBasketProps {
  totalOptimized: number;
  savingsVsSingleStore: number;
  assignments: Assignment[];
  storeVisits: string[];
}

export function SplitBasket({ totalOptimized, savingsVsSingleStore, assignments, storeVisits }: SplitBasketProps) {
  const [expanded, setExpanded] = useState(false);

  const grouped = new Map<string, Assignment[]>();
  for (const a of assignments) {
    if (!grouped.has(a.chain)) grouped.set(a.chain, []);
    grouped.get(a.chain)!.push(a);
  }

  return (
    <div className="bg-surface rounded-card overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-surface-hover transition-colors active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">✂️</span>
          <div className="text-left">
            <div className="text-white font-medium text-[15px]">Spar mer med flere butikker</div>
            <div className="text-primary text-[13px]">
              Spar {formatKr(savingsVsSingleStore)} ekstra ved å handle på {storeVisits.length} butikker
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[15px] font-semibold tabular-nums">{formatKr(totalOptimized)}</span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border">
          {Array.from(grouped.entries()).map(([chain, items]) => {
            const chainTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            return (
              <div key={chain} className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <ChainLogo chain={chain} size={24} />
                  <span className="text-white text-[15px] font-medium">{chain}</span>
                  <span className="text-text-muted text-[13px] ml-auto tabular-nums">{formatKr(chainTotal)}</span>
                </div>
                {items.map((item) => (
                  <div key={item.ean} className="flex items-center justify-between pl-8 py-1">
                    <span className="text-text-muted text-[13px] truncate">
                      {item.name} {item.quantity > 1 && `x${item.quantity}`}
                    </span>
                    <span className="text-text-muted text-[13px] tabular-nums flex-shrink-0 ml-2">
                      {formatKr(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
          <div className="pt-3 border-t border-border text-[13px] text-text-muted">
            Krever besøk på {storeVisits.length} butikker: {storeVisits.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}
