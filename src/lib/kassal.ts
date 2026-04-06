const BASE_URL = "https://kassal.app/api/v1";

function headers() {
  return {
    Authorization: `Bearer ${process.env.KASSAL_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface KassalProduct {
  id: number;
  name: string;
  brand: string | null;
  vendor: string | null;
  ean: string;
  image: string | null;
  category: { id: number; name: string }[];
  // Current price can be a number or an object depending on the endpoint
  current_price: number | null;
  current_unit_price: number | null;
  store: {
    name: string;
    code: string;
  } | null;
  price_history?: {
    price: number;
    date: string;
  }[];
}

export interface KassalSearchResult {
  data: KassalProduct[];
  links: { next: string | null; prev: string | null };
}

export interface KassalPriceHistory {
  ean: string;
  prices: {
    price: number;
    date: string;
    store: { name: string };
  }[];
}

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

export async function getProductByEan(
  ean: string
): Promise<{ data: KassalProduct }> {
  const res = await fetch(`${BASE_URL}/products/ean/${ean}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Kassal API error: ${res.status}`);
  return res.json();
}

export async function getPricesBulk(
  eans: string[],
  days = 90
): Promise<{ data: KassalPriceHistory[] }> {
  const res = await fetch(`${BASE_URL}/products/prices-bulk`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ eans, days }),
  });
  if (!res.ok) throw new Error(`Kassal API error: ${res.status}`);
  return res.json();
}

/** Helper to extract price from Kassalapp product (handles both formats) */
export function getKassalPrice(kp: KassalProduct): number | null {
  if (typeof kp.current_price === "number") return kp.current_price;
  return null;
}

/** Helper to extract store name from Kassalapp product */
export function getKassalStore(kp: KassalProduct): string | null {
  if (kp.store?.name) return kp.store.name;
  return null;
}
