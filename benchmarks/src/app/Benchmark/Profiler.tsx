/**
 * Uses the React Profiler to gather benchmarking metrics,
 * which is able to better scope the performance of a component
 * and omit scripting time from the benchmarker itself.
 */

import React, {
  Profiler,
  startTransition,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
} from 'react';
import type { BenchmarkRef } from '../../types';
import { BenchmarkType } from './BenchmarkType';
import { getMean, getStdDev } from './math';
import * as Timing from './timing';

const shouldRender = (cycle: number, type: string) => {
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
};

const shouldRecord = (cycle: number, type: string) => {
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
};

const isDone = (cycle: number, sampleCount: number, type: string) => {
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
};

const sortNumbers = (a: number, b: number) => a - b;

type Sample = {
  scriptingStart: number;
  scriptingEnd?: number;
  layoutStart?: number;
  layoutEnd?: number;
};

export interface BenchmarkResults {
  sampleCount: number;
  mean: number;
  stdDev: number;
}

export interface BenchmarkProps {
  sampleCount: number;
  timeout: number;
  type: (typeof BenchmarkType)[keyof typeof BenchmarkType];
  getComponentProps: (props: { cycle: number }) => Record<string, any>;
  ref: React.Ref<BenchmarkRef>;
  component: any;
  onComplete: (results: BenchmarkResults) => void;
  forceLayout: boolean;
  forceConcurrent: boolean;
}

interface BenchmarkState {
  cycle: number;
  running: boolean;
}

type BenchmarkAction = { type: 'start' } | { type: 'cycle' } | { type: 'complete' };

export function BenchmarkProfiler(props: BenchmarkProps) {
  const {
    sampleCount = 50,
    timeout = 10_000, // 10 seconds
    type = BenchmarkType.MOUNT,
    getComponentProps,
    ref,
    component: Component,
    onComplete,
    forceLayout,
    forceConcurrent,
  } = props;

  const samplesRef = useRef<
    {
      start: number;
      end: number;
    }[]
  >([]);
  const _startTime = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        samplesRef.current = [];
        if (forceConcurrent) {
          startTransition(() => dispatch({ type: 'start' }));
        } else {
          dispatch({ type: 'start' });
        }
      },
    }),
    [forceConcurrent]
  );

  const [state, dispatch] = useReducer(
    (state: BenchmarkState, action: BenchmarkAction) => {
      switch (action.type) {
        case 'start':
          return { ...state, running: true, cycle: 0 };
        case 'cycle':
          return { ...state, cycle: state.cycle + 1 };
        case 'complete':
          return { ...state, running: false, cycle: 0 };
        default:
          return state;
      }
    },
    { cycle: 0, running: false },
    ({ cycle, running }) => ({ cycle, running, componentProps: getComponentProps({ cycle }) })
  );

  const { cycle, running } = state;

  const runningRef = useRef(false);
  useEffect(() => {
    if (running && !runningRef.current) {
      _startTime.current = Timing.now();
    }
    runningRef.current = running;

    if (!running) return;

    const now = Timing.now();
    if (!isDone(cycle, sampleCount, type) && now - _startTime.current < timeout) {
      if (forceLayout) {
        const layoutStart = Timing.now();
        if (document.body) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          document.body.offsetWidth;
        }
        const layoutEnd = Timing.now();
        console.log('layout', layoutStart, layoutEnd, layoutEnd - layoutStart);
      }
      // startTransition(() => dispatch({ type: 'cycle' }));
      const raf = requestAnimationFrame(() => {
        if (forceConcurrent) {
          startTransition(() => dispatch({ type: 'cycle' }));
        } else {
          dispatch({ type: 'cycle' });
        }
      });
      return () => cancelAnimationFrame(raf);
    } else {
      // startTransition(() => dispatch({ type: 'complete' }));

      const samples = samplesRef.current.reduce(
        (memo, sample) => {
          memo.push(sample);
          return memo;
        },
        [] as typeof samplesRef.current
      );
      const sortedElapsedTimes = samples
        .filter(Boolean)
        .map(({ start, end }) => end - start)
        .sort(sortNumbers);

      // onComplete({
      //   sampleCount: samples.length,
      //   mean: getMean(sortedElapsedTimes),
      //   stdDev: getStdDev(sortedElapsedTimes),
      // });
      const raf = requestAnimationFrame(() => {
        if (forceConcurrent) {
          startTransition(() => dispatch({ type: 'complete' }));
        } else {
          dispatch({ type: 'complete' });
        }

        onComplete({
          sampleCount: samples.length,
          mean: getMean(sortedElapsedTimes),
          stdDev: getStdDev(sortedElapsedTimes),
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [cycle, forceConcurrent, forceLayout, onComplete, running, sampleCount, timeout, type]);

  return (
    <Profiler
      id="benchmark"
      onRender={(_id, _phase, _actualDuration, _baseDuration, startTime, commitTime) => {
        if (running && shouldRecord(cycle, type)) {
          samplesRef.current[cycle] = {
            start: startTime,
            // end: startTime + actualDuration,
            end: commitTime,
          };
        }
        /*
        console.log('NEW onRender', {
          _id,
          _phase,
          _actualDuration,
          _baseDuration,
          startTime,
          commitTime,
        });
        // */
      }}
    >
      {running && shouldRender(cycle, type) ? (
        <Component
          // Since we're measuring the rendre of <Component /> with <Profiler /> we don't have to worry about
          // calculating the component props during render skewing testing results
          {...getComponentProps({ cycle })}
          // make sure props always change for update tests
          data-test={type === BenchmarkType.UPDATE ? cycle : undefined}
        />
      ) : null}
    </Profiler>
  );
}
BenchmarkProfiler.displayName = 'BenchmarkProfiler';
BenchmarkProfiler.Type = BenchmarkType;
