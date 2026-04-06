"use client";

import { useState } from "react";
import { ChainLogo } from "@/components/chain-logo";
import { formatKr } from "@/lib/format";
import Link from "next/link";

interface ProductBreakdown {
  ean: string;
  name: string;
  brand: string | null;
  quantity: number;
  prices: Record<string, { price: number; subtotal: number }>;
  cheapestChain: string;
  cheapestPrice: number;
}

interface BasketBreakdownProps {
  products: ProductBreakdown[];
  chains: string[];
}

export function BasketBreakdown({ products, chains }: BasketBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface rounded-card overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-surface-hover transition-colors active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📊</span>
          <span className="text-white font-medium text-[15px]">Detaljert prissammenligning</span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-text-muted font-normal px-4 py-3 sticky left-0 bg-surface min-w-[150px]">
                  Produkt
                </th>
                {chains.map((chain) => {
                  return (
                    <th key={chain} className="text-center font-normal px-2 py-3 min-w-[80px]">
                      <div className="flex items-center justify-center gap-1">
                        <ChainLogo chain={chain} size={16} />
                        <span className="text-text-muted text-[11px] truncate max-w-[60px]">{chain}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.ean} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-surface">
                    <Link href={`/produkt/${p.ean}`} className="hover:text-primary transition-colors">
                      <div className="text-white truncate">{p.name}</div>
                      {p.quantity > 1 && <div className="text-text-muted">x{p.quantity}</div>}
                    </Link>
                  </td>
                  {chains.map((chain) => {
                    const priceData = p.prices[chain];
                    const isCheapest = chain === p.cheapestChain;
                    return (
                      <td key={chain} className="text-center px-2 py-3 tabular-nums">
                        {priceData ? (
                          <span className={isCheapest ? "text-primary font-semibold" : "text-text-muted"}>
                            {formatKr(priceData.subtotal)}
                          </span>
                        ) : (
                          <span className="text-border">--</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
