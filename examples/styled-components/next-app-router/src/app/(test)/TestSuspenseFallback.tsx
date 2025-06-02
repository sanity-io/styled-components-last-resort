/**
 * This test case checks if a render that is suspended with a fallback doesn't insert CSS rules.
 * If the library makes sure to use the `useInsertionEffect` hook then this test should pass.
 * The way this test works is by inserting a CSS rule that only matches if the rule exists but not the node it's targeting.
 * The CSS looks like this:
 * .test:not(:has(&)) {--test: 0;}
 * The & is replaced with the generated class name for the `styled.div`, let's pretend the class name is `sc-abc123`.
 * It is rendered as a child of the `main.test` node, so if `<div class="sc-abc123">` is in the DOM, and the CSS rule is inserted, then the rule won't match and the
 * `--test` custom property will not be `0` and the test will pass.
 * But if the library inserts CSS during render then the CSS rule is added to the CSSOM, but due to suspense the DOM won't be updated and `<div class="sc-abc123">` will not exist in the DOM by the
 * time the `<Resolve>` component is rendered and checks the DOM, and the `.test:not(:has(.sc-abc123))` selector will now match and cause the test to fail.
 */

import { Suspense, use, useEffect } from 'react';
import { useHydrating } from './hooks';

const { resolve, promise } = Promise.withResolvers<'pass' | 'fail'>();

export function TestSuspenseFallback({ children }: { children: React.ReactNode }) {
  const hydrating = useHydrating();

  return (
    <main
      className="test"
      ref={node => {
        node?.classList.add('mounted');
      }}
    >
      {hydrating ? (
        'running...'
      ) : (
        <Suspense fallback={<Resolve />}>
          {children}
          <Suspend />
        </Suspense>
      )}
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
    }, 1_000);
    return () => clearTimeout(timeout);
  }, []);

  return 'running...';
}

function Suspend() {
  return use(promise);
}
