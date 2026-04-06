/**
 * Real driving routes via OSRM (Open Source Routing Machine).
 * Uses the free public demo server for development.
 * For production, host your own or use a paid service.
 *
 * API docs: http://project-osrm.org/docs/v5.24.0/api/
 */

export interface RouteResult {
  /** Road distance in km */
  distanceKm: number;
  /** Driving time in minutes */
  durationMin: number;
}

const ROUTE_CACHE_KEY = "billigst-routes";
const ROUTE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedRoutes {
  routes: Record<string, RouteResult>;
  timestamp: number;
}

function loadCache(): Record<string, RouteResult> {
  try {
    const raw = localStorage.getItem(ROUTE_CACHE_KEY);
    if (!raw) return {};
    const cached: CachedRoutes = JSON.parse(raw);
    if (Date.now() - cached.timestamp > ROUTE_CACHE_TTL) return {};
    return cached.routes;
  } catch {
    return {};
  }
}

function saveCache(routes: Record<string, RouteResult>) {
  try {
    localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify({ routes, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

function cacheKey(lat1: number, lng1: number, lat2: number, lng2: number): string {
  // Round to 4 decimals (~11m precision) to improve cache hits
  return `${lat1.toFixed(4)},${lng1.toFixed(4)}-${lat2.toFixed(4)},${lng2.toFixed(4)}`;
}

/**
 * Get driving route between two points using OSRM.
 * Returns road distance and driving time.
 */
export async function getRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<RouteResult | null> {
  const key = cacheKey(fromLat, fromLng, toLat, toLng);
  const cache = loadCache();

  if (cache[key]) return cache[key];

  try {
    // OSRM uses lng,lat order (not lat,lng)
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;

    const route = data.routes[0];
    const result: RouteResult = {
      distanceKm: Math.round(route.distance / 100) / 10, // meters → km, 1 decimal
      durationMin: Math.round(route.duration / 60),        // seconds → minutes
    };

    // Cache it
    cache[key] = result;
    saveCache(cache);

    return result;
  } catch {
    return null;
  }
}

/**
 * Batch-fetch routes for multiple destinations from a single origin.
 * Uses OSRM table API for efficiency (one request instead of N).
 * Falls back to individual requests if table API fails.
 */
export async function getRoutesFromOrigin(
  originLat: number, originLng: number,
  destinations: { lat: number; lng: number; id: string }[]
): Promise<Map<string, RouteResult>> {
  const results = new Map<string, RouteResult>();
  if (destinations.length === 0) return results;

  const cache = loadCache();

  // Check cache first, collect misses
  const misses: typeof destinations = [];
  for (const dest of destinations) {
    const key = cacheKey(originLat, originLng, dest.lat, dest.lng);
    if (cache[key]) {
      results.set(dest.id, cache[key]);
    } else {
      misses.push(dest);
    }
  }

  if (misses.length === 0) return results;

  // Try OSRM table API for remaining (max ~50 to avoid URL length issues)
  const batch = misses.slice(0, 50);
  try {
    const coords = [
      `${originLng},${originLat}`,
      ...batch.map(d => `${d.lng},${d.lat}`)
    ].join(";");

    const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=distance,duration`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.distances?.[0] && data.durations?.[0]) {
        for (let i = 0; i < batch.length; i++) {
          const dist = data.distances[0][i + 1]; // +1 because source is index 0
          const dur = data.durations[0][i + 1];
          if (dist != null && dur != null) {
            const result: RouteResult = {
              distanceKm: Math.round(dist / 100) / 10,
              durationMin: Math.round(dur / 60),
            };
            results.set(batch[i].id, result);
            const key = cacheKey(originLat, originLng, batch[i].lat, batch[i].lng);
            cache[key] = result;
          }
        }
        saveCache(cache);
        return results;
      }
    }
  } catch { /* fall through to individual requests */ }

  // Fallback: individual requests (rate-limited)
  for (const dest of batch.slice(0, 10)) { // Limit to 10 to be nice to the demo server
    const route = await getRoute(originLat, originLng, dest.lat, dest.lng);
    if (route) {
      results.set(dest.id, route);
    }
  }

  return results;
}
