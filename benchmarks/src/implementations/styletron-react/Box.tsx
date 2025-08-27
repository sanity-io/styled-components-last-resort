import {withStyle} from 'styletron-react'
import type {BoxProps} from '../../types'
import {View} from './View'

export const Box = withStyle(
  View,
  ({$color, $fixed = false, $layout = 'column', $outer = false}: BoxProps) => ({
    ...(typeof $color === 'number' && styles[`color${$color}`]),
    ...($fixed && styles.fixed),
    ...($layout === 'row' && styles.row),
    ...($outer && styles.outer),
  }),
)

const styles = {
  outer: {
    alignSelf: 'flex-start',
    padding: '4px',
  },
  row: {
    flexDirection: 'row',
  },
  color0: {
    backgroundColor: '#14171A',
  },
  color1: {
    backgroundColor: '#AAB8C2',
  },
  color2: {
    backgroundColor: '#E6ECF0',
  },
  color3: {
    backgroundColor: '#FFAD1F',
  },
  color4: {
    backgroundColor: '#F45D22',
  },
  color5: {
    backgroundColor: '#E0245E',
  },
  fixed: {
    width: '6px',
    height: '6px',
  },
} as const
