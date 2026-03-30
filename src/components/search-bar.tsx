"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/sok?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-gray-500">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk etter et produkt..."
          className="bg-transparent flex-1 text-white placeholder-gray-500 outline-none text-sm"
        />
      </div>
    </form>
  );
}
