import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna jenama sistem — biru institusi sekolah
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
