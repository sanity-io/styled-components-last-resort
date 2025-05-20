import type { NextConfig } from 'next';

const config: NextConfig = {
  compiler: {
    styledComponents: {
      topLevelImportPaths: ['styled-components', 'styled-components-original'],
    },
  },
};

export default config;
