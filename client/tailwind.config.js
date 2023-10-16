/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modals/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { colors: {
        'primary': '#4939FA',
        'secondary': '#F4928A',
        'tertiary': '#E9C403'
      },},
  },
  plugins: [require("@tailwindcss/forms"),require('tailwind-scrollbar'),
],
};
