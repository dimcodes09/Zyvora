/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lightBg:     "#f6ebe9",
          darkBg:      "#0f0b0c",
          lightCard:   "#ffffff",
          darkCard:    "#1a1416",
          lightText:   "#3b2c2c",
          darkText:    "#f5eaea",
          primary:     "#8b1e2d",
          primaryDark: "#c84a5a",
          borderLight: "#eadede",
          borderDark:  "#2a2224",
        },
      },
      animation: {
        marquee: "marquee 24s linear infinite",
        blob: "blob 8s ease-in-out infinite",
        "float-bag": "float-bag 4s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blob: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(20px,-30px) scale(1.05)" },
        },
        "float-bag": {
          "0%,100%": { transform: "translate(-50%,-50%) translateY(0)" },
          "50%": { transform: "translate(-50%,-50%) translateY(-18px)" },
        },
      },
    },
  },
  plugins: [],
};