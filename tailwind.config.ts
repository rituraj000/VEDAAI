import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF5722",
          "orange-dark-border": "#E2704E",
        },
        charcoal: {
          DEFAULT: "#2B2B2B",
          soft: "#303030",
        },
        peach: {
          highlight: "#F4E3D9",
        },
        sidebar: {
          "active-bg": "#F0F0F0",
        },
        canvas: {
          bg: "#E2E2E2",
        },
        card: {
          white: "#FFFFFF",
        },
        border: {
          gray: "#E5E5E5",
        },
        selected: {
          "card-border": "#FDBB93",
          "badge-orange": "#FF7C55",
        },
        default: {
          "badge-gray": "#BCBCBC",
        },
        feedback: {
          "box-bg": "#F6F6F6",
        },
        score: {
          "correct-bg": "#91D381",
          "correct-text": "#2E7D32",
          "incorrect-bg": "#F4CBBF",
          "incorrect-text": "#D9534F",
        },
        muted: {
          text: "#6B6B6B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
