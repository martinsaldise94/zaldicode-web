/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./404.html",
    "./legal/**/*.html",
    "./script.js",
  ],
  // Clases que JS añade/quita en runtime: garantizamos que entren en el build.
  safelist: ["hidden", "flex"],
  theme: {
    extend: {},
  },
  plugins: [],
};
