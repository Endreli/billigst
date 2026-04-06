"use client";

import { useState } from "react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Category-based fallback icons based on product name
function getFallbackEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("melk") || n.includes("fløte") || n.includes("rømme") || n.includes("yoghurt") || n.includes("kulturmelk")) return "🥛";
  if (n.includes("ost") || n.includes("norvegia") || n.includes("jarlsberg") || n.includes("brunost")) return "🧀";
  if (n.includes("egg")) return "🥚";
  if (n.includes("brød") || n.includes("brod") || n.includes("kneipp") || n.includes("polarbrød")) return "🍞";
  if (n.includes("kjøtt") || n.includes("kjott") || n.includes("bacon") || n.includes("pølse") || n.includes("kylling")) return "🥩";
  if (n.includes("laks") || n.includes("fisk")) return "🐟";
  if (n.includes("pizza") || n.includes("grandiosa")) return "🍕";
  if (n.includes("sjokolade") || n.includes("kvikk") || n.includes("freia")) return "🍫";
  if (n.includes("juice") || n.includes("cola") || n.includes("brus")) return "🥤";
  if (n.includes("ketchup") || n.includes("saus")) return "🍅";
  if (n.includes("smør") || n.includes("smor")) return "🧈";
  return "🛒";
}

const SIZES = {
  sm: "w-10 h-10 text-lg",
  md: "w-12 h-12 text-xl",
  lg: "w-20 h-20 text-3xl",
};

export function ProductImage({ src, alt, size = "md", className = "" }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const sizeClass = SIZES[size];

  if (!src || failed) {
    return (
      <div className={`${sizeClass} bg-surface-hover rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}>
        <span>{getFallbackEmoji(alt)}</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} bg-surface-hover rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}
