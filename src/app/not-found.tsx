import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-6 animate-fade-in">
      <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mx-auto">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b92a8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="8" x2="14" y2="14" />
          <line x1="14" y1="8" x2="8" y2="14" />
        </svg>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white">Fant ikke siden</h1>
        <p className="text-text-muted text-[15px] mt-2 max-w-sm mx-auto">
          Siden du leter etter finnes ikke eller har blitt flyttet.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <Link
          href="/"
          className="bg-surface border border-border px-5 py-3 rounded-xl text-[15px] text-gray-300 hover:text-white transition-colors active:scale-95"
        >
          Til forsiden
        </Link>
        <Link
          href="/handlekurv"
          className="bg-primary px-5 py-3 rounded-xl text-[15px] text-white hover:bg-primary-hover transition-colors active:scale-95"
        >
          Handlekurv
        </Link>
      </div>
    </div>
  );
}
