import type { DotProps } from '../../types';
import { View } from './View';

import styles from './dot.module.css';

export const Dot = ({ $size, $x, $y, $color, $opacity }: DotProps) => (
  <View
    className={styles.dot}
    style={
      {
        ['--css-module-dot-color']: $color,
        ['--css-module-dot-size']: `${$size / 2}px`,
        ['--css-module-dot-x']: `${$x}px`,
        ['--css-module-dot-y']: `${$y}px`,
        ['--css-module-dot-opacity']: $opacity,
      } as React.CSSProperties
    }
  />
);
