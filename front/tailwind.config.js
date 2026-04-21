/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff7a00",
          light: "#ffd4b3",
          soft: "#fff1e6",
          dark: "#7a4b20",
        },
        secondary: {
          DEFAULT: "#fff7f0",
          light: "#ffffff",
          dark: "#ffd4b3",
        },
        neutral: {
          DEFAULT: "#4a4a4a",
          light: "#6b6b6b",
          dark: "#1b1b1b",
          darker: "#111111",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#fff7f0",
          warm: "#fff1e6",
        },
      },
    },
  },
  plugins: [],
};
