"use client";

import { useBasketContext } from "@/components/basket-provider";

const POPULAR = [
  { ean: "7038010000539", name: "Lettmelk 1L", brand: "TINE" },
  { ean: "7020097400033", name: "Grandiosa", brand: "Grandiosa" },
  { ean: "7037203626162", name: "Norvegia 1kg", brand: "TINE" },
  { ean: "7038010009167", name: "Smør 500g", brand: "TINE" },
  { ean: "7622210100610", name: "Kvikk Lunsj", brand: "Kvikk Lunsj" },
  { ean: "7039610000127", name: "Egg 12pk", brand: "Prior" },
  { ean: "7090006990010", name: "Kjøttdeig", brand: "Gilde" },
  { ean: "7310865068842", name: "Coca-Cola 1.5L", brand: "Coca-Cola" },
  { ean: "7035620001277", name: "Kneippbrød", brand: "Bakers" },
  { ean: "7040518400010", name: "Laks 400g", brand: "Lerøy" },
];

export function PopularProducts() {
  const { addItem, hasItem } = useBasketContext();

  return (
    <div className="flex flex-wrap gap-2">
      {POPULAR.map((p) => {
        const inBasket = hasItem(p.ean);
        return (
          <button
            key={p.ean}
            onClick={() =>
              addItem({ ean: p.ean, name: p.name, brand: p.brand, imageUrl: null })
            }
            aria-label={inBasket ? `${p.name} er i handlekurven` : `Legg til ${p.name}`}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-[13px] font-medium transition-all active:scale-95 ${
              inBasket
                ? "bg-primary/10 border border-primary/30 text-primary"
                : "bg-surface-hover border border-border text-text-muted hover:text-white hover:border-primary/30"
            }`}
          >
            {inBasket ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
