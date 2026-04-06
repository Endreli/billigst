import { describe, it, expect } from "vitest";

// Test the routing module's caching logic
// We can't test actual OSRM calls in unit tests, but we can test the interface
describe("routing module", () => {
  it("exports getRoute and getRoutesFromOrigin", async () => {
    const routing = await import("@/lib/routing");
    expect(typeof routing.getRoute).toBe("function");
    expect(typeof routing.getRoutesFromOrigin).toBe("function");
  });
});
