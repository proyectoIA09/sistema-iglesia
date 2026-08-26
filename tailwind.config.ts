import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6fb",
          100: "#e2eaf6",
          200: "#c1d3ea",
          300: "#94b3da",
          400: "#618ec4",
          500: "#3f70ac",
          600: "#2e5690",
          700: "#264675",
          800: "#233c62",
          900: "#213453",
          950: "#141f34",
        },
        gold: {
          400: "#e6c368",
          500: "#d4a93f",
          600: "#b98a2c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 6px -1px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
