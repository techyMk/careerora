import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"],
        display: ["var(--font-inter)", "Inter", "ui-sans-serif"],
      },
      colors: {
        ink: {
          950: "#070914",
          900: "#0B0F19",
          800: "#111827",
          700: "#1F2937",
          600: "#2A3142",
        },
        brand: {
          blue: "#3B82F6",
          indigo: "#4F46E5",
          violet: "#7C3AED",
          purple: "#8B5CF6",
          fuchsia: "#D946EF",
          pink: "#EC4899",
          cyan: "#06B6D4",
        },
        muted: { fg: "#9CA3AF" },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #3B82F6 0%, #7C3AED 50%, #EC4899 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(124,58,237,0.18) 50%, rgba(236,72,153,0.18) 100%)",
        "radial-spotlight":
          "radial-gradient(60% 50% at 50% 0%, rgba(124,58,237,0.25) 0%, rgba(11,15,25,0) 75%)",
        "grid-fade":
          "linear-gradient(to bottom, transparent, rgba(11,15,25,0.9))",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 10px 60px -10px rgba(124,58,237,0.45)",
        "glow-pink":
          "0 0 0 1px rgba(255,255,255,0.06), 0 10px 60px -10px rgba(236,72,153,0.4)",
        "glow-blue":
          "0 0 0 1px rgba(255,255,255,0.06), 0 10px 60px -10px rgba(59,130,246,0.4)",
        soft: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 30px rgba(0,0,0,0.35)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
