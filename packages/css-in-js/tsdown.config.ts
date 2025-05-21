import react from '@vitejs/plugin-react';
import { defineConfig } from 'tsdown/config';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  entry: 'src/index.ts',
  sourcemap: true,
  dts: true,
  platform: 'neutral',
  env: { __VERSION__: pkg.version },
  /*
  plugins: [react({ babel: { plugins: [['babel-plugin-react-compiler', { target: '19' }]] } })],
  // */
});
