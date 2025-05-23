import { styled } from 'styletron-react';
import type { DotProps } from '../../types';

const staticStyle = {
  position: 'absolute',
  cursor: 'pointer',
  width: 0,
  height: 0,
  borderColor: 'transparent',
  borderStyle: 'solid',
  borderTopWidth: 0,
  transform: 'translate(50%, 50%)',
} as const;

export const Dot = styled('div', ({ $size, $x, $y, $color, $opacity }: DotProps) => ({
  ...staticStyle,
  borderBottomColor: $color,
  borderRightWidth: `${$size / 2}px`,
  borderBottomWidth: `${$size / 2}px`,
  borderLeftWidth: `${$size / 2}px`,
  marginLeft: `${$x}px`,
  marginTop: `${$y}px`,
  opacity: $opacity,
}));
