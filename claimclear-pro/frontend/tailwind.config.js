/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8eceff",
          400: "#59b2ff",
          500: "#3391ff",
          600: "#1a6ff5",
          700: "#145ae1",
          800: "#1749b6",
          900: "#19408f",
          950: "#142957",
        },
        teal: {
          50: "#effefb",
          100: "#c8fff4",
          200: "#91feea",
          300: "#53f5dc",
          400: "#20e0c9",
          500: "#07c4b0",
          600: "#039e91",
          700: "#077e75",
          800: "#0b645e",
          900: "#0e534e",
          950: "#003331",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
