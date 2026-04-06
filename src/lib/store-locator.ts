/**
 * Find nearby grocery stores using OpenStreetMap Overpass API (free, no API key).
 * Includes driving cost estimation with fuel and Norwegian toll (bom) estimates.
 */

export interface NearbyStore {
  chain: string;
  name: string;
  lat: number;
  lng: number;
  distance: number; // km (straight line)
  address?: string;
}

export interface DrivingCost {
  fuelCost: number;        // NOK round-trip fuel
  tollEstimate: number;    // NOK estimated toll/bom
  tollZones: string[];     // Names of toll zones crossed
  totalDrivingCost: number;
  distanceKm: number;      // Road distance one way (real if OSRM, estimated if fallback)
  durationMin?: number;    // Driving time in minutes (only if OSRM route available)
  isRealRoute: boolean;    // true if from OSRM, false if estimated
}

// Haversine formula — distance between two points on Earth
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Map OSM brand/name to our canonical chain names
const CHAIN_MAP: Record<string, string> = {
  kiwi: "Kiwi",
  "rema 1000": "Rema 1000",
  rema: "Rema 1000",
  meny: "Meny",
  "coop extra": "Coop Extra",
  "extra coop": "Coop Extra",
  "coop prix": "Coop Prix",
  "coop mega": "Coop Mega",
  "coop obs": "Coop Obs",
  "obs bygg": "Coop Obs",
  "coop marked": "Coop Marked",
  spar: "Spar",
  joker: "Joker",
  bunnpris: "Bunnpris",
  oda: "Oda",
  "marked ": "Coop Marked",   // trailing space to avoid false matches
  europris: "Europris",
};

function matchChain(name: string, brand?: string, operator?: string): string | null {
  const combined = `${brand || ""} ${operator || ""} ${name}`.toLowerCase();
  for (const [key, value] of Object.entries(CHAIN_MAP)) {
    if (combined.includes(key)) return value;
  }
  return null;
}

import { TOLL_ZONES, type TollZone } from "@/lib/toll-data";

/**
 * Estimate toll cost for driving from origin to store and back.
 * Checks all Norwegian toll zones — both city rings and point tolls.
 *
 * Logic:
 * - For ring tolls: if origin is outside and store is inside (or vice versa),
 *   you'll cross the ring → pay toll each way
 * - For point tolls: if the toll point is roughly between origin and store,
 *   you'll likely pass through it
 */
function estimateToll(originLat: number, originLng: number, storeLat: number, storeLng: number): { total: number; zones: string[] } {
  let total = 0;
  const zones: string[] = [];
  const tripDist = haversine(originLat, originLng, storeLat, storeLng);

  for (const zone of TOLL_ZONES) {
    const originToZone = haversine(originLat, originLng, zone.lat, zone.lng);
    const storeToZone = haversine(storeLat, storeLng, zone.lat, zone.lng);

    if (zone.type === "ring") {
      const originInside = originToZone < zone.radius;
      const storeInside = storeToZone < zone.radius;

      // Only pay if you cross the ring boundary (one is inside, other outside)
      if (originInside !== storeInside) {
        total += zone.cost;
        zones.push(zone.name);
      }
    } else {
      // Point toll: check if the toll point is roughly "on the way"
      // The toll point should be closer to the trip midpoint than the trip is long
      if (originToZone < tripDist * 1.2 && storeToZone < tripDist * 1.2) {
        // And the toll zone should be between origin and store (not way off to the side)
        const detour = originToZone + storeToZone - tripDist;
        if (detour < tripDist * 0.3 && originToZone > zone.radius * 0.5 && storeToZone > zone.radius * 0.5) {
          total += zone.cost;
          zones.push(zone.name);
        }
      }
    }
  }
  return { total, zones };
}

/**
 * Calculate total driving cost (round-trip fuel + estimated toll).
 * Uses estimated road distance (straight-line × 1.3).
 * For real routes, use calculateDrivingCostWithRoute().
 */
export function calculateDrivingCost(
  originLat: number,
  originLng: number,
  store: NearbyStore,
  realRouteKm?: number,
  realRouteDurationMin?: number,
): DrivingCost {
  const roadDistance = realRouteKm ?? store.distance * 1.3;

  // Fuel: average Norwegian fuel price ~20 NOK/liter, consumption ~0.07 L/km
  const FUEL_PRICE = 20;
  const CONSUMPTION = 0.07;
  const fuelCost = Math.round(roadDistance * 2 * CONSUMPTION * FUEL_PRICE);

  const toll = estimateToll(originLat, originLng, store.lat, store.lng);

  return {
    fuelCost,
    tollEstimate: toll.total,
    tollZones: toll.zones,
    totalDrivingCost: fuelCost + toll.total,
    distanceKm: Math.round(roadDistance * 10) / 10,
    durationMin: realRouteDurationMin,
    isRealRoute: realRouteKm != null,
  };
}

// ============================================================================
// Store fetching via Overpass API
// ============================================================================
const CACHE_KEY = "billigst-nearby-stores";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export interface StoreSearchResult {
  stores: NearbyStore[];
  rawCount: number;    // total OSM elements returned before chain filtering
  error?: string;      // error message if the fetch failed
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function queryOverpass(query: string): Promise<Response> {
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) return res;
      lastError = new Error(`${endpoint} returned ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export async function findNearbyStores(
  lat: number,
  lng: number,
  radiusMeters = 5000
): Promise<StoreSearchResult> {
  // Check cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, rawCount, timestamp, cachedLat, cachedLng } = JSON.parse(cached);
      const moved = haversine(lat, lng, cachedLat, cachedLng);
      if (Date.now() - timestamp < CACHE_TTL && moved < 0.5) {
        return { stores: data, rawCount: rawCount ?? data.length };
      }
    }
  } catch { /* ignore */ }

  const query = `[out:json][timeout:15];(node["shop"="supermarket"](around:${radiusMeters},${lat},${lng});way["shop"="supermarket"](around:${radiusMeters},${lat},${lng});node["shop"="convenience"](around:${radiusMeters},${lat},${lng});way["shop"="convenience"](around:${radiusMeters},${lat},${lng}););out center tags;`;

  try {
    const res = await queryOverpass(query);
    const json = await res.json();
    const elements = json.elements || [];
    const stores: NearbyStore[] = [];

    for (const el of elements) {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) continue;

      const tags = el.tags || {};
      const chain = matchChain(tags.name || "", tags.brand, tags.operator);
      if (!chain) continue;

      const distance = haversine(lat, lng, elLat, elLng);

      stores.push({
        chain,
        name: tags.name || chain,
        lat: elLat,
        lng: elLng,
        distance: Math.round(distance * 10) / 10,
        address: tags["addr:street"] ? `${tags["addr:street"]} ${tags["addr:housenumber"] || ""}`.trim() : undefined,
      });
    }

    stores.sort((a, b) => a.distance - b.distance);

    const result: StoreSearchResult = { stores, rawCount: elements.length };

    // Cache results
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: stores, rawCount: elements.length, timestamp: Date.now(), cachedLat: lat, cachedLng: lng,
      }));
    } catch { /* ignore */ }

    return result;
  } catch (err) {
    console.error("[store-locator] Overpass query failed:", err);
    return { stores: [], rawCount: 0, error: err instanceof Error ? err.message : "Ukjent feil ved henting av butikker" };
  }
}

/** Get nearest store per chain */
export function getNearestPerChain(stores: NearbyStore[]): Map<string, NearbyStore> {
  const map = new Map<string, NearbyStore>();
  for (const store of stores) {
    if (!map.has(store.chain)) {
      map.set(store.chain, store);
    }
  }
  return map;
}

/** @deprecated Use calculateDrivingCost instead */
export function estimateFuelCost(distanceKm: number): number {
  const roadDist = distanceKm * 1.3;
  return Math.round(roadDist * 2 * 0.07 * 20);
}
