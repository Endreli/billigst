import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        surface: "#181b23",
        "surface-hover": "#1f2330",
        border: "#2a2f3d",
        primary: "#22c55e",
        "primary-hover": "#16a34a",
        "text-muted": "#8b8fa3",
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
