import { useCallback, useSyncExternalStore } from 'react';

export function useHydrating() {
  return useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => false,
    () => true
  );
}
