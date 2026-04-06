import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#111318",
        surface: "#181b23",
        "surface-hover": "#1f2330",
        border: "#2a2f3d",
        primary: "#34d399",
        "primary-hover": "#16a34a",
        "text-muted": "#9298ad",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
