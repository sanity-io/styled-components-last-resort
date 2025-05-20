import packageJson from '../package.json';
import type { Implementation, ImplementationComponents } from './types';

const { dependencies } = packageJson;
const modules = import.meta.glob('./implementations/*/index.ts', {
  import: 'default',
  eager: true,
}) as Record<string, ImplementationComponents>;
const dependencyMap = {
  emotion: '@emotion/styled',
};

export const implementations: Record<string, Implementation> = {};

for (const [path, components] of Object.entries(modules)) {
  const name = path.split('/')[2]; // Get folder name from path
  // @ts-expect-error - fix later
  const version = dependencies[dependencyMap[name] || name] || '';
  implementations[name] = { components, name, version };
}
