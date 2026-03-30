import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        "surface-hover": "#1a1a1a",
        border: "#2a2a2a",
      },
    },
  },
  plugins: [],
};
export default config;
