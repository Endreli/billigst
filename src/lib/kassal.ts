const BASE_URL = "https://kassal.app/api/v1";

function headers() {
  return {
    Authorization: `Bearer ${process.env.KASSAL_API_KEY}`,
    "Content-Type": "application/json",
  };
}

/* ── Search Result (one entry per store listing) ── */

export interface KassalProduct {
  id: number;
  name: string;
  brand: string | null;
  vendor: string | null;
  ean: string;
  image: string | null;
  category: { id: number; name: string }[];
  weight: number | null;
  weight_unit: string | null;
  current_price:
    | number
    | { price: number; unit_price: number | null; date: string }
    | null;
  current_unit_price: number | null;
  store: { name: string; code: string } | null;
  price_history?: { price: number; date: string }[];
}

export interface KassalSearchResult {
  data: KassalProduct[];
  links: { next: string | null; prev: string | null };
}

/* ── EAN Endpoint (returns ALL store variants for one EAN) ── */

export interface KassalEanProduct {
  id: number;
  name: string;
  vendor: string | null;
  brand: string | null;
  description: string | null;
  image: string | null;
  category: { id: number; name: string }[] | null;
  weight: number | null;
  weight_unit: string | null;
  current_price:
    | { price: number; unit_price: number | null; date: string }
    | null;
  store: { name: string; code: string } | null;
  price_history?: { price: number; date: string }[];
}

export interface KassalEanResponse {
  data: {
    ean: string;
    products: KassalEanProduct[];
    allergens?: unknown[];
    nutrition?: unknown[];
    labels?: unknown[];
  };
}

/* ── Bulk Prices Endpoint ── */

export interface KassalBulkStore {
  store: string;
  name: string;
  current_price: string;
  current_unit_price: number | null;
  current_unit_price_unit: string | null;
  last_checked: string;
}

export interface KassalBulkItem {
  ean: string;
  name: string;
  weight: number | null;
  weight_unit: string | null;
  stores: KassalBulkStore[];
  price_history: {
    price: number;
    date: string;
    store: string;
  }[];
}

export interface KassalBulkResponse {
  data: KassalBulkItem[];
  meta?: unknown;
}

/* ── API Functions ── */

export async function searchProducts(
  query: string,
  page = 1,
  size = 20
): Promise<KassalSearchResult> {
  const params = new URLSearchParams({
    search: query,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(`${BASE_URL}/products?${params}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Kassal API error: ${res.status}`);
  return res.json();
}

/**
 * Get ALL store variants for a given EAN.
 * Returns products[] with one entry per store that carries this product.
 */
export async function getProductByEan(ean: string): Promise<KassalEanResponse> {
  const res = await fetch(`${BASE_URL}/products/ean/${ean}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Kassal API error: ${res.status}`);
  return res.json();
}

/**
 * Fetch current prices and recent history for multiple EANs at once.
 * Returns stores[] with current prices AND price_history[] with daily entries.
 */
export async function getPricesBulk(
  eans: string[],
  days = 90
): Promise<KassalBulkResponse> {
  const res = await fetch(`${BASE_URL}/products/prices-bulk`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ eans, days }),
  });
  if (!res.ok) throw new Error(`Kassal API error: ${res.status}`);
  return res.json();
}

/* ── Helpers ── */

/** Extract numeric price from either format (number or {price, ...}) */
export function getKassalPrice(
  p: KassalProduct | KassalEanProduct
): number | null {
  if (p.current_price == null) return null;
  if (typeof p.current_price === "number") return p.current_price;
  if (typeof p.current_price === "object" && "price" in p.current_price) {
    return p.current_price.price;
  }
  return null;
}

/** Extract store name */
export function getKassalStore(
  p: KassalProduct | KassalEanProduct
): string | null {
  return p.store?.name ?? null;
}
