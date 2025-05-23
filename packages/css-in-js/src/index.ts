import { SC_ATTR } from './constants';
import styled, { LibraryStyled, Styled, StyledInstance } from './constructors/styled';

/* Warning if you've imported this file on React Native */
if (
  process.env.NODE_ENV !== 'production' &&
  typeof navigator !== 'undefined' &&
  navigator.product === 'ReactNative'
) {
  console.warn(
    `It looks like you've imported 'styled-components' on React Native.\nPerhaps you're looking to import 'styled-components/native'?\nRead more about this at https://www.styled-components.com/docs/basics#react-native`
  );
}

const windowGlobalKey = `__sc-${SC_ATTR}__`;

/* Warning if there are several instances of styled-components */
if (
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'test' &&
  typeof window !== 'undefined'
) {
  // @ts-expect-error dynamic key not in window object
  window[windowGlobalKey] ||= 0;

  // @ts-expect-error dynamic key not in window object
  if (window[windowGlobalKey] === 1) {
    console.warn(
      `It looks like there are several instances of 'styled-components' initialized in this application. This may cause dynamic styles to not render properly, errors during the rehydration process, a missing theme prop, and makes your application bigger without good reason.\n\nSee https://s-c.sh/2BAXzed for more info.`
    );
  }

  // @ts-expect-error dynamic key not in window object
  window[windowGlobalKey] += 1;
}

export * from './base';
export type {
  CSSKeyframes,
  CSSObject,
  CSSProp,
  CSSProperties,
  CSSPseudos,
  DataAttributes,
  DefaultTheme,
  ExecutionContext,
  ExecutionProps,
  FastOmit,
  IStyledComponent,
  IStyledComponentFactory,
  IStyledStatics,
  Interpolation,
  PolymorphicComponent,
  PolymorphicComponentProps,
  RuleSet,
  Runtime,
  StyleFunction,
  StyledObject,
  StyledOptions,
  SupportedHTMLElements,
  WebTarget,
} from './types';
export { type LibraryStyled, type Styled, type StyledInstance, styled };
export default styled;
