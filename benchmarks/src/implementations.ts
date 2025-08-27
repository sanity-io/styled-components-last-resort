import packageJson from '../package.json'
import type {Implementation, ImplementationComponents} from './types'
import {version as sanityCssInJsVersion} from '@sanity/css-in-js/package.json'
import {version as sanityStyledComponentsVersion} from '@sanity/styled-components/package.json'
import {version as styledComponentsV6Version} from 'styled-components-v6/package.json'
import {version as styledComponentsUseInsertionEffectVersion} from 'styled-components-use-insertion-effect/package.json'
import {version as styledComponentsV5Version} from 'styled-components-v5/package.json'

const {dependencies} = packageJson
const modules = import.meta.glob('./implementations/*/index.ts', {
  import: 'default',
  eager: true,
}) as Record<string, ImplementationComponents>
const dependencyMap = {
  'emotion': '@emotion/styled',
  'sanity-css-in-js': '@sanity/css-in-js',
  'sanity-styled-components': '@sanity/styled-components',
  'styled-components': 'styled-components-v6',
  'styled-components-object': 'styled-components-v6',
  'styled-components-use-insertion-effect': 'styled-components-use-insertion-effect',
  'styled-components-v5': 'styled-components-v5',
} as const

type ValueOf<T> = T[keyof T]
const versionMap = {
  '@sanity/css-in-js': sanityCssInJsVersion,
  '@sanity/styled-components': sanityStyledComponentsVersion,
  'styled-components-v6': styledComponentsV6Version,
  'styled-components-use-insertion-effect': styledComponentsUseInsertionEffectVersion,
  'styled-components-v5': styledComponentsV5Version,
} as const satisfies Partial<Record<ValueOf<typeof dependencyMap>, string>>

export const implementations: Record<string, Implementation> = {}

for (const [path, components] of Object.entries(modules)) {
  const name = path.split('/')[2] // Get folder name from path
  // @ts-expect-error - fix later
  let version = dependencies[dependencyMap[name] || name] || ''
  if (name in dependencyMap && dependencyMap[name as keyof typeof dependencyMap] in versionMap) {
    version =
      versionMap[dependencyMap[name as keyof typeof dependencyMap] as keyof typeof versionMap]
  }
  implementations[name] = {components, name, version}
}
