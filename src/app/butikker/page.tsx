"use client";

import { useState, useEffect } from "react";
import { useLocation } from "@/hooks/use-location";
import { findNearbyStores, getNearestPerChain, calculateDrivingCost, type NearbyStore, type StoreSearchResult } from "@/lib/store-locator";
import { getRoutesFromOrigin, type RouteResult } from "@/lib/routing";
import { formatKr } from "@/lib/format";
import { ChainLogo } from "@/components/chain-logo";

export default function ButikkerPage() {
  const { lat, lng, loading: locLoading, error: locError, refresh } = useLocation();
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [rawCount, setRawCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [routes, setRoutes] = useState<Map<string, RouteResult>>(new Map());

  useEffect(() => {
    if (lat && lng) {
      setLoading(true);
      setFetchError(null);
      findNearbyStores(lat, lng).then((result) => {
        setStores(result.stores);
        setRawCount(result.rawCount);
        setFetchError(result.error ?? null);
        setLoading(false);
      });
    }
  }, [lat, lng]);

  // Fetch real routes for nearest per chain
  useEffect(() => {
    if (!lat || !lng || stores.length === 0) return;
    const nearest = getNearestPerChain(stores);
    const destinations = Array.from(nearest.entries()).map(([chain, store]) => ({
      lat: store.lat, lng: store.lng, id: chain,
    }));
    getRoutesFromOrigin(lat, lng, destinations).then(setRoutes);
  }, [lat, lng, stores.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasLocation = lat != null && lng != null;
  const nearestPerChain = getNearestPerChain(stores);

  // Sort chains by distance to nearest store
  const sortedChains = Array.from(nearestPerChain.entries())
    .sort((a, b) => a[1].distance - b[1].distance);

  // Group all stores by chain (for expanded view)
  const allByChain = new Map<string, NearbyStore[]>();
  for (const s of stores) {
    const arr = allByChain.get(s.chain) || [];
    arr.push(s);
    allByChain.set(s.chain, arr);
  }

  const uniqueChains = sortedChains.length;
  const totalStores = stores.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Butikker i nærheten</h1>
        <p className="text-text-muted text-[15px] mt-1">
          Finn de nærmeste dagligvarebutikkene
        </p>
      </div>

      {!hasLocation && !locLoading && (
        <div className="bg-surface rounded-card p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Aktiver posisjon</h3>
            <p className="text-text-muted text-[15px] mt-1 max-w-sm mx-auto">
              Del posisjonen din for å se hvilke butikker som er nærmest deg
            </p>
          </div>
          {locError && (
            <p className="text-red-400 text-[13px]">{locError}</p>
          )}
          <button
            onClick={refresh}
            disabled={locLoading}
            className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors active:scale-95 disabled:opacity-50"
          >
            {locLoading ? "Henter posisjon..." : "Aktiver posisjon"}
          </button>
        </div>
      )}

      {(locLoading || (hasLocation && loading)) && (
        <div className="bg-surface rounded-card p-8 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-[15px]">
            {locLoading ? "Henter posisjon..." : "Søker etter butikker..."}
          </p>
        </div>
      )}

      {hasLocation && !loading && stores.length === 0 && (
        <div className="bg-surface rounded-card p-6 text-center space-y-2">
          {fetchError ? (
            <>
              <p className="text-red-400 text-[15px]">Kunne ikke hente butikker</p>
              <p className="text-text-muted text-[13px]">{fetchError}</p>
            </>
          ) : rawCount > 0 ? (
            <>
              <p className="text-text-muted text-[15px]">
                {rawCount} butikker funnet, men ingen kjente kjeder i nærheten
              </p>
              <p className="text-text-muted text-[13px]">
                Vi gjenkjenner Kiwi, Rema 1000, Meny, Coop, Spar, Joker, Bunnpris og Oda
              </p>
            </>
          ) : (
            <p className="text-text-muted text-[15px]">Ingen butikker funnet innen 5 km</p>
          )}
          <button onClick={refresh} className="text-primary text-[15px] mt-2 active:scale-95">
            Prøv igjen
          </button>
        </div>
      )}

      {hasLocation && !loading && stores.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-text-muted text-[13px]">
              {uniqueChains} kjeder · {totalStores} butikker innen 5 km
            </div>
            <button
              onClick={() => setShowAll(!showAll)}
              className={`text-[12px] px-3 py-1.5 rounded-full transition-colors active:scale-95 ${
                showAll
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-surface-hover text-text-muted border border-border"
              }`}
            >
              {showAll ? "Vis nærmeste" : "Vis alle"}
            </button>
          </div>

          <div className="space-y-2">
            {sortedChains.map(([chain, nearest]) => {
              const route = routes.get(chain);
              const cost = lat && lng ? calculateDrivingCost(lat, lng, nearest, route?.distanceKm, route?.durationMin) : null;
              const allStores = allByChain.get(chain) || [];

              return (
                <div key={chain} className="bg-surface rounded-card overflow-hidden">
                  {/* Nearest store — always shown */}
                  <div className="px-5 py-4 flex items-center gap-4">
                    <ChainLogo chain={chain} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-[15px]">{chain}</div>
                      <div className="text-text-muted text-[13px]">
                        {nearest.name !== chain ? nearest.name : ""}
                        {nearest.address && <span className="ml-1">· {nearest.address}</span>}
                      </div>
                      {cost && cost.totalDrivingCost > 0 && (
                        <div className="text-[12px] text-text-muted mt-0.5 flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                            <circle cx="6.5" cy="16.5" r="2.5" />
                            <circle cx="16.5" cy="16.5" r="2.5" />
                          </svg>
                          ~{formatKr(cost.fuelCost)} drivstoff
                          {cost.tollEstimate > 0 && <> + {formatKr(cost.tollEstimate)} bom ({cost.tollZones.join(", ")})</>}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-semibold text-[15px]">
                        {cost?.isRealRoute ? `${cost.distanceKm} km` : nearest.distance < 1 ? `${(nearest.distance * 1000).toFixed(0)} m` : `${nearest.distance.toFixed(1)} km`}
                      </div>
                      {cost?.durationMin != null && (
                        <div className="text-text-muted text-[12px]">{cost.durationMin} min</div>
                      )}
                      {allStores.length > 1 && (
                        <div className="text-text-muted text-[12px]">
                          +{allStores.length - 1} til
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional stores — shown when expanded */}
                  {showAll && allStores.length > 1 && (
                    <div className="border-t border-border divide-y divide-border/50">
                      {allStores.slice(1, 5).map((store, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between pl-[72px]">
                          <div className="min-w-0">
                            <div className="text-text-muted text-[14px] truncate">{store.name}</div>
                            {store.address && (
                              <div className="text-text-muted/70 text-[12px]">{store.address}</div>
                            )}
                          </div>
                          <div className="text-text-muted text-[14px] font-medium flex-shrink-0 ml-3">
                            {store.distance < 1 ? `${(store.distance * 1000).toFixed(0)} m` : `${store.distance.toFixed(1)} km`}
                          </div>
                        </div>
                      ))}
                      {allStores.length > 5 && (
                        <div className="px-5 py-2 text-text-muted text-[12px] text-center">
                          +{allStores.length - 5} butikker til
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
