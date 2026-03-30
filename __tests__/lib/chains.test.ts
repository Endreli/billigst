import { describe, it, expect } from "vitest";
import { normalizeChain } from "@/lib/chains";

describe("normalizeChain", () => {
  it("extracts Kiwi from full store name", () => {
    expect(normalizeChain("Kiwi Majorstuen")).toBe("Kiwi");
  });
  it("extracts Meny from full store name", () => {
    expect(normalizeChain("Meny Storo")).toBe("Meny");
  });
  it("extracts Rema 1000", () => {
    expect(normalizeChain("REMA 1000 Grønland")).toBe("Rema 1000");
  });
  it("extracts Coop Extra", () => {
    expect(normalizeChain("Coop Extra Lambertseter")).toBe("Coop Extra");
  });
  it("extracts Coop Mega", () => {
    expect(normalizeChain("Coop Mega Bryn")).toBe("Coop Mega");
  });
  it("extracts Spar", () => {
    expect(normalizeChain("SPAR Frogner")).toBe("Spar");
  });
  it("extracts Joker", () => {
    expect(normalizeChain("Joker Bislett")).toBe("Joker");
  });
  it("extracts Oda", () => {
    expect(normalizeChain("Oda")).toBe("Oda");
  });
  it("extracts Bunnpris", () => {
    expect(normalizeChain("Bunnpris Torshov")).toBe("Bunnpris");
  });
  it("returns original if no match", () => {
    expect(normalizeChain("Unknown Store")).toBe("Unknown Store");
  });
});
