"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";

interface PricePoint { chain: string; price: number; date: string; }
interface CpiPoint { year: number; month: number; price: number; }

interface PriceChartProps { ean: string; initialPeriod?: string; }

const PERIODS = [
  { key: "1m", label: "1M" },
  { key: "6m", label: "6M" },
  { key: "1y", label: "1Å" },
  { key: "max", label: "Maks" },
];

export function PriceChart({ ean, initialPeriod = "1y" }: PriceChartProps) {
  const [period, setPeriod] = useState(initialPeriod);
  const [data, setData] = useState<{ prices: PricePoint[]; cpiLine: CpiPoint[] } | null>(null);
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

  if (!data || loading) {
    return (
      <div className="bg-surface rounded-xl p-5 h-80 flex items-center justify-center">
        <span className="text-gray-500">Laster prishistorikk...</span>
      </div>
    );
  }

  const chartMap = new Map<string, { date: string; price: number | null; kpi: number | null }>();

  for (const p of data.prices) {
    const dateKey = typeof p.date === "string" ? p.date.slice(0, 10) : format(new Date(p.date), "yyyy-MM-dd");
    if (!chartMap.has(dateKey) || (chartMap.get(dateKey)!.price ?? 0) < p.price) {
      chartMap.set(dateKey, { date: dateKey, price: Number(p.price), kpi: chartMap.get(dateKey)?.kpi ?? null });
    }
  }

  for (const c of data.cpiLine) {
    const dateKey = `${c.year}-${String(c.month).padStart(2, "0")}-15`;
    const existing = chartMap.get(dateKey);
    if (existing) {
      existing.kpi = c.price;
    } else {
      chartMap.set(dateKey, { date: dateKey, price: null, kpi: c.price });
    }
  }

  const chartData = Array.from(chartMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="bg-surface rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Prishistorikk</h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => handlePeriodChange(p.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                period === p.key ? "bg-blue-500 text-white" : "bg-surface-hover text-gray-500 hover:text-gray-300"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 11 }}
            tickFormatter={(d) => format(parseISO(d), "MMM yy", { locale: nb })}
            axisLine={{ stroke: "#1a1a1a" }} tickLine={false} />
          <YAxis tick={{ fill: "#555", fontSize: 11 }} tickFormatter={(v) => `${v} kr`}
            axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
            labelFormatter={(d) => format(parseISO(d as string), "d. MMMM yyyy", { locale: nb })}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              value != null ? `${Number(value).toFixed(2)} kr` : "", name === "price" ? "Pris" : "KPI-justert",
            ]} />
          <Legend formatter={(value) => (value === "price" ? "Pris" : "KPI-justert")}
            wrapperStyle={{ color: "#888", fontSize: 12 }} />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2.5} dot={false} connectNulls />
          <Line type="monotone" dataKey="kpi" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
