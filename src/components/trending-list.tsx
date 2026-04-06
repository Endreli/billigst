import Link from "next/link";
import { formatKr } from "@/lib/format";

interface TrendingItem {
  ean: string;
  name: string;
  change: number;
}

export function TrendingList({ items }: { items: TrendingItem[] }) {
  return (
    <div className="bg-surface rounded-card p-5">
      <h3 className="text-[13px] text-text-muted uppercase tracking-wider mb-3">Prisendringer siste 30 dager</h3>
      <div className="flex flex-col">
        {items.map((item) => (
          <Link key={item.ean} href={`/produkt/${item.ean}`}
            className="flex items-center justify-between text-[15px] hover:bg-surface-hover px-3 py-3 rounded-xl transition-colors active:scale-[0.99]">
            <span className="text-gray-300">{item.name}</span>
            <span className={`font-medium ${item.change > 0 ? "text-red-400" : "text-primary"}`}>
              {item.change > 0 ? "+" : ""}{formatKr(item.change)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
