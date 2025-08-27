import type {NextConfig} from 'next'

const config: NextConfig = {
  compiler: {styledComponents: {transpileTemplateLiterals: false}},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Accept-CH',
            value: 'Sec-CH-Prefers-Color-Scheme',
          },
          {
            key: 'Critical-CH',
            value: 'Sec-CH-Prefers-Color-Scheme',
          },
          {
            key: 'Vary',
            value: 'Sec-CH-Prefers-Color-Scheme',
          },
        ],
      },
    ]
  },
}

export default config
