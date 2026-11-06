/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        bg: "#111009",
        elevated: "#1A1814",
        primary: "#E07B39",
        accent: "#3BBFA0",
      },
    },
  },
  plugins: [],
};
