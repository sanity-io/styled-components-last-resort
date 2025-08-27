import react from '@vitejs/plugin-react'
import {stylex} from 'vite-plugin-stylex-dev'

// import { createRequire } from 'module';

import {defineConfig} from 'vite'

// const require = createRequire(import.meta.url);

// const reactStrictDomPreset = require('react-strict-dom/babel-preset');

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    // minify: false,
  },
  define: {__VERSION__: JSON.stringify('benchmark')},
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-dom/client': 'react-dom/profiling',
    },
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    stylex(),
    react({
      babel: {
        plugins: [
          'babel-plugin-react-native-web',
          ['styled-jsx/babel', {optimizeForSpeed: true}],
          ['babel-plugin-react-compiler', {target: '19'}],
        ],
        // presets: [[reactStrictDomPreset, { debug: true, dev: true }]],
      },
      // babel: { configFile: true },
      // include: ['node_modules/react-strict-dom/*.js'],
    }),
  ],
})
