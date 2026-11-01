/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ---------------------------------------------------------------------
        // Efferd "Dashboard 3" dark-first design tokens:
        // near-black canvas, flat bordered surfaces, restrained monochrome ramp
        // with emerald/red reserved for functional deltas.
        // ---------------------------------------------------------------------
        background: '#0a0a0a',
        card: '#111111',
        'surface-muted': '#171717',
        border: '#242424',
        input: '#242424',
        ring: '#8a8a8a',
        foreground: '#fafafa',
        'muted-foreground': '#a1a1a1',
        accent: '#1f1f1f',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        chart: {
          1: '#e5e5e5',
          2: '#b8b8b8',
          3: '#8f8f8f',
          4: '#666666',
          5: '#404040',
        },

        // ---------------------------------------------------------------------
        // Legacy tokens remapped onto the new palette. These names are used by
        // existing screens; remapping keeps them consistent without a rewrite.
        //   neon-cyan   -> monochrome primary / interactive (light)
        //   neon-purple -> muted neutral
        //   neon-pink   -> functional danger red
        // ---------------------------------------------------------------------
        'bg-deep': '#0a0a0a',
        surface: '#141414',
        'neon-cyan': '#fafafa',
        'neon-purple': '#8f8f8f',
        'neon-pink': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        brand: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.8' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
