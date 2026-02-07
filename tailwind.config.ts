import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./queries/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        green: "rgb(var(--green) / <alpha-value>)",
        blue: "rgb(var(--blue) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        purple: "rgb(var(--purple) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)"
      }
    }
  },
  plugins: []
};
export default config;
