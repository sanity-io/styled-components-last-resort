import styled from 'styled-components-v6';
import type { DotProps } from '../../types';
import { View } from './View';

export const Dot = styled(View).attrs(p => ({
  style: { borderBottomColor: (p as unknown as DotProps).$color },
}))<DotProps>(props => ({
  borderBottomWidth: `${props.$size / 2}px`,
  borderColor: 'transparent',
  borderLeftWidth: `${props.$size / 2}px`,
  borderRightWidth: `${props.$size / 2}px`,
  borderStyle: 'solid',
  borderTopWidth: 0,
  cursor: 'pointer',
  height: 0,
  marginLeft: `${props.$x}px`,
  marginTop: `${props.$y}px`,
  position: 'absolute',
  transform: 'translate(50%, 50%)',
  width: 0,
  opacity: props.$opacity,
}));
