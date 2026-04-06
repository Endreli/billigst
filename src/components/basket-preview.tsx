"use client";

import Link from "next/link";
import { useBasketContext } from "@/components/basket-provider";
import { formatKr } from "@/lib/format";
import { useState, useEffect } from "react";

export function BasketPreview() {
  const { items, itemCount, isEmpty } = useBasketContext();
  const [cheapest, setCheapest] = useState<{ chain: string; total: number } | null>(null);

  useEffect(() => {
    if (isEmpty || items.length === 0) {
      setCheapest(null);
      return;
    }

    const controller = new AbortController();
    fetch("/api/handlekurv/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((i) => ({ ean: i.ean, quantity: i.quantity })) }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.chainTotals?.length > 0) {
          setCheapest({ chain: data.chainTotals[0].chain, total: data.chainTotals[0].total });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [items, isEmpty]);

  if (isEmpty) return null;

  return (
    <Link
      href="/handlekurv"
      className="block bg-surface border border-primary/25 rounded-card p-5 hover:border-primary/40 transition-all press-scale animate-fade-in"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-[15px]">Din handlekurv</div>
          <div className="text-text-muted text-[13px] mt-0.5">
            {itemCount} {itemCount === 1 ? "vare" : "varer"}
            {cheapest && <> · Billigst: <span className="text-primary font-medium">{formatKr(cheapest.total)}</span> ({cheapest.chain})</>}
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8fa3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}
