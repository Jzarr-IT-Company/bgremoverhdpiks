import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        panel: "#f7f7f4",
        line: "#dad7ce",
        mint: "#16a34a",
        coral: "#ef4444",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17, 24, 39, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
