import packageJson from '../package.json';
import type { Implementation, ImplementationComponents } from './types';

const { dependencies } = packageJson;
const modules = import.meta.glob('./implementations/*/index.ts', {
  import: 'default',
  eager: true,
}) as Record<string, ImplementationComponents>;
const dependencyMap = {
  emotion: '@emotion/styled',
  'sanity-css-in-js': '@sanity/css-in-js',
  'sanity-styled-components': '@sanity/styled-components',
  'styled-components': 'styled-components-v6',
  'styled-components-object': 'styled-components-v6',
  'styled-components-use-insertion-effect': 'styled-components-use-insertion-effect',
  'styled-components-v5': 'styled-components-v5',
} as const;

type ValueOf<T> = T[keyof T];
const versionMap = {
  '@sanity/css-in-js': import('@sanity/css-in-js/package.json').then(r => r.version),
  '@sanity/styled-components': import('@sanity/styled-components/package.json').then(
    r => r.version
  ),
  'styled-components-v6': import('styled-components-v6/package.json').then(r => r.version),
  'styled-components-use-insertion-effect': import(
    'styled-components-use-insertion-effect/package.json'
  ).then(r => r.version),
  'styled-components-v5': import('styled-components-v5/package.json').then(r => r.version),
} as const satisfies Partial<Record<ValueOf<typeof dependencyMap>, Promise<string>>>;

export const implementations: Record<string, Implementation> = {};

for (const [path, components] of Object.entries(modules)) {
  const name = path.split('/')[2]; // Get folder name from path
  // @ts-expect-error - fix later
  let version = dependencies[dependencyMap[name] || name] || '';
  if (name in dependencyMap && dependencyMap[name as keyof typeof dependencyMap] in versionMap) {
    version =
      await versionMap[
        dependencyMap[name as keyof typeof dependencyMap] as keyof typeof versionMap
      ];
  }
  implementations[name] = { components, name, version };
}
