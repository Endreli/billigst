export interface UnitPrice {
  amount: number;
  unit: string;
  normalizedKg?: number;
  normalizedL?: number;
  pricePerUnit?: number;
  unitLabel: string;
}

/**
 * Extract weight or volume from a Norwegian product name.
 * Handles patterns like "400g", "1,5l", "500 g", "1.75l", "33cl", "5dl", "750ml", "1kg".
 */
export function extractWeight(productName: string): UnitPrice | null {
  // Normalize: lowercase for matching
  const name = productName.toLowerCase();

  // Match patterns: number (with optional comma/dot decimal) followed by optional space then unit
  // We look for all matches and pick the last one (most likely to be the weight, not a model number)
  const pattern = /(\d+(?:[.,]\d+)?)\s*(kg|g|mg|ml|cl|dl|l|liter|stk)\b/g;
  let match: RegExpExecArray | null;
  let lastMatch: RegExpExecArray | null = null;

  while ((match = pattern.exec(name)) !== null) {
    lastMatch = match;
  }

  if (!lastMatch) return null;

  // Parse the number, replacing comma with dot for Norwegian decimal separator
  const amount = parseFloat(lastMatch[1].replace(",", "."));
  let unit = lastMatch[2];

  // Normalize "liter" to "l"
  if (unit === "liter") unit = "l";

  if (isNaN(amount) || amount <= 0) return null;

  // Skip "pk" / "pakke" — these are handled by not matching them in the regex
  // Handle "stk" (pieces) — return as-is without per-kg/per-l calculation
  if (unit === "stk") {
    return {
      amount,
      unit,
      unitLabel: "kr/stk",
    };
  }

  // Weight units → normalize to kg
  if (unit === "mg" || unit === "g" || unit === "kg") {
    let normalizedKg: number;
    if (unit === "mg") normalizedKg = amount / 1_000_000;
    else if (unit === "g") normalizedKg = amount / 1000;
    else normalizedKg = amount;

    return {
      amount,
      unit,
      normalizedKg,
      unitLabel: "kr/kg",
    };
  }

  // Volume units → normalize to liters
  if (unit === "ml" || unit === "cl" || unit === "dl" || unit === "l") {
    let normalizedL: number;
    if (unit === "ml") normalizedL = amount / 1000;
    else if (unit === "cl") normalizedL = amount / 100;
    else if (unit === "dl") normalizedL = amount / 10;
    else normalizedL = amount;

    return {
      amount,
      unit,
      normalizedL,
      unitLabel: "kr/l",
    };
  }

  return null;
}

/**
 * Calculate price per kg or price per liter.
 */
export function calculateUnitPrice(price: number, unitInfo: UnitPrice): number | null {
  if (unitInfo.unit === "stk") {
    // Price per piece
    return unitInfo.amount > 0 ? price / unitInfo.amount : null;
  }

  if (unitInfo.normalizedKg != null && unitInfo.normalizedKg > 0) {
    return price / unitInfo.normalizedKg;
  }

  if (unitInfo.normalizedL != null && unitInfo.normalizedL > 0) {
    return price / unitInfo.normalizedL;
  }

  return null;
}

/**
 * Format unit price for display, e.g. "49,80 kr/kg" or "23,90 kr/l".
 * Uses Norwegian locale (comma as decimal separator).
 */
export function formatUnitPrice(pricePerUnit: number, unitLabel: string): string {
  const formatted = pricePerUnit.toLocaleString("no-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${unitLabel}`;
}

/**
 * Convenience: given a product name and price, return a formatted unit price string or null.
 */
export function getFormattedUnitPrice(productName: string, price: number): string | null {
  const info = extractWeight(productName);
  if (!info) return null;
  const perUnit = calculateUnitPrice(price, info);
  if (perUnit == null) return null;
  return formatUnitPrice(perUnit, info.unitLabel);
}
