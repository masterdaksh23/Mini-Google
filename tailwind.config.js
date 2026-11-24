/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC05',
          green: '#34A853',
        },
        dark: {
          900: '#0a0d14',
          800: '#111726',
          700: '#1a2238',
          600: '#232d4b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-green': '0 0 25px -5px rgba(52, 168, 83, 0.5), 0 0 10px -2px rgba(52, 168, 83, 0.3)',
        'glow-red': '0 0 25px -5px rgba(234, 67, 53, 0.5), 0 0 10px -2px rgba(234, 67, 53, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(66, 133, 244, 0.5), 0 0 10px -2px rgba(66, 133, 244, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}

