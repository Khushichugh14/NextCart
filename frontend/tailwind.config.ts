import type { Config } from 'tailwindcss';

/**
 * Tailwind configuration for the NextCart e‑commerce frontend.
 *
 * - Uses **class** based dark mode (`media` fallback) for premium dark‑mode support.
 * - Defines a curated, harmonious color palette using HSL values.
 * - Adds custom utilities for glassmorphism effects and subtle micro‑animations.
 * - Includes the `src/**` paths for purge (Next.js App Router places UI under `app`).
 */
const config: Config = {
  darkMode: 'class', // Enable manual toggle of dark mode via a CSS class on <html>
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220, 90%, 56%)', // vibrant blue
        secondary: 'hsl(340, 80%, 58%)', // soft pink
        accent: 'hsl(45, 95%, 55%)', // warm amber
        background: 'hsl(210, 15%, 98%)',
        backgroundDark: 'hsl(210, 15%, 10%)',
        card: 'hsla(0, 0%, 100%, 0.75)',
        cardDark: 'hsla(0, 0%, 12%, 0.75)',
        border: 'hsl(210, 12%, 80%)',
        borderDark: 'hsl(210, 10%, 30%)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
