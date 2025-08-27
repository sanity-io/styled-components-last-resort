import type {NextConfig} from 'next'

const config: NextConfig = {
  compiler: {
    styledComponents: {
      topLevelImportPaths: ['styled-components', 'styled-components-original'],
      // Enabling this somehow breaks the test and `styled-components-original` no longer inserts rules correctly
      // transpileTemplateLiterals: false,
    },
  },
  env: {SC_DISABLE_SPEEDY: 'false'},
}

export default config
