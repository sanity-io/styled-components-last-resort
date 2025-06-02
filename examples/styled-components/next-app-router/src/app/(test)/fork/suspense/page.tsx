'use client';

import { styled } from 'styled-components';
import { TestSuspenseFallback } from '../../TestSuspenseFallback';

const Assert = styled.div`
  .test:not(:has(&)) {
    background-color: var(--failure-fg);
    color: var(--failure-bg);
    --test: 0;
  }
`;

export default function ForkSuspense() {
  return (
    <TestSuspenseFallback>
      <Assert />
    </TestSuspenseFallback>
  );
}
