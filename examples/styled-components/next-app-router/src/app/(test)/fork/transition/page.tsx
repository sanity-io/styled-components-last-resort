'use client';

import { styled } from 'styled-components';
import { TestStartTransition } from '../../TestStartTransition';

const Assert = styled.div`
  .test:not(:has(&)) {
    background-color: var(--failure-fg);
    color: var(--failure-bg);
    --test: 0;
  }
`;

export default function ForkTransition() {
  return (
    <TestStartTransition>
      <Assert />
    </TestStartTransition>
  );
}
