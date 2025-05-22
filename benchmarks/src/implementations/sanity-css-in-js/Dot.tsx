import { styled } from '@sanity/css-in-js';
import type { DotProps } from '../../types';
import { View } from './View';

export const Dot = styled(View).attrs(p => ({
  style: { borderBottomColor: (p as unknown as DotProps).$color },
}))<DotProps>`
  position: absolute;
  cursor: pointer;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  border-top-width: 0;
  transform: translate(50%, 50%);
  margin-left: ${props => `${props.$x}px`};
  margin-top: ${props => `${props.$y}px`};
  border-right-width: ${props => `${props.$size / 2}px`};
  border-bottom-width: ${props => `${props.$size / 2}px`};
  border-left-width: ${props => `${props.$size / 2}px`};
  opacity: ${props => props.$opacity};
`;
