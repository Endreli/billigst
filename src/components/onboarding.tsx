"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "billigst-onboarded";

const STEPS = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Søk etter varer",
    description: "Finn produktene du skal handle — vi har tusenvis av dagligvarer.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    title: "Bygg handlelisten",
    description: "Legg til alt du trenger. Vi sammenligner prisene automatisk.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    title: "Spar penger",
    description: "Se hvilken butikk som er billigst — inkludert kjørekostnader og bom.",
  },
];

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Migrate old keys
    if (localStorage.getItem("handlevett-onboarded") || localStorage.getItem("hvakosta-onboarded")) {
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.removeItem("handlevett-onboarded");
      localStorage.removeItem("hvakosta-onboarded");
    }
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  }

  if (!show) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-lg flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-tight text-primary">
          Billigst
        </div>

        {/* Step content */}
        <div className="space-y-4" key={step}>
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto animate-slide-up">
            {current.icon}
          </div>
          <h2 className="text-xl font-bold text-white animate-slide-up">{current.title}</h2>
          <p className="text-text-muted text-[15px] leading-relaxed animate-slide-up">
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleNext}
            className="w-full bg-primary text-white font-semibold py-4 rounded-2xl hover:bg-primary-hover transition-colors active:scale-[0.98] text-[15px]"
          >
            {isLast ? "Kom i gang" : "Neste"}
          </button>
          {!isLast && (
            <button
              onClick={handleClose}
              className="text-text-muted text-[13px] py-2 active:scale-95"
            >
              Hopp over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
