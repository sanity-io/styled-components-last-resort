import type {BoxProps} from '../../types'
import {viewStyle} from './View'

export const Box = ({
  children,
  $color,
  $fixed = false,
  $layout = 'column',
  $outer = false,
}: BoxProps) => {
  return (
    <div
      style={{
        ...viewStyle,
        backgroundColor: getColor($color),
        height: $fixed ? 6 : undefined,
        width: $fixed ? 6 : undefined,
        flexDirection: $layout === 'row' ? 'row' : viewStyle.flexDirection,
        alignSelf: $outer ? 'flex-start' : undefined,
        padding: $outer ? 4 : viewStyle.padding,
      }}
    >
      {children}
    </div>
  )
}

const getColor = (color: BoxProps['$color']) => {
  switch (color) {
    case 0:
      return '#14171A'
    case 1:
      return '#AAB8C2'
    case 2:
      return '#E6ECF0'
    case 3:
      return '#FFAD1F'
    case 4:
      return '#F45D22'
    case 5:
      return '#E0245E'
    default:
      return 'transparent'
  }
}
