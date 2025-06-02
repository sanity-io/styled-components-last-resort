import { StyleSheet } from 'aphrodite/no-important';
import type { DotProps } from '../../types';
import { View } from './View';

const dotStyles = StyleSheet.create({
  base: {
    position: 'absolute',
    cursor: 'pointer',
    width: 0,
    height: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    transform: 'translate(50%, 50%)',
  },
});

export function Dot({ $color, $size, $x, $y, $opacity }: DotProps) {
  return (
    <View
      styles={[dotStyles.base]}
      style={{
        marginLeft: $x,
        marginTop: $y,
        borderBottomColor: $color,
        borderRightWidth: $size / 2,
        borderBottomWidth: $size / 2,
        borderLeftWidth: $size / 2,
        opacity: $opacity,
      }}
    />
  );
}
