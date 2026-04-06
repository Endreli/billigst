"use client";

import Link from "next/link";
import { useBasketContext } from "@/components/basket-provider";

export function BasketBadge() {
  const { itemCount } = useBasketContext();

  return (
    <Link
      href="/handlekurv"
      className="relative hover:text-white transition-colors flex items-center gap-1.5"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="hidden sm:inline text-sm">Handlekurv</span>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 sm:-right-4 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-basket-pop">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
