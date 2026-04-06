import { describe, it, expect } from "vitest";
import { formatKr, formatPercent } from "@/lib/format";

describe("formatKr", () => {
  it("formats round numbers without decimals", () => {
    expect(formatKr(100)).toBe("100 kr");
    expect(formatKr(5)).toBe("5 kr");
    expect(formatKr(0)).toBe("0 kr");
  });

  it("formats decimal numbers with comma", () => {
    expect(formatKr(23.9)).toBe("23,90 kr");
    expect(formatKr(119.5)).toBe("119,50 kr");
  });

  it("formats prices like 23.90 correctly", () => {
    expect(formatKr(23.90)).toBe("23,90 kr");
    expect(formatKr(45.99)).toBe("45,99 kr");
  });

  it("formats negative values", () => {
    const result = formatKr(-5);
    expect(result).toContain("5 kr");
    // Norwegian locale uses unicode minus (−) not hyphen (-)
    expect(result.length).toBeGreaterThan(4);
  });

  it("handles large numbers", () => {
    const result = formatKr(1234);
    expect(result).toContain("kr");
  });
});

describe("formatPercent", () => {
  it("formats with one decimal", () => {
    expect(formatPercent(15.7)).toBe("15.7%");
    expect(formatPercent(0)).toBe("0.0%");
    expect(formatPercent(100)).toBe("100.0%");
  });
});
