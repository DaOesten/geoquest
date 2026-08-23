import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        gq: {
          black: "#0B0F12",
          "dark-teal": "#0E1F24",
          teal: "#00E0D1",
          "teal-hover": "#3FF0E4",
          "teal-press": "#00B3A8",
          lime: "#C6FF00",
          white: "#FFFFFF",
          grey: "#A0A7AD",
          "grey-dark": "#5B646A",
          "grey-bg": "#2B3438",
        },
      },
      fontFamily: {
        display: ['"Anton"', '"Bebas Neue"', "Impact", "sans-serif"],
        tech: ['"Orbitron"', '"Rubik"', "sans-serif"],
        body: ['"Rubik"', '"Helvetica Neue"', "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "999px",
        card: "16px",
        badge: "6px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,224,209,.35), 0 0 18px rgba(0,224,209,.35)",
        "glow-strong":
          "0 0 0 1px rgba(0,224,209,.5), 0 0 28px rgba(0,224,209,.55)",
        "glow-lime":
          "0 0 0 1px rgba(198,255,0,.35), 0 0 18px rgba(198,255,0,.32)",
        card: "0 10px 24px rgba(0,0,0,.45)",
        "card-hover": "0 14px 32px rgba(0,0,0,.55)",
      },
      transitionTimingFunction: {
        gq: "cubic-bezier(.16,.84,.44,1)",
        "gq-pop": "cubic-bezier(.34,1.56,.64,1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "320ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
