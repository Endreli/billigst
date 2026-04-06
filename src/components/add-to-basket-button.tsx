"use client";

import { useBasketContext } from "@/components/basket-provider";

interface AddToBasketButtonProps {
  ean: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
}

export function AddToBasketButton({ ean, name, brand, imageUrl }: AddToBasketButtonProps) {
  const { addItem, hasItem, items } = useBasketContext();
  const inBasket = hasItem(ean);
  const item = items.find((i) => i.ean === ean);

  return (
    <button
      onClick={() => addItem({ ean, name, brand, imageUrl })}
      className={`w-full py-4 rounded-2xl font-semibold text-[15px] transition-all active:scale-[0.98] ${
        inBasket
          ? "bg-primary/15 text-primary border border-primary/30"
          : "bg-primary text-white hover:bg-primary-hover"
      }`}
    >
      {inBasket ? (
        <span className="flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          I handlekurven ({item?.quantity})
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Legg til i handlekurv
        </span>
      )}
    </button>
  );
}
