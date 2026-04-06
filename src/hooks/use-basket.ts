"use client";

import { useState, useEffect, useCallback } from "react";

export interface BasketItem {
  ean: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  quantity: number;
}

interface StoredBasket {
  version: number;
  items: BasketItem[];
}

const STORAGE_KEY = "billigst-handlekurv";
const OLD_STORAGE_KEYS = ["handlevett-handlekurv", "hvakosta-handlekurv"];
const CURRENT_VERSION = 1;

function loadBasket(): BasketItem[] {
  if (typeof window === "undefined") return [];
  try {
    // Try new key first
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from old keys (handlevett-*, hvakosta-*)
      for (const oldKey of OLD_STORAGE_KEYS) {
        raw = localStorage.getItem(oldKey);
        if (raw) {
          localStorage.setItem(STORAGE_KEY, raw);
          localStorage.removeItem(oldKey);
          break;
        }
      }
    }
    if (!raw) return [];
    const stored: StoredBasket = JSON.parse(raw);
    if (stored.version !== CURRENT_VERSION) return [];
    return stored.items;
  } catch {
    return [];
  }
}

function saveBasket(items: BasketItem[]) {
  if (typeof window === "undefined") return;
  const stored: StoredBasket = { version: CURRENT_VERSION, items };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function useBasket() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadBasket());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveBasket(items);
  }, [items, loaded]);

  const addItem = useCallback(
    (product: { ean: string; name: string; brand: string | null; imageUrl: string | null }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.ean === product.ean);
        if (existing) {
          return prev.map((i) =>
            i.ean === product.ean ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i
          );
        }
        if (prev.length >= 30) return prev;
        return [...prev, { ...product, quantity: 1 }];
      });
    },
    []
  );

  const removeItem = useCallback((ean: string) => {
    setItems((prev) => prev.filter((i) => i.ean !== ean));
  }, []);

  const updateQuantity = useCallback((ean: string, quantity: number) => {
    const q = Math.max(1, Math.min(99, quantity));
    setItems((prev) => prev.map((i) => (i.ean === ean ? { ...i, quantity: q } : i)));
  }, []);

  const clearBasket = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const hasItem = useCallback(
    (ean: string) => items.some((i) => i.ean === ean),
    [items]
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearBasket,
    itemCount,
    isEmpty: items.length === 0,
    hasItem,
    loaded,
  };
}
