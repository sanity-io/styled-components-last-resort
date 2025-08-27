import reactStrictPreset from 'react-strict-dom/babel-preset'

// https://babeljs.io/docs/options#envname
const dev = process.env.BABEL_ENV === 'development' || process.env.NODE_ENV === 'development'

export default {
  plugins: ['@babel/plugin-syntax-jsx'],
  presets: [
    '@babel/preset-typescript',
    [
      reactStrictPreset,
      {
        // debug: dev,
        debug: false,
        dev,
      },
    ],
  ],
}
