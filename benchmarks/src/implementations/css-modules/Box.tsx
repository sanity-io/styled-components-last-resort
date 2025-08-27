import {cx} from 'classix'
import type {BoxProps} from '../../types'
import {View} from './View'

import styles from './box.module.css'

export const Box = ({
  children,
  $color,
  $fixed = false,
  $layout = 'column',
  $outer = false,
}: BoxProps) => (
  <View
    className={cx(
      styles.box,
      styles[`color${$color}`],
      $fixed && styles.fixed,
      $outer && styles.outer,
      $layout === 'row' && styles.row,
    )}
  >
    {children}
  </View>
)
