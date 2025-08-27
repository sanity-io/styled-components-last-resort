import {interpolateBuPu, interpolatePurples, interpolateRdPu} from 'd3-scale-chromatic'
import type {SierpinskiTriangleProps} from '../types'

const targetSize = 6

export function SierpinskiTriangle({
  components,
  s,
  x,
  y,
  depth = 0,
  renderCount = 0,
  opacity = 1,
}: SierpinskiTriangleProps) {
  const {Dot} = components

  if (Dot) {
    if (s <= targetSize) {
      let fn
      switch (depth) {
        case 1:
          fn = interpolatePurples
          break
        case 2:
          fn = interpolateBuPu
          break
        case 3:
        default:
          fn = interpolateRdPu
      }

      // introduce randomness to ensure that repeated runs don't produce the same colors
      const color = fn((renderCount * Math.random()) / 20)
      return (
        <Dot
          $color={color}
          $size={targetSize}
          $x={x - targetSize / 2}
          $y={y - targetSize / 2}
          $opacity={opacity}
        />
      )
    }

    s /= 2

    return (
      <>
        <SierpinskiTriangle
          components={components}
          depth={1}
          renderCount={renderCount}
          s={s}
          x={x}
          y={y - s / 2}
          opacity={opacity}
        />
        <SierpinskiTriangle
          components={components}
          depth={2}
          renderCount={renderCount}
          s={s}
          x={x - s}
          y={y + s / 2}
          opacity={opacity}
        />
        <SierpinskiTriangle
          components={components}
          depth={3}
          renderCount={renderCount}
          s={s}
          x={x + s}
          y={y + s / 2}
          opacity={opacity}
        />
      </>
    )
  } else {
    return <span style={{color: 'white'}}>No implementation available</span>
  }
}

SierpinskiTriangle.displayName = 'SierpinskiTriangle'
