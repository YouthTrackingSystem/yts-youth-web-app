import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f6",
          100: "#d5efeb",
          500: "#169b8f",
          600: "#0f7d74",
          700: "#0c635d"
        },
        ink: "#172126",
        mist: "#f4f7f8"
      },
      boxShadow: {
        soft: "0 14px 35px rgba(23, 33, 38, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
