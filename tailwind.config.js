/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF5500",
        "primary-foreground": "#ffffff",
      },
      fontFamily: {
        display: ["Oswald", "Arial Narrow", "sans-serif"],
      },
    },
  },
  plugins: [],
};
