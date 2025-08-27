'use client'

import {styled} from 'styled-components-original'
import {TestStartTransition} from '../../TestStartTransition'

const Assert = styled.div`
  .test:not(:has(&)) {
    background-color: var(--failure-fg);
    color: var(--failure-bg);
    --test: 0;
  }
`

export default function OriginalTransition() {
  return (
    <TestStartTransition>
      <Assert />
    </TestStartTransition>
  )
}
