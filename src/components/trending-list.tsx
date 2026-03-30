import Link from "next/link";

interface TrendingItem {
  ean: string;
  name: string;
  change: number;
}

export function TrendingList({ items }: { items: TrendingItem[] }) {
  return (
    <div className="bg-surface rounded-xl p-5">
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Prisendringer siste 30 dager</h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Link key={item.ean} href={`/produkt/${item.ean}`}
            className="flex items-center justify-between text-sm hover:bg-surface-hover px-2 py-1.5 rounded-md transition-colors">
            <span className="text-gray-300">{item.name}</span>
            <span className={item.change > 0 ? "text-red-500" : "text-green-500"}>
              {item.change > 0 ? "+" : ""}{item.change.toFixed(2)} kr
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
