/** Tailwind v3 (CRA 5 รองรับ v3 เท่านั้น) สีหลักและฟอนต์ของทั้งเว็บอยู่ที่นี่ */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: { sans: ['"IBM Plex Sans Thai"', "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        ink: "#0b1220",
        brand: { 50: "#ecfdf8", 300: "#5eead4", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e" },
      },
    },
  },
  plugins: [],
};
