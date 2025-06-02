'use client';

import { styled } from 'styled-components-original';
import { TestStartTransition } from '../TestStartTransition';
import { connection } from 'next/server';

const Assert = styled.div`
  .test:not(:has(&)) {
    background-color: var(--failure-fg);
    color: var(--failure-bg);
    --test: 0;
  }
`;

export default function Original() {
  connection();
  return (
    <TestStartTransition>
      <Assert />
    </TestStartTransition>
  );
}
