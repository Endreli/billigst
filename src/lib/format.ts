export function formatKr(amount: number): string {
  // Show decimals only when they're not .00
  const hasDecimals = amount % 1 !== 0;
  return (
    amount.toLocaleString("no-NO", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }) + " kr"
  );
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + "%";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("no-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Returns a human-friendly relative date string in Norwegian */
export function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "i dag";
  if (diffDays === 1) return "i går";
  if (diffDays < 7) return `${diffDays} dager siden`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 uke siden" : `${weeks} uker siden`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 mnd siden" : `${months} mnd siden`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? "1 år siden" : `${years} år siden`;
}

/** How many days old a date is */
export function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/** Threshold constants for price freshness */
export const PRICE_FRESH_DAYS = 14;     // Green — very recent
export const PRICE_STALE_DAYS = 90;     // Orange — somewhat old
export const PRICE_EXPIRED_DAYS = 365;  // Red/gray — too old for comparison
