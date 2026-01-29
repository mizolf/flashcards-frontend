/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          soft: "rgb(var(--surface-soft) / <alpha-value>)",
          card: "rgb(var(--surface-card) / <alpha-value>)"
        },
        text: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)"
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          subtle: "rgb(var(--border-subtle) / <alpha-value>)"
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)"
        }
      },
      boxShadow: {
        card: "0 10px 25px -20px rgb(15 23 42 / 0.4)",
        cardHover: "0 20px 40px -25px rgb(15 23 42 / 0.35)"
      },
      height: {
        'deck-card': '12rem',
      }
    }
  },
  plugins: [],
}
