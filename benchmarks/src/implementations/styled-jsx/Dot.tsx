import type {DotProps} from '../../types'
import {style} from './View'

export const Dot = ({$color, $x, $y, $size, $opacity}: DotProps) => {
  return (
    <div style={{borderBottomColor: $color}}>
      <style jsx>{style}</style>

      <style jsx>
        {`
          div {
            position: absolute;
            cursor: pointer;
            width: 0;
            height: 0;
            border-color: transparent;
            border-style: solid;
            border-top-width: 0;
            transform: translate(50%, 50%);
          }
        `}
      </style>

      <style jsx>
        {`
          div {
            margin-left: ${$x}px;
            margin-top: ${$y}px;
            border-right-width: ${$size / 2}px;
            border-bottom-width: ${$size / 2}px;
            border-left-width: ${$size / 2}px;
            opacity: ${$opacity};
        `}
      </style>
    </div>
  )
}
