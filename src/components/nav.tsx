"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BasketBadge } from "@/components/basket-badge";

export function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Hjem", match: (p: string) => p === "/" },
    { href: "/produkter", label: "Produkter", match: (p: string) => p.startsWith("/produkter") || p.startsWith("/sok") || p.startsWith("/produkt/") },
    { href: "/handlekurv", label: "Handlekurv", match: (p: string) => p === "/handlekurv" },
  ];

  return (
    <nav className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50" aria-label="Toppmeny">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg font-bold tracking-tight text-primary">
            Billigst
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hidden sm:block transition-colors ${
                link.match(pathname) ? "text-white font-medium" : "text-text-muted hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="hidden sm:block">
            <BasketBadge />
          </div>
        </div>
      </div>
    </nav>
  );
}
