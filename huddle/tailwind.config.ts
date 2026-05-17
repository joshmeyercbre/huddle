import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cbre: {
          green: "#003F2D",
          mint: "#17E88F",
          "mint-light": "#E6FAF2",
          "green-light": "#E8F0EE",
        },
      },
    },
  },
  plugins: [],
};
export default config;
