import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { BasketProvider } from "@/components/basket-provider";
import { BottomNav } from "@/components/bottom-nav";
import { BasketFloat } from "@/components/basket-float";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { InstallPrompt } from "@/components/install-prompt";
import { Footer } from "@/components/footer";
import { Onboarding } from "@/components/onboarding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Billigst — Finn billigste handlekurv",
  description: "Sammenlign dagligvarepriser og finn den billigste butikken for handlekurven din. Se priser fra Kiwi, Rema 1000, Coop, Meny og flere.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Billigst",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Billigst — Finn billigste handlekurv",
    description: "Sammenlign dagligvarepriser og finn den billigste butikken for handlekurven din.",
    type: "website",
    locale: "nb_NO",
    siteName: "Billigst",
  },
  twitter: {
    card: "summary_large_image",
    title: "Billigst — Finn billigste handlekurv",
    description: "Sammenlign dagligvarepriser og finn den billigste butikken for handlekurven din.",
  },
  keywords: ["dagligvare", "prissammenligning", "handlekurv", "billigst", "Kiwi", "Rema 1000", "Coop", "Meny", "SPAR", "Norge"],
};

export const viewport: Viewport = {
  themeColor: "#111318",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <BasketProvider>
          <a href="#main-content" className="skip-link">Hopp til innhold</a>
          <Nav />
          <main id="main-content" className="max-w-6xl mx-auto px-4 py-5 pb-40 sm:pb-6">{children}</main>
          <Footer />
          <ServiceWorkerRegister />
          <InstallPrompt />
          <BasketFloat />
          <BottomNav />
          <Onboarding />
        </BasketProvider>
      </body>
    </html>
  );
}
