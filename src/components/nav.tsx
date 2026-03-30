import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white">
          HvaKosta.no
        </Link>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Hjem</Link>
          <Link href="/inflasjon" className="hover:text-white transition-colors">Inflasjon</Link>
        </div>
      </div>
    </nav>
  );
}
