import { defineConfig, type UserConfig } from 'tsdown/config';
import pkg from './package.json' with { type: 'json' };

const base = {
  entry: 'src/index.ts',
  sourcemap: true,
  dts: true,
  outputOptions: { format: 'esm' },
  define: { __VERSION__: JSON.stringify(pkg.version) },
} satisfies UserConfig;

export default [
  defineConfig({
    ...base,
    define: { ...base.define, __SERVER__: JSON.stringify(true) },
    platform: 'node',
    outDir: 'dist/node',
  }),
  defineConfig({
    ...base,
    define: { ...base.define, __SERVER__: JSON.stringify(false) },
    platform: 'browser',
    outDir: 'dist/browser',
  }),
  defineConfig({
    ...base,
    define: { ...base.define, __SERVER__: JSON.stringify(false) },
    platform: 'neutral',
    outDir: 'dist/default',
  }),
];
