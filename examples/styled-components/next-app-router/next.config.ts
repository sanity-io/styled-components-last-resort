import type { NextConfig } from 'next';

const config: NextConfig = {
  compiler: { styledComponents: true },
  env: { SC_DISABLE_SPEEDY: 'false' },
  reactStrictMode: true,
};

export default config;
