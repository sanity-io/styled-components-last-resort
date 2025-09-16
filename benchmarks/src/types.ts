/// <reference types="react-native-web" />

import type React from 'react'

export type SafeAny = any

export type BoxColor = 0 | 1 | 2 | 3 | 4 | 5

export interface BoxProps {
  children?: React.ReactNode
  $color?: BoxColor
  $layout?: 'column' | 'row'
  $outer?: boolean
  $fixed?: boolean
}
export interface DotProps {
  $color: string
  $size: number
  $x: number
  $y: number
}
export interface ProviderProps {
  children: React.ReactNode
}
export interface ViewProps {
  children: React.ReactNode
}

export interface ImplementationComponents {
  Box: React.ComponentType<BoxProps>
  Dot: React.ComponentType<DotProps>
  Provider: React.ComponentType<ProviderProps>
  View: React.ComponentType<ViewProps>
}

export interface Implementation {
  components: ImplementationComponents
  name: string
  version: string
}

export interface SierpinskiTriangleProps {
  components: ImplementationComponents
  depth?: number
  renderCount: number
  s: number
  x: number
  y: number
}

export interface TreeProps {
  components: ImplementationComponents
  breadth: number
  depth: number
  id: number
  wrap: number
}

export interface TestReport {
  benchmarkName: string
  libraryName: string
  libraryVersion?: string
  runner: string
  sampleCount?: number
  mean?: number
  meanLayout?: number
  meanScripting?: number
  stdDev?: number
  runTime?: number
  meanScriptingP75?: number
  meanScriptingP99?: number
}

export interface Test<ComponentType extends React.ComponentType<SafeAny>> {
  Component: ComponentType
  getComponentProps: (props: {cycle: number}) => React.ComponentProps<ComponentType>
  sampleCount: number
  Provider: React.ComponentType<ProviderProps>
  benchmarkType: 'mount' | 'update'
  version: string
  name: string
}

export type TestBlock<ComponentType extends React.ComponentType<SafeAny>> = Record<
  string,
  Test<ComponentType>
>

export type Tests<ComponentType extends React.ComponentType<SafeAny>> = Record<
  string,
  TestBlock<ComponentType>
>

export interface BenchmarkRef {
  start: () => void
}
