"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBasketContext } from "@/components/basket-provider";
import { formatKr } from "@/lib/format";
import { useState, useEffect } from "react";

export function BasketFloat() {
  const { items, itemCount, isEmpty } = useBasketContext();
  const pathname = usePathname();
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
        if (data.chainTotals && data.chainTotals.length > 0) {
          setCheapest({ chain: data.chainTotals[0].chain, total: data.chainTotals[0].total });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [items, isEmpty]);

  // Don't show on handlekurv page or when basket is empty
  if (pathname === "/handlekurv" || isEmpty) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-4 right-4 z-40 max-w-lg mx-auto animate-slide-up">
      <Link
        href="/handlekurv"
        aria-label={`Se handlekurv med ${itemCount} ${itemCount === 1 ? "vare" : "varer"}${cheapest ? `, billigst hos ${cheapest.chain} for ${formatKr(cheapest.total)}` : ""}`}
        className="flex items-center justify-between bg-primary hover:bg-primary-hover text-white rounded-2xl px-5 py-4 min-h-[56px] shadow-xl shadow-primary/25 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold">Se handlekurv</div>
            <div className="text-green-200 text-[13px]">{itemCount} {itemCount === 1 ? "vare" : "varer"}</div>
          </div>
        </div>
        {cheapest && (
          <div className="text-right">
            <div className="text-[15px] font-bold tabular-nums">{formatKr(cheapest.total)}</div>
            <div className="text-green-200 text-[13px]">{cheapest.chain}</div>
          </div>
        )}
      </Link>
    </div>
  );
}
