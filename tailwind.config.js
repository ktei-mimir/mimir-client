/** @type {import("tailwindcss").Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/preline/dist/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Open Sans']
      }
    }
  },
  plugins: [require('preline/plugin')]
}
