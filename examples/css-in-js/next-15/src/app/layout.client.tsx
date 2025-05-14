'use client';

import { buildTheme } from '@sanity/ui/theme';
import { ThemeProvider } from '@sanity/ui';

const theme = buildTheme();

import { styled } from 'styled-components';

export const Html = styled.html`
  height: 100%;
`;

export const Body = styled.body`
  height: 100%;
  margin: 0;
  padding: 0;
`;

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
