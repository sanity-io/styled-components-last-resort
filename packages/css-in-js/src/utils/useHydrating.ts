import { useCallback, useSyncExternalStore } from 'react';

export function useHydrating(): boolean {
  return useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => false,
    () => true
  );
}
