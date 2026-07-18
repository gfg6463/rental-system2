import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-cairo)", "sans-serif"],
      },
      colors: {
        brand: {
          50: '#e6faf6',
          100: '#c1f3e7',
          200: '#9bf0db',
          300: '#62e5c8',
          400: '#26d3af',
          500: '#00B189',
          600: '#009a76',
          700: '#008264',
          800: '#006a52',
          900: '#005743',
          950: '#00382b',
        }
      },
    },
  },
  plugins: [],
};
export default config;
