import { formatKr } from "@/lib/format";
import { ChainLogo } from "@/components/chain-logo";

interface StorePrice {
  chain: string;
  price: number;
  date: string;
}

export function StorePrices({ prices }: { prices: StorePrice[] }) {
  const sorted = [...prices].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0]?.price;

  return (
    <div className="bg-surface rounded-card p-5">
      <h3 className="text-white font-semibold text-[15px] mb-3">Pris i butikker nå</h3>
      <div className="flex flex-col gap-2">
        {sorted.map((p, i) => {
          const isCheapest = p.price === cheapest && sorted.length > 1;
          const diff = p.price - cheapest;
          return (
            <div
              key={p.chain}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                isCheapest
                  ? "bg-primary/10 ring-1 ring-primary/25"
                  : "bg-surface-hover"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-text-muted text-[13px] w-5 text-center tabular-nums">{i + 1}.</span>
                <ChainLogo chain={p.chain} size={36} />
                <div>
                  <span className="text-gray-300 text-[15px]">{p.chain}</span>
                  {isCheapest && (
                    <span className="ml-2 text-primary text-[11px] font-semibold bg-primary/15 px-1.5 py-0.5 rounded">
                      BILLIGST
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[15px] font-semibold ${isCheapest ? "text-primary" : "text-white"}`}>
                  {formatKr(p.price)}
                </span>
                {diff > 0 && (
                  <div className="text-red-400/70 text-[12px] tabular-nums">+{formatKr(diff)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
