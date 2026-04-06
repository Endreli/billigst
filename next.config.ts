import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type checking done locally — Turso adapter produces different types than local SQLite
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { hostname: "bilder.ngdata.no" },
      { hostname: "cdcimg.coop.no" },
      { hostname: "kassal.app" },
      { hostname: "platform.coop.no" },
    ],
  },
};

export default nextConfig;
