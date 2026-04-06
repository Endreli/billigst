"use client";

interface BilligstLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function BilligstLogo({
  size = 28,
  showText = true,
  className = "",
}: BilligstLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Price tag body */}
        <path
          d="M4 8a4 4 0 0 1 4-4h10.34a4 4 0 0 1 2.83 1.17l6.66 6.66a4 4 0 0 1 0 5.66l-8.17 8.17a4 4 0 0 1-5.66 0L4.83 16.5A4 4 0 0 1 4 14.34V8Z"
          fill="#34d399"
        />
        {/* Tag hole */}
        <circle cx="10.5" cy="10.5" r="2.5" fill="white" opacity="0.9" />
        {/* Downward arrow suggesting lowest price */}
        <path
          d="M17 12v7m0 0l-3-3m3 3l3-3"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-primary">
          Billigst
        </span>
      )}
    </div>
  );
}
