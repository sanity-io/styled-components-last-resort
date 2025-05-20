/* Import singletons */
import { SC_VERSION } from './constants';
import css from './constructors/css';
import keyframes from './constructors/keyframes';
/* Import hooks */
import {
  IStyleSheetContext,
  IStyleSheetManager,
  IStylisContext,
  StyleSheetConsumer,
  StyleSheetContext,
  StyleSheetManager,
} from './models/StyleSheetManager';
/* Import components */
import ThemeProvider, { ThemeConsumer, ThemeContext, useTheme } from './models/ThemeProvider';
import isStyledComponent from './utils/isStyledComponent';

/* Export everything */
export * from './secretInternals';
export type { Attrs, DefaultTheme, ShouldForwardProp } from './types';
export {
  type IStyleSheetContext,
  type IStyleSheetManager,
  type IStylisContext,
  StyleSheetConsumer,
  StyleSheetContext,
  StyleSheetManager,
  ThemeConsumer,
  ThemeContext,
  ThemeProvider,
  css,
  isStyledComponent,
  keyframes,
  useTheme,
  SC_VERSION as version,
};
