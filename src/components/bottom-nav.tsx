"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBasketContext } from "@/components/basket-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useBasketContext();

  const tabs = [
    {
      href: "/",
      label: "Hjem",
      match: (p: string) => p === "/",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          {!active && <polyline points="9 22 9 12 15 12 15 22" />}
        </svg>
      ),
    },
    {
      href: "/produkter",
      label: "Søk",
      match: (p: string) => p.startsWith("/produkter") || p.startsWith("/sok") || p.startsWith("/produkt/"),
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      href: "/handlekurv",
      label: "Handlekurv",
      match: (p: string) => p === "/handlekurv",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      badge: itemCount,
    },
    {
      href: "/butikker",
      label: "Butikker",
      match: (p: string) => p === "/butikker",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" fill={active ? "#111318" : "none"} />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-50 sm:hidden safe-area-bottom" aria-label="Hovednavigasjon">
      <div className="flex items-center justify-around h-[72px]" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.badge ? `${tab.label} (${tab.badge} varer)` : tab.label}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 relative transition-colors active:scale-95 ${
                isActive ? "text-primary" : "text-text-muted"
              }`}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div className="absolute top-0 w-5 h-[3px] bg-primary rounded-full" />
              )}
              <div className="relative">
                {tab.icon(isActive)}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-primary text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
