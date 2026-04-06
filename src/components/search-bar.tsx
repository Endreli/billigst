"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRecentSearches } from "@/hooks/use-recent-searches";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const { addSearch } = useRecentSearches();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      addSearch(trimmed);
      router.push(`/sok?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8fa3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk etter produkter..."
          className="bg-transparent flex-1 text-white placeholder-text-muted outline-none text-[15px]"
          aria-label="Søk etter produkter"
        />
      </div>
    </form>
  );
}
