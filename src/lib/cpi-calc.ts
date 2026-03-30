interface CpiEntry {
  year: number;
  month: number;
  value: number;
}

interface CpiPricePoint {
  year: number;
  month: number;
  price: number;
}

export function calculateCpiReferenceLine(
  basePrice: number,
  cpiData: CpiEntry[],
  startMonth: { year: number; month: number }
): CpiPricePoint[] {
  if (cpiData.length === 0) return [];

  const baseCpi = cpiData.find(
    (d) => d.year === startMonth.year && d.month === startMonth.month
  );
  if (!baseCpi) return [];

  return cpiData
    .filter(
      (d) =>
        d.year > startMonth.year ||
        (d.year === startMonth.year && d.month >= startMonth.month)
    )
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((d) => ({
      year: d.year,
      month: d.month,
      price: Number(((basePrice * d.value) / baseCpi.value).toFixed(2)),
    }));
}
