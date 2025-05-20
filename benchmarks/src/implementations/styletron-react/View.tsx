import { styled } from 'styletron-react';

export const View = styled('div', {
  alignItems: 'stretch',
  borderWidth: '0px',
  borderStyle: 'solid',
  boxSizing: 'border-box',
  display: 'flex',
  flexBasis: 'auto',
  flexDirection: 'column',
  flexShrink: '0',
  margin: '0px',
  padding: '0px',
  position: 'relative',
  // fix flexbox bugs
  minHeight: '0px',
  minWidth: '0px',
});
