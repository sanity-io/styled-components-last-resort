import { Inter } from 'next/font/google';
import { LayoutProvider } from './layout.client';
import { StyledComponentsRegistry } from './registry';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.className}>
      <body>
        <StyledComponentsRegistry>
          <LayoutProvider>{children}</LayoutProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
