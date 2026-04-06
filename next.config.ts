import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
