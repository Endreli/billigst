"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("billigst-install-dismissed") || localStorage.getItem("handlevett-install-dismissed") || localStorage.getItem("hvakosta-install-dismissed")) {
      setDismissed(true);
      return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem("billigst-install-dismissed", "1");
  }

  return (
    <div role="alert" className="fixed top-18 left-4 right-4 z-40 max-w-lg mx-auto animate-slide-up sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-white text-[15px] font-medium">Legg til Billigst</div>
          <div className="text-text-muted text-[13px]">Rask tilgang fra hjemskjermen</div>
        </div>
        <button
          onClick={handleInstall}
          className="bg-primary text-white text-[13px] font-semibold px-4 py-2.5 min-h-[44px] rounded-xl hover:bg-primary-hover transition-colors active:scale-95"
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Lukk installasjonsforslag"
          className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-white transition-colors rounded-xl"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
