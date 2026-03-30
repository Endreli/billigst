import { describe, it, expect } from "vitest";
import { calculateCpiReferenceLine } from "@/lib/cpi-calc";

describe("calculateCpiReferenceLine", () => {
  const cpiData = [
    { year: 2024, month: 1, value: 100 },
    { year: 2024, month: 2, value: 101 },
    { year: 2024, month: 3, value: 102 },
    { year: 2024, month: 4, value: 103 },
  ];

  it("starts at the given base price", () => {
    const line = calculateCpiReferenceLine(50, cpiData, { year: 2024, month: 1 });
    expect(line[0].price).toBe(50);
  });

  it("scales price proportionally with CPI", () => {
    const line = calculateCpiReferenceLine(50, cpiData, { year: 2024, month: 1 });
    expect(line[1].price).toBeCloseTo(50.5);
    expect(line[2].price).toBeCloseTo(51);
  });

  it("returns empty array if no CPI data", () => {
    const line = calculateCpiReferenceLine(50, [], { year: 2024, month: 1 });
    expect(line).toHaveLength(0);
  });
});
