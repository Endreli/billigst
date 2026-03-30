import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchProducts, getProductByEan } from "@/lib/kassal";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.stubEnv("KASSAL_API_KEY", "test-key");
  mockFetch.mockReset();
});

describe("searchProducts", () => {
  it("sends correct request and returns data", async () => {
    const mockData = { data: [{ id: 1, name: "Grandiosa", ean: "123" }], links: { next: null, prev: null } };
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData) });

    const result = await searchProducts("grandiosa");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/products?search=grandiosa"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      })
    );
    expect(result.data).toHaveLength(1);
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(searchProducts("test")).rejects.toThrow("Kassal API error: 429");
  });
});

describe("getProductByEan", () => {
  it("fetches product by EAN", async () => {
    const mockData = { data: { id: 1, name: "Grandiosa", ean: "7038010000539" } };
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData) });

    const result = await getProductByEan("7038010000539");
    expect(result.data.ean).toBe("7038010000539");
  });
});
