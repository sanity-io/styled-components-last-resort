import {createElement, StyleSheet} from 'react-native'
import type {DotProps} from '../../types'

export const Dot = ({$size, $x, $y, $color, $opacity}: DotProps) =>
  createElement('div', {
    style: [
      styles.root,
      {
        borderBottomColor: $color,
        borderRightWidth: $size / 2,
        borderBottomWidth: $size / 2,
        borderLeftWidth: $size / 2,
        marginLeft: $x,
        marginTop: $y,
        opacity: $opacity,
      },
    ],
  })

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    cursor: 'pointer',
    width: 0,
    height: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    // @ts-expect-error - fix later
    transform: [{translateX: '50%'}, {translateY: '50%'}],
  },
})
