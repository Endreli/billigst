"use client";

import { useState, useRef, useEffect } from "react";
import { useBasketContext } from "@/components/basket-provider";
import { ProductImage } from "@/components/product-image";

interface SearchResult {
  ean: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  chain: string | null;
}

export function BasketSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { addItem, hasItem } = useBasketContext();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function search(q: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q.trim())}&limit=8`);
        const data = await res.json();
        setResults(data.products || []);
        setOpen(true);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  }

  function handleAdd(product: SearchResult) {
    addItem({
      ean: product.ean,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
    });
    setJustAdded(product.ean);
    setTimeout(() => setJustAdded(null), 600);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleAdd(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b92a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Søk etter varer..."
          className="bg-transparent flex-1 text-white placeholder-text-muted outline-none text-[15px]"
        />
        {loading && (
          <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {results.map((p, i) => {
            const inBasket = hasItem(p.ean);
            const isAdded = justAdded === p.ean;
            return (
              <button
                key={p.ean}
                onClick={() => handleAdd(p)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                  i === selectedIndex ? "bg-surface-hover" : "hover:bg-surface-hover"
                } ${i === 0 ? "rounded-t-2xl" : ""} ${i === results.length - 1 ? "rounded-b-2xl" : ""}`}
              >
                <ProductImage src={p.imageUrl} alt={p.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[15px] truncate">{p.name}</div>
                  {p.brand && <div className="text-text-muted text-[13px]">{p.brand}</div>}
                </div>
                {p.currentPrice != null && (
                  <span className="text-text-muted text-[13px] flex-shrink-0">{p.currentPrice.toFixed(0)} kr</span>
                )}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform">
                  {isAdded ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-basket-pop">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : inBasket ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b92a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && results.length === 0 && query.trim().length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-2xl z-50 p-5 text-center text-text-muted text-[15px]">
          Ingen produkter funnet for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
