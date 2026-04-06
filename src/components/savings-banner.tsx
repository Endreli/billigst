"use client";

import { useEffect, useRef, useState } from "react";
import { formatKr, formatPercent } from "@/lib/format";

interface SavingsBannerProps {
  cheapestChain: string;
  cheapestTotal: number;
  mostExpensiveChain: string;
  mostExpensiveTotal: number;
  savingsAmount: number;
  savingsPercent: number;
}

export function SavingsBanner({
  cheapestChain,
  cheapestTotal,
  mostExpensiveChain,
  mostExpensiveTotal,
  savingsAmount,
  savingsPercent,
}: SavingsBannerProps) {
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = savingsAmount;
    const duration = 800;
    const start = performance.now();
    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedAmount(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [savingsAmount]);

  const barPercent = mostExpensiveTotal > 0
    ? ((cheapestTotal / mostExpensiveTotal) * 100)
    : 100;

  return (
    <div ref={ref} className="bg-surface rounded-card p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-primary text-4xl font-bold tabular-nums tracking-tight">
            Du sparer {formatKr(animatedAmount)}
          </div>
          <div className="text-text-muted text-[15px] mt-1.5">
            ved å handle på <span className="text-white font-medium">{cheapestChain}</span>{" "}
            istedenfor <span className="text-white font-medium">{mostExpensiveChain}</span>
          </div>
        </div>
        <div className="bg-primary/15 text-primary text-[15px] font-bold px-3 py-2 rounded-xl flex-shrink-0">
          -{formatPercent(savingsPercent)}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-white font-medium w-24 flex-shrink-0 truncate">{cheapestChain}</span>
          <div className="flex-1 bg-surface-hover rounded-full h-7 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
              style={{ width: `${barPercent}%` }}
            >
              <span className="text-[11px] font-bold text-white">{formatKr(cheapestTotal)}</span>
            </div>
          </div>
          <span className="text-[11px] text-primary font-semibold flex-shrink-0">Billigst</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-text-muted w-24 flex-shrink-0 truncate">{mostExpensiveChain}</span>
          <div className="flex-1 bg-surface-hover rounded-full h-7 overflow-hidden">
            <div
              className="bg-red-500/60 h-full rounded-full flex items-center justify-end pr-3"
              style={{ width: "100%" }}
            >
              <span className="text-[11px] font-bold text-white">{formatKr(mostExpensiveTotal)}</span>
            </div>
          </div>
          <span className="text-[11px] text-red-400 font-semibold flex-shrink-0">Dyrest</span>
        </div>
      </div>
    </div>
  );
}
