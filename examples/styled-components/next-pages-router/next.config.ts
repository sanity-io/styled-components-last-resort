import type {NextConfig} from 'next'

const config: NextConfig = {
  compiler: {styledComponents: {transpileTemplateLiterals: false}},
  reactStrictMode: true,
}

export default config
