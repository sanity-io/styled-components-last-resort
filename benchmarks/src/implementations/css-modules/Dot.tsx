import type {DotProps} from '../../types'
import {View} from './View'

import styles from './dot.module.css'

export const Dot = ({$size, $x, $y, $color}: DotProps) => (
  <View
    className={styles.dot}
    style={
      {
        ['--css-module-dot-color']: $color,
        ['--css-module-dot-size']: `${$size / 2}px`,
        ['--css-module-dot-x']: `${$x}px`,
        ['--css-module-dot-y']: `${$y}px`,
      } as React.CSSProperties
    }
  />
)
