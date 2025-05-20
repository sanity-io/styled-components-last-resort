import type { DotProps } from '../../types';

export const Dot = ({ $size, $x, $y, $color }: DotProps) => (
  <div
    style={{
      position: 'absolute',
      cursor: 'pointer',
      width: 0,
      height: 0,
      borderColor: 'transparent',
      borderStyle: 'solid',
      borderTopWidth: 0,
      transform: 'translate(50%, 50%)',
      borderBottomColor: $color,
      borderRightWidth: `${$size / 2}px`,
      borderBottomWidth: `${$size / 2}px`,
      borderLeftWidth: `${$size / 2}px`,
      marginLeft: `${$x}px`,
      marginTop: `${$y}px`,
    }}
  />
);
