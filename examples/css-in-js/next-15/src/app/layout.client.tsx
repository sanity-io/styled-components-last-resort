'use client';

import { buildTheme, type ThemeColorSchemeKey } from '@sanity/ui/theme';
import { ThemeProvider, usePrefersDark } from '@sanity/ui';
import { styled } from 'styled-components';
import { useState } from 'react';
import { SchemeContextSetState } from './scheme.client';

const theme = buildTheme();

export const Html = styled.html`
  height: 100%;
  background-color: ${props => props.theme.sanity.v2.color.bg};
`;

export const Body = styled.body`
  height: 100%;
  margin: 0;
  padding: 0;
`;

export function LayoutProvider({
  children,
  scheme: initialScheme,
}: {
  children: React.ReactNode;
  scheme: string;
}) {
  const prefersDark = usePrefersDark(() => initialScheme === 'dark');
  const [scheme, setScheme] = useState<ThemeColorSchemeKey>(prefersDark ? 'dark' : 'light');
  return (
    <ThemeProvider theme={theme} scheme={scheme}>
      <SchemeContextSetState value={setScheme}>{children}</SchemeContextSetState>
    </ThemeProvider>
  );
}
