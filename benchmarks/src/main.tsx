// import { scan, setOptions } from 'react-scan';

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
    sampleCount: 500,
    // sampleCount: 1,
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
    sampleCount: 500,
    // sampleCount: 1,
  })),
  'Update dynamic styles': createTestBlock(SierpinskiTriangle, components => ({
    benchmarkType: 'update',
    getComponentProps: ({ cycle }) => ({
      components,
      s: 256,
      renderCount: cycle,
      x: 0,
      y: 0,
    }),
    Provider: components.Provider,
    sampleCount: 1_000,
    // sampleCount: 1,
  })),
};

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <App tests={tests} />
  </StrictMode>
);

window.report = (offset: number) => {
  const results = new Map();
  for (const result of window.olsen) {
    if (!results.has(result.commitTime)) results.set(result.commitTime, []);
    results.get(result.commitTime).push(result);
  }

  const timeline = [...results.values()].filter(result => result.some(item => item.id === 'cycle'));
  const start = timeline.at(0).find(t => t.id === 'cycle');
  const startTime = start.startTime - offset;
  const report = timeline.map(group =>
    group.map(item => ({ timestamp: item.startTime - startTime, ...item }))
  );
  console.log(report);
};

// scan({
//   enabled: true,
//   dangerouslyForceRunInProduction: true,
//   // showToolbar: false,
//   // log: true,
// });

// setOptions({
//   onRender: (...args) => console.log('React Scan onRender', ...args),
//   onCommitStart: (...args) => console.log('React Scan onCommitStart', ...args),
//   onCommitFinish: (...args) => console.log('React Scan onCommitFinish', ...args),
//   onPaintStart: (...args) => console.log('React Scan onPaintStart', ...args),
//   onPaintFinish: (...args) => console.log('React Scan onPaintFinish', ...args),
// });
