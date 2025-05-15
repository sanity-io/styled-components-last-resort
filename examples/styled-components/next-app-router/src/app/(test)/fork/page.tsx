'use client';

import { styled } from 'styled-components';
import { TestStartTransition } from '../TestStartTransition';

const Assert = styled.div`
  .test:not(:has(&)) {
    --test: 0;
  }
`;

export default function Fork() {
  return (
    <TestStartTransition>
      <Assert />
    </TestStartTransition>
  );
}
