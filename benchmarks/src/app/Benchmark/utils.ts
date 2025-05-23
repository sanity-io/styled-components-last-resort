import { BenchmarkType } from './BenchmarkType';

export function shouldRender(cycle: number, type: string) {
  switch (type) {
    // Render every odd iteration (first, third, etc)
    // Mounts and unmounts the component
    case BenchmarkType.MOUNT:
    case BenchmarkType.UNMOUNT:
      return !((cycle + 1) % 2);
    // Render every iteration (updates previously rendered module)
    case BenchmarkType.UPDATE:
      return true;
    default:
      return false;
  }
}

export function shouldSuspend(cycle: number, type: string) {
  switch (type) {
    case BenchmarkType.MOUNT:
    case BenchmarkType.UNMOUNT:
      return false;
    // return Math.floor(cycle / 2) % 2 === 1;
    case BenchmarkType.UPDATE:
      return !((cycle + 1) % 2);
    default:
      return false;
  }
}

export function shouldRecord(cycle: number, type: string) {
  switch (type) {
    // Record every odd iteration (when mounted: first, third, etc)
    case BenchmarkType.MOUNT:
      return !((cycle + 1) % 2);
    // Record every iteration
    case BenchmarkType.UPDATE:
      return true;
    // Record every even iteration (when unmounted)
    case BenchmarkType.UNMOUNT:
      return !(cycle % 2);
    default:
      return false;
  }
}

export function isDone(cycle: number, sampleCount: number, type: string) {
  switch (type) {
    case BenchmarkType.MOUNT:
      return cycle >= sampleCount * 2 - 1;
    case BenchmarkType.UPDATE:
      return cycle >= sampleCount - 1;
    case BenchmarkType.UNMOUNT:
      return cycle >= sampleCount * 2;
    default:
      return true;
  }
}

export const sortNumbers = (a: number, b: number) => a - b;
