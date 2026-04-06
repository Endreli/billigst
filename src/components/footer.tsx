import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-8 hidden sm:block">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-sm font-bold mb-3 tracking-tight text-primary">
              Billigst
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Sammenlign dagligvarepriser og finn den billigste butikken for handlekurven din.
            </p>
          </div>
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Sider</div>
            <div className="space-y-2">
              <Link href="/handlekurv" className="block text-text-muted text-sm hover:text-white transition-colors">Handlekurv</Link>
              <Link href="/produkter" className="block text-text-muted text-sm hover:text-white transition-colors">Produkter</Link>
              <Link href="/butikker" className="block text-text-muted text-sm hover:text-white transition-colors">Butikker</Link>
              <Link href="/personvern" className="block text-text-muted text-sm hover:text-white transition-colors">Personvern</Link>
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Data</div>
            <div className="space-y-2 text-text-muted text-xs">
              <p>Priser fra norske dagligvarekjeder</p>
              <p>Oppdateres daglig</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-border/50 text-center text-text-muted text-xs">
          Billigst.no — Laget i Norge
        </div>
      </div>
    </footer>
  );
}
