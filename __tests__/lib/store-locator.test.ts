import { describe, it, expect } from "vitest";

// Test the toll estimation logic by importing the module
// We test calculateDrivingCost which is the public API
import { calculateDrivingCost, getNearestPerChain, type NearbyStore } from "@/lib/store-locator";

const OSLO_CENTER = { lat: 59.9139, lng: 10.7522 };
const BERGEN_CENTER = { lat: 60.3913, lng: 5.3221 };

function makeStore(chain: string, lat: number, lng: number, distance: number): NearbyStore {
  return { chain, name: `${chain} Test`, lat, lng, distance };
}

describe("calculateDrivingCost", () => {
  it("estimates fuel cost for short distance", () => {
    const store = makeStore("Kiwi", 59.92, 10.76, 1.0);
    const cost = calculateDrivingCost(OSLO_CENTER.lat, OSLO_CENTER.lng, store);
    expect(cost.fuelCost).toBeGreaterThan(0);
    expect(cost.fuelCost).toBeLessThan(20); // 1km round trip shouldn't cost much
    expect(cost.isRealRoute).toBe(false); // No OSRM route provided
  });

  it("uses real route distance when provided", () => {
    const store = makeStore("Rema 1000", 59.93, 10.78, 2.0);
    const withReal = calculateDrivingCost(OSLO_CENTER.lat, OSLO_CENTER.lng, store, 3.5, 8);
    expect(withReal.distanceKm).toBe(3.5);
    expect(withReal.durationMin).toBe(8);
    expect(withReal.isRealRoute).toBe(true);
  });

  it("estimates toll when crossing Oslo bomring", () => {
    // Origin outside Oslo, store inside
    const store = makeStore("Meny", 59.92, 10.75, 5.0);
    const outsideOslo = { lat: 59.75, lng: 10.80 }; // South of Oslo
    const cost = calculateDrivingCost(outsideOslo.lat, outsideOslo.lng, store);
    expect(cost.tollEstimate).toBeGreaterThan(0);
    expect(cost.tollZones).toContain("Oslo");
  });

  it("no toll when both origin and store are inside Oslo", () => {
    const store = makeStore("Kiwi", 59.92, 10.76, 1.0);
    // Both inside central Oslo
    const cost = calculateDrivingCost(59.91, 10.74, store);
    expect(cost.tollEstimate).toBe(0);
  });
});

describe("getNearestPerChain", () => {
  it("returns nearest store per chain", () => {
    const stores: NearbyStore[] = [
      makeStore("Kiwi", 59.92, 10.76, 1.0),
      makeStore("Kiwi", 59.93, 10.77, 2.0),
      makeStore("Rema 1000", 59.94, 10.78, 3.0),
    ];

    const nearest = getNearestPerChain(stores);
    expect(nearest.size).toBe(2);
    expect(nearest.get("Kiwi")?.distance).toBe(1.0);
    expect(nearest.get("Rema 1000")?.distance).toBe(3.0);
  });

  it("handles empty array", () => {
    const nearest = getNearestPerChain([]);
    expect(nearest.size).toBe(0);
  });
});
