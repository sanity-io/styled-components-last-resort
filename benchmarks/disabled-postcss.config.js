export default {
  plugins: {
    'postcss-react-strict-dom': {
      include: [
        // Include source files to watch for style changes
        'src/app/**/*.{js,jsx,mjs,ts,tsx}',
        // List any installed node_modules that include UI built with React Strict DOM
        'node_modules/react-strict-dom/*.js',
      ],
    },
    autoprefixer: {},
  },
};
