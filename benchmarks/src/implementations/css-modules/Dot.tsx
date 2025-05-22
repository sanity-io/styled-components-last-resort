import type { DotProps } from '../../types';
import styles from './dot.module.css';
import { View } from './View';

export const Dot = ({ $size, $x, $y, $color, $opacity }: DotProps) => (
  <View
    className={styles.dot}
    style={{
      ['--css-module-dot-color' as string]: $color,
      ['--css-module-dot-size' as string]: `${$size / 2}px`,
      ['--css-module-dot-x' as string]: `${$x}px`,
      ['--css-module-dot-y' as string]: `${$y}px`,
      ['--css-module-dot-opacity' as string]: $opacity,
    }}
  />
);
