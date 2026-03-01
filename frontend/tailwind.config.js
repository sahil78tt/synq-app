/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Lora", "Georgia", "serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#f8f8f7",
          dark: "#111110",
        },
        panel: {
          DEFAULT: "#ffffff",
          dark: "#1a1a18",
        },
        border: {
          DEFAULT: "#e8e8e6",
          dark: "#2a2a28",
        },
        muted: {
          DEFAULT: "#9a9a96",
          dark: "#6a6a66",
        },
        charcoal: {
          DEFAULT: "#2c2c2a",
          dark: "#f0f0ee",
        },
        accent: {
          DEFAULT: "#4a4a8a",
          light: "#6e6eb8",
          soft: "#eeeef8",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)",
        card: "0 4px 24px -2px rgba(0,0,0,0.06), 0 1px 4px -1px rgba(0,0,0,0.04)",
        message: "0 1px 2px 0 rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
