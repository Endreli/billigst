"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";

interface PricePoint { chain: string; price: number; date: string; }

interface PriceChartProps { ean: string; initialPeriod?: string; }

const PERIODS = [
  { key: "1m", label: "1M" },
  { key: "6m", label: "6M" },
  { key: "1y", label: "1Å" },
  { key: "max", label: "Maks" },
];

export function PriceChart({ ean, initialPeriod = "1y" }: PriceChartProps) {
  const [period, setPeriod] = useState(initialPeriod);
  const [data, setData] = useState<{ prices: PricePoint[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchData(p: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${ean}/prices?period=${p}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePeriodChange(p: string) {
    setPeriod(p);
    fetchData(p);
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-card p-5 h-80 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-text-muted text-[14px]">Laster prishistorikk...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const chartMap = new Map<string, { date: string; price: number }>();

  for (const p of data.prices) {
    const dateKey = typeof p.date === "string" ? p.date.slice(0, 10) : format(new Date(p.date), "yyyy-MM-dd");
    if (!chartMap.has(dateKey) || (chartMap.get(dateKey)!.price ?? 0) < p.price) {
      chartMap.set(dateKey, { date: dateKey, price: Number(p.price) });
    }
  }

  const chartData = Array.from(chartMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (chartData.length === 0) {
    return (
      <div className="bg-surface rounded-card p-5 h-60 flex items-center justify-center">
        <div className="text-center space-y-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b92a8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p className="text-text-muted text-[14px]">Ingen prishistorikk enn&aring;</p>
          <p className="text-text-muted text-[12px]">Vi samler inn priser daglig, sjekk tilbake snart!</p>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Prishistorikk" className="bg-surface rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-[15px]">Prishistorikk</h3>
        <div className="flex gap-1" role="group" aria-label="Velg tidsperiode">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => handlePeriodChange(p.key)}
              aria-pressed={period === p.key}
              className={`px-4 py-2 min-w-[44px] min-h-[44px] text-[13px] rounded-xl transition-colors active:scale-95 font-medium ${
                period === p.key
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "bg-surface-hover text-text-muted hover:text-white"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={{ fill: "#8b92a8", fontSize: 11 }}
            tickFormatter={(d) => format(parseISO(d), "MMM yy", { locale: nb })}
            axisLine={{ stroke: "#2a2f3d" }} tickLine={false} />
          <YAxis tick={{ fill: "#8b92a8", fontSize: 11 }} tickFormatter={(v) => `${v} kr`}
            axisLine={false} tickLine={false} width={55} />
          <Tooltip
            contentStyle={{ background: "#181b23", border: "1px solid #2a2f3d", borderRadius: 12, color: "#fff", padding: "10px 14px" }}
            labelStyle={{ color: "#8b92a8", fontSize: 12, marginBottom: 4 }}
            labelFormatter={(d) => format(parseISO(d as string), "d. MMMM yyyy", { locale: nb })}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [
              value != null ? `${Number(value).toLocaleString("no-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr` : "", "Pris",
            ]}
          />
          <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2.5} dot={false} connectNulls activeDot={{ r: 5, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
