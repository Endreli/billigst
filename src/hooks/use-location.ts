"use client";

import { useState, useCallback, useEffect } from "react";

interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = "billigst-location";
const TTL = 60 * 60 * 1000; // 1 hour

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    lat: null, lng: null, loading: false, error: null,
  });

  // Try to load cached location on mount
  useEffect(() => {
    try {
      // Migrate old keys
      if (!localStorage.getItem(STORAGE_KEY)) {
        for (const oldKey of ["handlevett-location", "hvakosta-location"]) {
          const old = localStorage.getItem(oldKey);
          if (old) {
            localStorage.setItem(STORAGE_KEY, old);
            localStorage.removeItem(oldKey);
            break;
          }
        }
      }
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { lat, lng, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < TTL) {
          setState({ lat, lng, loading: false, error: null });
        }
      }
    } catch { /* ignore */ }
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolokasjon er ikke støttet", loading: false }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setState({ lat, lng, loading: false, error: null });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, timestamp: Date.now() }));
        } catch { /* ignore */ }
      },
      (err) => {
        let msg = "Kunne ikke hente posisjon";
        if (err.code === 1) msg = "Tilgang til posisjon ble avslått";
        setState((s) => ({ ...s, loading: false, error: msg }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: TTL }
    );
  }, []);

  return { ...state, refresh };
}
