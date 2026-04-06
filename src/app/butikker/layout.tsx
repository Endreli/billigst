import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Butikker i nærheten — Billigst",
  description: "Finn de nærmeste dagligvarebutikkene med avstand, kjøretid og bomkostnader. Se Kiwi, Rema 1000, Coop, Meny og flere butikker nær deg.",
};

export default function ButikkerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
