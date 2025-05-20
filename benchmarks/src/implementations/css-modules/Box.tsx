import classnames from 'classnames';
import type { BoxProps } from '../../types';
import styles from './box.module.css';
import { View } from './View';

export const Box = ({
  $color,
  $fixed = false,
  $layout = 'column',
  $outer = false,
  ...other
}: BoxProps) => (
  <View
    {...other}
    className={classnames(styles.box, styles[`color${$color}`], {
      [styles.fixed]: $fixed,
      [styles.outer]: $outer,
      [styles.row]: $layout === 'row',
    })}
  />
);
