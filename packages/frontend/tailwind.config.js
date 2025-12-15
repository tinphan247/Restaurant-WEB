/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // [CẦN THIẾT] - Thêm đường dẫn này để Tailwind quét các file React của bạn
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}