import { formatKr, formatRelativeDate, daysAgo, PRICE_FRESH_DAYS, PRICE_STALE_DAYS, PRICE_EXPIRED_DAYS } from "@/lib/format";
import { ChainLogo } from "@/components/chain-logo";

interface StorePrice {
  chain: string;
  price: number;
  date: string;
}

function FreshnessDot({ days }: { days: number }) {
  if (days <= PRICE_FRESH_DAYS) {
    return <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title="Fersk pris" />;
  }
  if (days <= PRICE_STALE_DAYS) {
    return <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" title="Noe gammel pris" />;
  }
  return <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" title="Gammel pris" />;
}

export function StorePrices({ prices }: { prices: StorePrice[] }) {
  // Split into fresh (usable for comparison) and expired (too old)
  const fresh = prices.filter((p) => daysAgo(p.date) < PRICE_EXPIRED_DAYS);
  const expired = prices.filter((p) => daysAgo(p.date) >= PRICE_EXPIRED_DAYS);

  const sorted = [...fresh].sort((a, b) => a.price - b.price);
  const sortedExpired = [...expired].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0]?.price;

  const hasStaleData = prices.some((p) => daysAgo(p.date) > PRICE_STALE_DAYS);

  return (
    <section aria-labelledby="store-prices-heading" className="bg-surface rounded-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 id="store-prices-heading" className="text-white font-semibold text-[15px]">Priser i butikker</h3>
        <div className="flex items-center gap-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Oppdatert</span>
          {hasStaleData && (
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Eldre</span>
          )}
        </div>
      </div>

      <ol className="flex flex-col gap-2" aria-label="Priser sortert fra billigst til dyrest">
        {sorted.map((p) => {
          const isCheapest = p.price === cheapest && sorted.length > 1;
          const diff = p.price - cheapest;
          const age = daysAgo(p.date);
          const isStale = age > PRICE_STALE_DAYS;

          return (
            <li
              key={p.chain}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                isCheapest
                  ? "bg-primary/10 ring-1 ring-primary/25"
                  : "bg-surface-hover"
              }`}
            >
              <div className="flex items-center gap-3">
                <ChainLogo chain={p.chain} size={36} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] ${isStale ? "text-text-muted" : "text-gray-300"}`}>{p.chain}</span>
                    {isCheapest && (
                      <span className="text-primary text-[11px] font-semibold bg-primary/15 px-1.5 py-0.5 rounded" aria-label="Billigst pris">
                        BILLIGST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <FreshnessDot days={age} />
                    <span className={`text-[11px] ${isStale ? "text-yellow-400/70" : "text-text-muted"}`}>
                      {formatRelativeDate(p.date)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[15px] font-semibold ${
                  isCheapest ? "text-primary" : isStale ? "text-text-muted" : "text-white"
                }`}>
                  {formatKr(p.price)}
                  {isStale && <span className="text-[11px] text-yellow-400/50 ml-1">*</span>}
                </span>
                {diff > 0 && !isStale && (
                  <div className="text-red-400 text-[12px] tabular-nums" aria-label={`${formatKr(diff)} dyrere`}>
                    +{formatKr(diff)}
                  </div>
                )}
                {isCheapest && !isStale && (
                  <div className="text-primary text-[12px] font-medium">Lavest</div>
                )}
              </div>
            </li>
          );
        })}

        {/* Expired prices — shown dimmed with explanation */}
        {sortedExpired.length > 0 && (
          <>
            <li className="flex items-center gap-2 px-4 pt-2">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[11px] text-text-muted">Utdaterte priser (over 1 år)</span>
              <div className="flex-1 h-px bg-border/50" />
            </li>
            {sortedExpired.map((p) => {
              const age = daysAgo(p.date);
              return (
                <li
                  key={p.chain}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-hover/50 opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <ChainLogo chain={p.chain} size={32} />
                    <div>
                      <span className="text-text-muted text-[14px]">{p.chain}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <FreshnessDot days={age} />
                        <span className="text-[11px] text-red-400/50">{formatRelativeDate(p.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-text-muted text-[14px] line-through">{formatKr(p.price)}</span>
                  </div>
                </li>
              );
            })}
          </>
        )}
      </ol>

      {hasStaleData && (
        <p className="text-[11px] text-text-muted mt-3 px-1">
          * Eldre priser kan ha endret seg. Vi viser den siste kjente prisen fra hver butikk.
        </p>
      )}
    </section>
  );
}
