import 'virtual:stylex.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { SierpinskiTriangle } from './cases/SierpinskiTriangle';
import { Tree } from './cases/Tree';
import { implementations } from './implementations';
import type { ImplementationComponents, SafeAny, Test, TestBlock } from './types';

const packageNames = Object.keys(implementations);

function createTestBlock<ComponentType extends React.ComponentType<SafeAny>>(
  Component: ComponentType,
  fn: (
    components: ImplementationComponents
  ) => Omit<Test<ComponentType>, 'Component' | 'version' | 'name'>
): TestBlock<ComponentType> {
  const testSetups: TestBlock<ComponentType> = {};

  for (const packageName of packageNames) {
    const { name, components, version } = implementations[packageName];
    const { getComponentProps, sampleCount, Provider, benchmarkType } = fn(components);

    testSetups[packageName] = {
      Component,
      getComponentProps,
      sampleCount,
      Provider,
      benchmarkType,
      version,
      name,
    };
  }

  return testSetups;
}

const tests = {
  'Mount deep tree': createTestBlock(Tree, components => ({
    benchmarkType: 'mount',
    getComponentProps: ({ cycle }) => ({
      components,
      breadth: 2,
      depth: 8,
      id: cycle,
      wrap: 1,
    }),
    Provider: components.Provider,
    sampleCount: process.env.NODE_ENV === 'production' ? 500 : 5,
  })),
  'Mount wide tree': createTestBlock(Tree, components => ({
    benchmarkType: 'mount',
    getComponentProps: ({ cycle }) => ({
      components,
      breadth: 7,
      depth: 3,
      id: cycle,
      wrap: 2,
    }),
    Provider: components.Provider,
    sampleCount: process.env.NODE_ENV === 'production' ? 500 : 5,
  })),
  'Update dynamic styles': createTestBlock(SierpinskiTriangle, components => ({
    benchmarkType: 'update',
    getComponentProps: ({ cycle, opacity = 1 }) => ({
      components,
      s: 256,
      renderCount: cycle,
      x: 0,
      y: 0,
      opacity,
    }),
    Provider: components.Provider,
    sampleCount: process.env.NODE_ENV === 'production' ? 1_000 : 100,
  })),
};

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <App tests={tests} />
  </StrictMode>
);
