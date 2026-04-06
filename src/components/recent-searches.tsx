"use client";

import { useRecentSearches } from "@/hooks/use-recent-searches";

export function RecentSearches() {
  const { searches, removeSearch, clearAll } = useRecentSearches();

  if (searches.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] text-text-muted uppercase tracking-wider">Nylige søk</h3>
        <button
          onClick={clearAll}
          className="text-[12px] text-text-muted hover:text-white transition-colors py-1 px-2 -mr-2 active:scale-95"
        >
          Tøm
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((term) => (
          <div key={term} className="flex items-center bg-surface-hover border border-border rounded-full group">
            <a
              href={`/sok?q=${encodeURIComponent(term)}`}
              className="px-3 py-2 text-[13px] text-text-muted hover:text-white transition-colors"
            >
              {term}
            </a>
            <button
              onClick={() => removeSearch(term)}
              className="pr-2.5 pl-0 py-2 text-text-muted/50 hover:text-red-400 transition-colors active:scale-90"
              aria-label={`Fjern "${term}" fra nylige søk`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
