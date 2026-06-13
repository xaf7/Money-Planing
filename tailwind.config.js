/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}", // Menjaga jika file Financeapp.jsx ditaruh di folder utama luar src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
