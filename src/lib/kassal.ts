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
  category: string[];
  current_price: {
    price: number;
    unit_price: number | null;
    date: string;
    store: {
      name: string;
      code: string;
    };
  } | null;
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
