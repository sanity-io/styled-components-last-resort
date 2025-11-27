import {headers} from 'next/headers'
import {Inter} from 'next/font/google'
import {Body, Html, LayoutProvider} from './layout.client'

const inter = Inter({subsets: ['latin']})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const headersStore = await headers()
  const scheme = headersStore.get('Sec-CH-Prefers-Color-Scheme')
  return (
    <LayoutProvider scheme={scheme}>
      <Html className={inter.className}>
        <Body>{children}</Body>
      </Html>
    </LayoutProvider>
  )
}
