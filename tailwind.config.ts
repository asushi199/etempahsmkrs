import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna jenama sistem — biru institusi sekolah (skala penuh)
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#c3dafe",
          300: "#9cc0fb",
          400: "#6098f5",
          500: "#3b76ec",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172a63",
        },
      },
    },
  },
  plugins: [],
};

export default config;
