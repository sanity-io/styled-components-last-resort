import styled from '@emotion/styled';
import type { DotProps } from '../../types';

// @ts-expect-error - fix later
const StyledDot = styled.div((p: DotProps) => ({
  position: 'absolute',
  cursor: 'pointer',
  width: 0,
  height: 0,
  borderColor: 'transparent',
  borderStyle: 'solid',
  borderTopWidth: 0,
  transform: 'translate(50%, 50%)',
  borderRightWidth: `${p.$size / 2}px`,
  borderBottomWidth: `${p.$size / 2}px`,
  borderLeftWidth: `${p.$size / 2}px`,
  marginLeft: `${p.$x}px`,
  marginTop: `${p.$y}px`,
  opacity: p.$opacity,
}));

export function Dot({ $color, ...props }: DotProps) {
  return <StyledDot {...props} style={{ borderBottomColor: $color }} />;
}
