import react from '@vitejs/plugin-react'
import {defineConfig} from 'tsdown/config'
import pkg from './package.json' with {type: 'json'}

const entry = 'src/index.ts'
const sourcemap = true
const dts = true
const env = {__VERSION__: pkg.version}
const plugins = [react({babel: {plugins: [['babel-plugin-react-compiler', {target: '19'}]]}})]

export default defineConfig([
  {
    entry: {'react-server': entry},
    sourcemap,
    dts,
    env,
    platform: 'node',
  },
  {
    entry: {'browser': entry},
    sourcemap,
    dts,
    env,
    platform: 'browser',
    plugins,
  },
  {
    entry,
    sourcemap,
    dts,
    env,
    platform: 'neutral',
    plugins,
  }
])
