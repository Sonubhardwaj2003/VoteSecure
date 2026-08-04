/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#80a8ff",
          400: "#4d80ff",
          500: "#2657ff",
          600: "#1b3fe0",
          700: "#1730ab",
          800: "#14267f",
          900: "#101d5e",
        },
        ink: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "pulse-ring": "pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(38,87,255,0.35)" },
          "100%": { boxShadow: "0 0 0 12px rgba(38,87,255,0)" },
        },
        float: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(20px, -20px)" },
        },
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle, rgba(38,87,255,0.16) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-grid": "22px 22px",
      },
    },
  },
  plugins: [],
};
