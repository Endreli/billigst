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
