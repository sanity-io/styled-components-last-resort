import type { NextConfig } from 'next';

const config: NextConfig = {
  compiler: {
    styledComponents: {
      topLevelImportPaths: ['styled-components', 'styled-components-original'],
    },
  },
  env: { SC_DISABLE_SPEEDY: 'false' },
};

export default config;
