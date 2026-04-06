"use client";

import { useState } from "react";

interface ChainLogoProps {
  chain: string;
  size?: number;
  className?: string;
}

const LOGO_MAP: Record<string, string> = {
  "Kiwi": "/logos/kiwi.png",
  "Rema 1000": "/logos/rema.png",
  "Meny": "/logos/meny.png",
  "Coop Extra": "/logos/coop.png",
  "Coop Prix": "/logos/coop.png",
  "Coop Mega": "/logos/coop.png",
  "Coop Obs": "/logos/coop.png",
  "Spar": "/logos/spar.png",
  "Joker": "/logos/joker.png",
  "Bunnpris": "/logos/bunnpris.png",
  "Oda": "/logos/oda.png",
};

const CHAIN_COLORS: Record<string, string> = {
  "Kiwi": "#4a8c2a",
  "Rema 1000": "#005baa",
  "Meny": "#c41e3a",
  "Coop Extra": "#e8590c",
  "Coop Prix": "#2d5f2d",
  "Coop Mega": "#cc5500",
  "Coop Obs": "#003366",
  "Spar": "#1a6537",
  "Joker": "#e85d00",
  "Bunnpris": "#d62828",
  "Oda": "#1a1a2e",
};

export function ChainLogo({ chain, size = 44, className = "" }: ChainLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = LOGO_MAP[chain];
  const color = CHAIN_COLORS[chain] || "#555";

  // Fallback: colored square with first letter
  if (!logoUrl || failed) {
    return (
      <div
        className={`rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
        style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
        aria-label={chain}
      >
        {chain.charAt(0)}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white ${className}`}
      style={{ width: size, height: size }}
      aria-label={chain}
    >
      <img
        src={logoUrl}
        alt={chain}
        width={size - 4}
        height={size - 4}
        className="object-contain"
        style={{ width: size - 6, height: size - 6 }}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}
