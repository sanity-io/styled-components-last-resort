import {useSyncExternalStore} from 'react'

export function useHydrating(): boolean {
  return useSyncExternalStore(noop, getSnapshot, getServerSnapshot)
}

function noop() {
  return () => {}
}

function getSnapshot() {
  return false
}

function getServerSnapshot() {
  return true
}
