"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useBasketContext } from "@/components/basket-provider";
import { BasketSearch } from "@/components/basket-search";
import { PopularProducts } from "@/components/popular-products";
import { BasketEmpty } from "@/components/basket-empty";
import { BasketItemRow } from "@/components/basket-item";
import { ChainTotalCard } from "@/components/chain-total-card";
import { SavingsBanner } from "@/components/savings-banner";
import { SplitBasket } from "@/components/split-basket";
import { TilbudSection } from "@/components/tilbud-section";
import { BasketBreakdown } from "@/components/basket-breakdown";
import { BasketSummaryCard } from "@/components/basket-summary-card";
import { ShareResults } from "@/components/share-results";
import { useLocation } from "@/hooks/use-location";
import { findNearbyStores, getNearestPerChain, calculateDrivingCost, type NearbyStore, type DrivingCost } from "@/lib/store-locator";
import { getRoutesFromOrigin, type RouteResult } from "@/lib/routing";

interface CalculateResponse {
  chainTotals: { chain: string; total: number; itemsAvailable: number; itemsMissing: number }[];
  productBreakdown: {
    ean: string; name: string; brand: string | null; imageUrl: string | null; quantity: number;
    prices: Record<string, { price: number; subtotal: number }>;
    cheapestChain: string; cheapestPrice: number;
  }[];
  savings: {
    cheapestChain: string; cheapestTotal: number;
    mostExpensiveChain: string; mostExpensiveTotal: number;
    savingsAmount: number; savingsPercent: number;
  } | null;
  splitBasket: {
    totalOptimized: number; savingsVsSingleStore: number;
    assignments: { ean: string; name: string; chain: string; price: number; quantity: number }[];
    storeVisits: string[];
  } | null;
  tilbud: {
    ean: string; name: string; brand: string | null; chain: string;
    currentPrice: number; avgPrice30d: number; dropPercent: number; inBasket: boolean;
  }[];
}

export default function HandlekurvPage() {
  const { items, updateQuantity, removeItem, clearBasket, isEmpty, loaded } = useBasketContext();
  const [data, setData] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Reset confirm state after 3 seconds
  useEffect(() => {
    if (confirmClear) {
      confirmTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
      return () => { if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current); };
    }
  }, [confirmClear]);

  // Location & nearby stores
  const { lat, lng, refresh: refreshLocation } = useLocation();
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [routes, setRoutes] = useState<Map<string, RouteResult>>(new Map());
  const [showDrivingCosts, setShowDrivingCosts] = useState(true); // Auto-show when location available
  const [locationRequested, setLocationRequested] = useState(false);

  // Fetch nearby stores when location becomes available
  useEffect(() => {
    if (lat && lng) {
      findNearbyStores(lat, lng).then((r) => setNearbyStores(r.stores));
    }
  }, [lat, lng]);

  const nearestPerChain = getNearestPerChain(nearbyStores);

  // Fetch real driving routes when we have stores
  useEffect(() => {
    if (!lat || !lng || nearestPerChain.size === 0) return;
    const destinations = Array.from(nearestPerChain.entries()).map(([chain, store]) => ({
      lat: store.lat, lng: store.lng, id: chain,
    }));
    getRoutesFromOrigin(lat, lng, destinations).then(setRoutes);
  }, [lat, lng, nearbyStores.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build driving cost map with real routes where available
  const drivingCostMap = new Map<string, DrivingCost>();
  if (lat && lng) {
    for (const [chain, store] of nearestPerChain) {
      const route = routes.get(chain);
      drivingCostMap.set(chain, calculateDrivingCost(
        lat, lng, store,
        route?.distanceKm,
        route?.durationMin,
      ));
    }
  }

  // Sort chains: always prioritize stores that have the most items,
  // then by total (+ driving cost if enabled)
  const sortedChainTotals = data?.chainTotals ? [...data.chainTotals] : [];
  sortedChainTotals.sort((a, b) => {
    // First: fewer missing items = better (stores with all items first)
    if (a.itemsMissing !== b.itemsMissing) return a.itemsMissing - b.itemsMissing;
    // Then: cheapest total (including driving if enabled)
    const aCost = a.total + (showDrivingCosts ? (drivingCostMap.get(a.chain)?.totalDrivingCost || 0) : 0);
    const bCost = b.total + (showDrivingCosts ? (drivingCostMap.get(b.chain)?.totalDrivingCost || 0) : 0);
    return aCost - bCost;
  });

  const calculate = useCallback(async () => {
    if (items.length === 0) {
      setData(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/handlekurv/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ ean: i.ean, quantity: i.quantity })),
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Beregning feilet");
      const json = await res.json();
      setData(json);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError("Kunne ikke beregne priser.");
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    if (!loaded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(calculate, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, loaded, calculate]);

  const cheapestPriceMap = new Map<string, number>();
  if (data) {
    for (const p of data.productBreakdown) {
      cheapestPriceMap.set(p.ean, p.cheapestPrice);
    }
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const hasLocation = lat != null && lng != null;

  // --- Left column: basket items ---
  const basketPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Handlekurv</h1>
        {!isEmpty && (
          <button
            onClick={() => {
              if (confirmClear) {
                clearBasket();
                setConfirmClear(false);
              } else {
                setConfirmClear(true);
              }
            }}
            className={`text-[13px] transition-colors py-2 px-3 -mr-3 active:scale-95 rounded-lg ${
              confirmClear
                ? "bg-red-500/15 text-red-400 font-medium"
                : "text-text-muted hover:text-red-400"
            }`}
          >
            {confirmClear ? "Er du sikker?" : "Tom kurven"}
          </button>
        )}
      </div>

      <BasketSearch />
      <PopularProducts />

      {isEmpty ? (
        <BasketEmpty />
      ) : (
        <>
          <div className="bg-surface rounded-card divide-y divide-border/50">
            {items.map((item) => (
              <BasketItemRow
                key={item.ean}
                {...item}
                cheapestPrice={cheapestPriceMap.get(item.ean)}
                onQuantityChange={(q) => updateQuantity(item.ean, q)}
                onRemove={() => removeItem(item.ean)}
              />
            ))}
          </div>
          <div className="text-center text-[13px] text-text-muted">
            {items.length} varer ({totalItems} enheter)
          </div>
        </>
      )}
    </div>
  );

  // --- Right column: results ---
  const resultsPanel = !isEmpty && (
    <div className="space-y-4">
      {/* Summary card */}
      {data && data.savings && (() => {
        const cheapestChain = data.savings.cheapestChain;
        const nearestStore = nearestPerChain.get(cheapestChain);
        const driveCost = drivingCostMap.get(cheapestChain);
        return (
          <BasketSummaryCard
            cheapestChain={cheapestChain}
            cheapestTotal={data.savings.cheapestTotal}
            itemCount={totalItems}
            savingsAmount={data.savings.savingsAmount}
            storeName={nearestStore?.name}
            storeAddress={nearestStore?.address}
            distanceKm={driveCost?.distanceKm}
            durationMin={driveCost?.durationMin}
          />
        );
      })()}

      {/* Loading */}
      {loading && !data && (
        <div className="space-y-3">
          <div className="h-24 animate-shimmer rounded-card" />
          <div className="h-40 animate-shimmer rounded-card" />
          <div className="h-20 animate-shimmer rounded-card" />
          <div className="h-20 animate-shimmer rounded-card" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-card p-5 text-center">
          <p className="text-red-400 text-[15px]">{error}</p>
          <button onClick={calculate} className="text-red-300 text-[13px] mt-2 underline active:scale-95">Prøv igjen</button>
        </div>
      )}

      {data && (
        <>
          {data.savings && data.savings.savingsAmount > 0 && (
            <>
              <SavingsBanner {...data.savings} />
              <div className="flex justify-center">
                <ShareResults
                  cheapestChain={data.savings.cheapestChain}
                  cheapestTotal={data.savings.cheapestTotal}
                  savingsAmount={data.savings.savingsAmount}
                  itemCount={totalItems}
                />
              </div>
            </>
          )}

          {data.chainTotals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[13px] text-text-muted uppercase tracking-wider">Totalpriser per butikk</h3>

                {/* Location toggle */}
                {hasLocation && nearbyStores.length > 0 && (
                  <button
                    onClick={() => setShowDrivingCosts(!showDrivingCosts)}
                    className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full transition-colors active:scale-95 ${
                      showDrivingCosts
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-surface-hover text-text-muted border border-border"
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                      <circle cx="6.5" cy="16.5" r="2.5" />
                      <circle cx="16.5" cy="16.5" r="2.5" />
                    </svg>
                    Inkl. kjøring
                  </button>
                )}
              </div>

              {/* Prompt to enable location if not available */}
              {!hasLocation && !locationRequested && data.chainTotals.length > 1 && (
                <button
                  onClick={() => {
                    setLocationRequested(true);
                    refreshLocation();
                  }}
                  className="w-full bg-surface border border-border rounded-card p-4 flex items-center gap-3 hover:border-primary/20 transition-colors active:scale-[0.99]"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white text-[14px] font-medium">Inkluder kjørekostnader?</div>
                    <div className="text-text-muted text-[12px]">Se hva som er billigst inkl. drivstoff og bom</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b92a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}

              {sortedChainTotals.map((ct, i) => {
                const nearest = nearestPerChain.get(ct.chain);
                const driveCost = drivingCostMap.get(ct.chain);
                const cheapestAdjusted = showDrivingCosts
                  ? sortedChainTotals[0].total + (drivingCostMap.get(sortedChainTotals[0].chain)?.totalDrivingCost || 0)
                  : data.chainTotals[0]?.total || 0;

                return (
                  <ChainTotalCard
                    key={ct.chain}
                    {...ct}
                    rank={i + 1}
                    cheapestTotal={showDrivingCosts ? cheapestAdjusted : data.chainTotals[0]?.total || 0}
                    distance={nearest?.distance}
                    drivingCost={showDrivingCosts ? driveCost : null}
                    showTotalInklKjoring={showDrivingCosts}
                    storeName={nearest?.name}
                    storeAddress={nearest?.address}
                  />
                );
              })}
            </div>
          )}

          {data.splitBasket && <SplitBasket {...data.splitBasket} />}
          {data.tilbud.length > 0 && <TilbudSection items={data.tilbud} />}

          {data.productBreakdown.length > 0 && (
            <BasketBreakdown products={data.productBreakdown} chains={data.chainTotals.map((c) => c.chain)} />
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="pb-20">
      {/* Mobile: single column */}
      <div className="lg:hidden space-y-4">
        {basketPanel}
        {resultsPanel}
      </div>

      {/* Desktop: two columns */}
      <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
        <div className="col-span-2 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
          {basketPanel}
        </div>
        <div className="col-span-3">
          {resultsPanel || (
            <div className="text-center py-20 text-text-muted">
              <p className="text-[15px]">Legg til varer for å se prissammenligning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
