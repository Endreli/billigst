export function BasketEmpty() {
  return (
    <div className="text-center py-8 space-y-8">
      {/* Icon and text */}
      <div>
        <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b8fa3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">Handlekurven er tom</h2>
        <p className="text-text-muted text-[15px] mt-1 max-w-xs mx-auto">
          Legg til varer for å sammenligne priser på tvers av butikker
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        <div className="bg-surface rounded-card p-3 text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="text-white text-[11px] font-medium">Søk varer</div>
        </div>
        <div className="bg-surface rounded-card p-3 text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="text-white text-[11px] font-medium">Legg til</div>
        </div>
        <div className="bg-surface rounded-card p-3 text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div className="text-white text-[11px] font-medium">Spar penger</div>
        </div>
      </div>

      {/* Category suggestions */}
      <div className="text-left max-w-sm mx-auto">
        <h3 className="text-[13px] text-text-muted uppercase tracking-wider mb-3 text-center">Populære kategorier</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: "🥛", name: "Meieri", query: "melk" },
            { emoji: "🧀", name: "Ost", query: "ost" },
            { emoji: "🥩", name: "Kjøtt", query: "kjott" },
            { emoji: "🍞", name: "Brød", query: "brod" },
            { emoji: "🐟", name: "Fisk", query: "laks" },
            { emoji: "🍫", name: "Snacks", query: "sjokolade" },
          ].map((cat) => (
            <a
              key={cat.query}
              href={`/sok?q=${cat.query}`}
              className="bg-surface-hover border border-border rounded-xl px-4 py-3 flex items-center gap-3 hover:border-primary/30 transition-colors active:scale-[0.98]"
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-white text-[15px]">{cat.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
