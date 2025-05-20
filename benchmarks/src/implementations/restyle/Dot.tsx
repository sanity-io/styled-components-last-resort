import { css, styled } from 'restyle';
import type { DotProps } from '../../types';
import { View } from './View';

const StyledView = styled(View, {
  borderColor: 'transparent',
  borderStyle: 'solid',
  borderTopWidth: 0,
  cursor: 'pointer',
  height: 0,
  position: 'absolute',
  transform: 'translate(50%, 50%)',
  width: 0,
});

export function Dot(props: DotProps) {
  const { $color, $x, $y, $size } = props;
  const [classNames, Styles] = css({
    borderBottomWidth: `${$size / 2}px`,
    borderLeftWidth: `${$size / 2}px`,
    borderRightWidth: `${$size / 2}px`,
    marginTop: `${$y}px`,
    marginLeft: `${$x}px`,
  });
  return (
    <>
      <StyledView className={classNames} style={{ borderBottomColor: $color }} />
      <Styles />
    </>
  );
}
