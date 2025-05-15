/**
 * This test case checks if a styled component is rendering during a transition in the background it doesn't insert CSS rules.
 * This is important for performance, as react when rendering a suspended route isn't expecting the CSS to change,
 * especially since background renders can be interrupted and the user might navigate away and there's no point in adding CSS rules
 * that are ultimately never used.
 *
 * This test case achieves that by only rendering the children prop when a background render is happening (a background render is happening)
 */

import { use, useEffect, useReducer, useTransition } from 'react';
import { useHydrating } from './hooks';

const { resolve, promise } = Promise.withResolvers<'pass' | 'fail'>();

export function TestStartTransition({ children }: { children: React.ReactNode }) {
  const [pending, run] = useReducer(state => !state, false);
  const [suspending, startTransition] = useTransition();
  const hydrating = useHydrating();
  useEffect(() => {
    if (hydrating) return;
    startTransition(run);
  }, [hydrating]);

  return (
    <main
      className="test"
      ref={node => {
        node?.classList.add('mounted');
      }}
    >
      {hydrating && 'running...'}
      {pending && !suspending && children}
      {pending && <Suspend />}
      {suspending && <Resolve />}
    </main>
  );
}

function Resolve() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const node = document.querySelector('.test');
      const result =
        window.getComputedStyle(node).getPropertyValue('--test') === '0' ? 'fail' : 'pass';
      node.classList.add(result);
      resolve(result);
    }, 3_000);
    return () => clearTimeout(timeout);
  }, []);

  return 'running...';
}

function Suspend() {
  return use(promise);
}
