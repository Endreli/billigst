import { formatKr } from "@/lib/format";
import { ChainLogo } from "@/components/chain-logo";

interface DrivingCostInfo {
  fuelCost: number;
  tollEstimate: number;
  tollZones: string[];
  totalDrivingCost: number;
  distanceKm: number;
  durationMin?: number;
  isRealRoute: boolean;
}

interface ChainTotalCardProps {
  chain: string;
  total: number;
  itemsAvailable: number;
  itemsMissing: number;
  rank: number;
  cheapestTotal: number;
  distance?: number | null;
  drivingCost?: DrivingCostInfo | null;
  showTotalInklKjoring?: boolean;
  storeName?: string | null;
  storeAddress?: string | null;
}

export function ChainTotalCard({
  chain,
  total,
  itemsAvailable,
  itemsMissing,
  rank,
  cheapestTotal,
  distance,
  drivingCost,
  showTotalInklKjoring,
  storeName,
  storeAddress,
}: ChainTotalCardProps) {
  const isCheapest = rank === 1;
  const delta = total - cheapestTotal;

  const totalInklKjoring = drivingCost ? total + drivingCost.totalDrivingCost : total;

  return (
    <div
      className={`bg-surface rounded-card p-5 flex items-center gap-4 transition-all press-scale ${
        isCheapest ? "ring-1 ring-primary/40 border-l-4 border-l-primary" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={`text-[15px] font-bold tabular-nums w-7 text-center ${
            rank === 1 ? "text-primary" : rank === 2 ? "text-gray-300" : "text-text-muted"
          }`}
        >
          {rank}.
        </span>
        <ChainLogo chain={chain} size={44} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-[15px]">{chain}</span>
          {isCheapest && (
            <span className="bg-primary/15 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-md">
              BILLIGST
            </span>
          )}
        </div>
        <div className="text-text-muted text-[13px] mt-0.5">
          {itemsAvailable}/{itemsAvailable + itemsMissing} varer
          {itemsMissing > 0 && (
            <span className="text-orange-400 ml-1">({itemsMissing} mangler)</span>
          )}
          {drivingCost?.durationMin != null ? (
            <span className="ml-2">· {drivingCost.distanceKm} km · {drivingCost.durationMin} min</span>
          ) : distance != null ? (
            <span className="ml-2">· {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`}</span>
          ) : null}
        </div>

        {/* Nearest store info */}
        {storeName && storeName !== chain && (
          <div className="text-[12px] text-text-muted mt-0.5 truncate">
            📍 {storeName}{storeAddress ? ` · ${storeAddress}` : ""}
          </div>
        )}

        {/* Driving cost breakdown */}
        {drivingCost && drivingCost.totalDrivingCost > 0 && (
          <div className="text-[12px] mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-text-muted flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                <circle cx="6.5" cy="16.5" r="2.5" />
                <circle cx="16.5" cy="16.5" r="2.5" />
              </svg>
              +{formatKr(drivingCost.fuelCost)} drivstoff
            </span>
            {drivingCost.tollEstimate > 0 && (
              <span className="text-orange-400 font-medium flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                +{formatKr(drivingCost.tollEstimate)} bom
                <span className="text-text-muted font-normal">({drivingCost.tollZones.join(", ")})</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        {showTotalInklKjoring && drivingCost && drivingCost.totalDrivingCost > 0 ? (
          <>
            <div className={`text-lg font-bold tabular-nums ${isCheapest ? "text-primary" : "text-white"}`}>
              {formatKr(totalInklKjoring)}
            </div>
            <div className="text-text-muted text-[12px] tabular-nums">
              varer {formatKr(total)}
            </div>
          </>
        ) : (
          <>
            <div className={`text-lg font-bold tabular-nums ${isCheapest ? "text-primary" : "text-white"}`}>
              {formatKr(total)}
            </div>
            {!isCheapest && delta > 0 && (
              <div className="text-red-400/70 text-[13px] tabular-nums">+{formatKr(delta)}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
