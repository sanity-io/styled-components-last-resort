'use client';

import { buildTheme } from '@sanity/ui/theme';
import { ThemeProvider } from '@sanity/ui';

const theme = buildTheme();

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
  }

  body {
    margin: 0;
    padding: 0;
  }
`;

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
