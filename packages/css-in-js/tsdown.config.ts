import { defineConfig, type UserConfig } from 'tsdown/config';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  entry: 'src/index.ts',
  sourcemap: true,
  dts: true,
  platform: 'neutral',
  define: { __VERSION__: JSON.stringify(pkg.version) },
});
