/**
 * Oda.com (formerly Kolonial.no) — Direct API integration.
 *
 * Oda has an open REST API at https://oda.com/api/v1/ that requires
 * no authentication. It provides real-time prices and availability.
 *
 * Limitations:
 * - No EAN/barcode in the API response — must match by product name
 * - Only covers Oda (1 chain), but always has fresh prices
 * - Search is text-based, so we need fuzzy matching
 */

const ODA_BASE = "https://oda.com/api/v1";

export interface OdaProduct {
  id: number;
  full_name: string;
  brand: string | null;
  name: string;
  name_extra: string | null;
  gross_price: string;
  gross_unit_price: string | null;
  unit_price_quantity_abbreviation: string | null;
  front_url: string;
  absolute_url: string;
  availability: {
    is_available: boolean;
    code: string;
  };
  images: { large: { url: string } }[];
  discount: {
    description_short: string;
    gross_price: string;
    gross_unit_price: string;
  } | null;
}

interface OdaSearchResponse {
  attributes: { total_hits: number };
  products: OdaProduct[];
}

/**
 * Search Oda's product catalog by name.
 * Returns products with live prices.
 */
export async function searchOda(query: string): Promise<OdaProduct[]> {
  try {
    const res = await fetch(
      `${ODA_BASE}/search/?q=${encodeURIComponent(query)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!res.ok) return [];

    const data: OdaSearchResponse = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

/**
 * Get a single Oda product by its Oda ID.
 */
export async function getOdaProduct(
  odaId: number
): Promise<OdaProduct | null> {
  try {
    const res = await fetch(`${ODA_BASE}/products/${odaId}/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Try to find a matching Oda product for a given product name.
 * Returns the best match with its current price, or null.
 *
 * Uses a simple fuzzy matching strategy:
 * 1. Search Oda with the product name
 * 2. Score results by keyword overlap
 * 3. Return best match if score is high enough
 */
export async function findOdaPrice(
  productName: string,
  brand?: string | null
): Promise<{ odaId: number; price: number; name: string; nameExtra: string | null } | null> {
  // Build a clean search query
  const searchTerms = buildSearchQuery(productName, brand);
  if (!searchTerms) return null;

  const results = await searchOda(searchTerms);
  if (results.length === 0) return null;

  // Score each result by keyword similarity
  const nameWords = normalizeForMatching(productName);
  const brandWords = brand ? normalizeForMatching(brand) : [];

  let bestMatch: OdaProduct | null = null;
  let bestScore = 0;

  for (const product of results) {
    if (!product.availability?.is_available) continue;

    const odaWords = normalizeForMatching(
      product.full_name + " " + (product.name_extra || "")
    );

    let score = 0;
    let totalWords = 0;

    // Score word overlap
    for (const word of nameWords) {
      if (word.length < 2) continue;
      totalWords++;
      if (odaWords.some((w) => w.includes(word) || word.includes(w))) {
        score++;
      }
    }

    // Brand match bonus
    if (brandWords.length > 0) {
      const odaBrand = normalizeForMatching(product.brand || "");
      for (const bw of brandWords) {
        if (odaBrand.some((w) => w.includes(bw) || bw.includes(w))) {
          score += 2;
          break;
        }
      }
    }

    // Volume/weight match is critical — "1l" vs "0.5l" should NOT match
    const nameVolume = extractVolume(productName);
    const odaVolume = extractVolume(
      product.full_name + " " + (product.name_extra || "")
    );
    if (nameVolume && odaVolume) {
      if (Math.abs(nameVolume - odaVolume) / Math.max(nameVolume, odaVolume) < 0.1) {
        score += 3; // Same volume — strong bonus
      } else {
        score -= 10; // Different volume — heavy penalty
      }
    }

    const normalizedScore = totalWords > 0 ? score / totalWords : 0;

    if (normalizedScore > bestScore && score >= 3) {
      bestScore = normalizedScore;
      bestMatch = product;
    }
  }

  if (!bestMatch) return null;

  const price = parseFloat(bestMatch.gross_price);
  if (isNaN(price)) return null;

  return {
    odaId: bestMatch.id,
    price,
    name: bestMatch.full_name,
    nameExtra: bestMatch.name_extra,
  };
}

/** Normalize text for fuzzy matching */
function normalizeForMatching(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[,.\-/()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

/** Extract volume in liters from product name */
function extractVolume(name: string): number | null {
  const n = name.toLowerCase().replace(",", ".");

  // Match patterns like "1.5l", "500ml", "33cl", "5dl", "1 l"
  const match = n.match(
    /(\d+(?:\.\d+)?)\s*(ml|cl|dl|l|liter|kg|g)\b/
  );
  if (!match) return null;

  const val = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case "ml":
      return val / 1000;
    case "cl":
      return val / 100;
    case "dl":
      return val / 10;
    case "l":
    case "liter":
      return val;
    case "g":
      return val / 1000;
    case "kg":
      return val;
    default:
      return null;
  }
}

/** Build a search query from product name and brand */
function buildSearchQuery(name: string, brand?: string | null): string {
  // Remove volume info and common words, keep the core product name
  let clean = name
    .replace(/\d+[,.]?\d*\s*(ml|cl|dl|l|kg|g)\b/gi, "")
    .replace(/\b(stk|pk|x)\b/gi, "")
    .trim();

  // If brand is in the name, don't add it again
  if (brand && !clean.toLowerCase().includes(brand.toLowerCase())) {
    clean = brand + " " + clean;
  }

  return clean.trim().slice(0, 50);
}
