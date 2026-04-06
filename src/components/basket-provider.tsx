"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useBasket, type BasketItem } from "@/hooks/use-basket";

interface BasketContextValue {
  items: BasketItem[];
  addItem: (product: { ean: string; name: string; brand: string | null; imageUrl: string | null }) => void;
  removeItem: (ean: string) => void;
  updateQuantity: (ean: string, quantity: number) => void;
  clearBasket: () => void;
  itemCount: number;
  isEmpty: boolean;
  hasItem: (ean: string) => boolean;
  loaded: boolean;
}

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const basket = useBasket();
  return <BasketContext.Provider value={basket}>{children}</BasketContext.Provider>;
}

export function useBasketContext() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasketContext must be used within BasketProvider");
  return ctx;
}
