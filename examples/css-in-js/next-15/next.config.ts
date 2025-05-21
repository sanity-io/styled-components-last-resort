import type { NextConfig } from 'next';

const config: NextConfig = {
  compiler: { styledComponents: { transpileTemplateLiterals: false } },
};

export default config;
