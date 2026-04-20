/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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