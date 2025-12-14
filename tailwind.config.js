export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FBF7F2',
          100: '#F2E9DF',
          200: '#E6D7C2',
          300: '#D8C1A1',
          400: '#C59B6B',
          500: '#A5744A',
          600: '#8B5E3A',
          700: '#6F4B2E',
          800: '#553A23',
          900: '#3C2918',
        },
        cream: {
          50: '#FFFBF6',
          100: '#FFF6EB',
          200: '#FDEFD9',
          300: '#F8E7C6',
          400: '#F2DDB3',
          500: '#E7CB94',
          600: '#D8B678',
          700: '#C39E60',
          800: '#997B4A',
          900: '#6D5733',
        },
        pastel: {
          mint: '#D9F2E6',
          rose: '#FADDE1',
          peach: '#FFE5CA',
          sky: '#DDEBFF',
          lilac: '#E8D9FF',
        },
      },
    },
  },
  plugins: [],
}
