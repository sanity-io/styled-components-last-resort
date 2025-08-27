import {styled} from 'goober'
import type {DotProps} from '../../types'
import {View} from './View'

export const Dot = styled(View)<DotProps>`
  position: absolute;
  cursor: pointer;
  width: 0;
  height: 0;
  border-color: transparent;
  border-bottom-color: ${(p) => p.$color};
  border-style: solid;
  border-top-width: 0;
  transform: translate(50%, 50%);
  margin-left: ${(p) => `${p.$x}px`};
  margin-top: ${(p) => `${p.$y}px`};
  border-right-width: ${(p) => `${p.$size / 2}px`};
  border-bottom-width: ${(p) => `${p.$size / 2}px`};
  border-left-width: ${(p) => `${p.$size / 2}px`};
  opacity: ${(p) => p.$opacity};
`
