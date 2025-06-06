import type { ThemeColorSchemeKey } from '@sanity/ui';
import { createContext, type Dispatch, type SetStateAction } from 'react';

export const SchemeContextSetState = createContext<Dispatch<SetStateAction<ThemeColorSchemeKey>>>(
  () => {
    throw new Error('SchemeContextSetState not initialized');
  }
);
SchemeContextSetState.displayName = 'SchemeContextSetState';
