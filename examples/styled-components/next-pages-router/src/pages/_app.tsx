import type {AppProps} from 'next/app'
import {buildTheme} from '@sanity/ui/theme'
import {ThemeProvider} from '@sanity/ui'

const theme = buildTheme()

import {Inter} from 'next/font/google'
import {createGlobalStyle} from 'styled-components'

const inter = Inter({subsets: ['latin']})

const GlobalStyle = createGlobalStyle`
  html {
    font-family: ${inter.style.fontFamily};
  }

  html,
  body {
    height: 100%;
  }

  body {
    margin: 0;
    padding: 0;
  }

  #__next {
    display: contents;
  }
`

export default function App({Component, pageProps}: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
