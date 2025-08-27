'use client'

import {styled} from 'styled-components-original'
import {TestSuspenseFallback} from '../../TestSuspenseFallback'

const Assert = styled.div`
  .test:not(:has(&)) {
    background-color: var(--failure-fg);
    color: var(--failure-bg);
    --test: 0;
  }
`

export default function OriginalSuspense() {
  return (
    <TestSuspenseFallback>
      <Assert />
    </TestSuspenseFallback>
  )
}
