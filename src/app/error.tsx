"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="text-center py-20 space-y-6">
      <div className="text-6xl">😵</div>
      <div>
        <h1 className="text-2xl font-bold text-white">Noe gikk galt</h1>
        <p className="text-text-muted text-[15px] mt-2 max-w-sm mx-auto">
          En uventet feil oppstod. Prøv å laste siden på nytt.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-primary px-5 py-3 rounded-xl text-[15px] text-white hover:bg-primary-hover transition-colors active:scale-95"
        >
          Prøv igjen
        </button>
      </div>
    </div>
  );
}
