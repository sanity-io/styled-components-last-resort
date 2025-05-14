import { Inter } from 'next/font/google';
import { Body, Html, LayoutProvider } from './layout.client';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Html className={inter.className}>
      <Body>
        <LayoutProvider>{children}</LayoutProvider>
      </Body>
    </Html>
  );
}
