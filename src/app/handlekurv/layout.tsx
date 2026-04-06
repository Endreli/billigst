import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Handlekurv — Billigst",
  description: "Legg til varer og finn den billigste butikken for handlekurven din. Sammenlign priser på tvers av Kiwi, Rema 1000, Coop, Meny og flere.",
};

export default function HandlekurvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
