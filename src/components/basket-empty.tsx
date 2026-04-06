export function BasketEmpty() {
  return (
    <div className="text-center py-8 space-y-8">
      {/* Icon and text */}
      <div>
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">Klar til å handle smart?</h2>
        <p className="text-text-muted text-[15px] mt-1 max-w-xs mx-auto">
          Legg til varer for å finne den billigste butikken for hele handlelisten din
        </p>
      </div>

      {/* How it works — 3-step guide */}
      <div className="max-w-sm mx-auto">
        <h3 className="text-[13px] text-text-muted uppercase tracking-wider mb-3">Slik fungerer det</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-card p-3 text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-primary font-bold text-sm">1</span>
            </div>
            <div className="text-white text-[12px] font-medium">Søk etter varer</div>
            <div className="text-text-muted text-[11px] mt-0.5">Finn det du trenger</div>
          </div>
          <div className="bg-surface rounded-card p-3 text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-primary font-bold text-sm">2</span>
            </div>
            <div className="text-white text-[12px] font-medium">Legg i kurven</div>
            <div className="text-text-muted text-[11px] mt-0.5">Bygg handlelisten</div>
          </div>
          <div className="bg-surface rounded-card p-3 text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-primary font-bold text-sm">3</span>
            </div>
            <div className="text-white text-[12px] font-medium">Se besparelsen</div>
            <div className="text-text-muted text-[11px] mt-0.5">Vi finner billigst</div>
          </div>
        </div>
      </div>

      {/* Category suggestions — pill buttons */}
      <div className="max-w-sm mx-auto">
        <h3 className="text-[13px] text-text-muted uppercase tracking-wider mb-3">Populære kategorier</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { emoji: "🥛", name: "Meieri", query: "melk" },
            { emoji: "🧀", name: "Ost", query: "ost" },
            { emoji: "🥩", name: "Kjøtt", query: "kjøtt" },
            { emoji: "🍞", name: "Brød", query: "brød" },
            { emoji: "🐟", name: "Fisk", query: "laks" },
            { emoji: "🍫", name: "Snacks", query: "sjokolade" },
          ].map((cat) => (
            <a
              key={cat.query}
              href={`/sok?q=${cat.query}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-hover border border-border rounded-full text-[14px] text-white hover:border-primary/40 hover:bg-primary/10 transition-colors active:scale-[0.97]"
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
