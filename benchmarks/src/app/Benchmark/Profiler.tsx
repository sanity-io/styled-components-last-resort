/**
 * Uses the React Profiler to gather benchmarking metrics,
 * which is able to better scope the performance of a component
 * and omit scripting time from the benchmarker itself.
 */

import React, {
  Profiler,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useDeferredValue,
  unstable_Activity as Activity,
} from 'react';
import type { BenchmarkRef } from '../../types';
import { BenchmarkType } from './BenchmarkType';
import { getMean, getMedian, getStdDev } from './math';
import * as Timing from './timing';
import { shouldRecord, shouldRender } from './utils';

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

export interface BenchmarkResults {
  startTime: number;
  endTime: number;
  runTime: number;
  sampleCount: number;
  samples: {
    start: number;
    end: number;
    scriptingStart: number;
    scriptingEnd: number;
    layoutStart: number;
    layoutEnd: number;
  }[];
  max: number;
  min: number;
  median: number;
  mean: number;
  stdDev: number;
  meanLayout: number;
  meanScripting: number;
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
  componentProps: Record<string, any>;
  startTime: number;
  scriptingStart: number;
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
      scriptingStart: number;
      scriptingEnd?: number;
      layoutStart?: number;
      layoutEnd?: number;
    }[]
  >([]);
  const _startTime = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        _startTime.current = Timing.now();
        samplesRef.current = [];
        dispatch({ type: 'start' });
      },
    }),
    []
  );

  const [_state, dispatch] = useReducer(
    (state: BenchmarkState, action: BenchmarkAction) => {
      switch (action.type) {
        case 'start':
          return { ...state, running: true, cycle: 0, startTime: Timing.now() };
        case 'cycle':
          return {
            ...state,
            cycle: state.cycle + 1,
            componentProps: getComponentProps({ cycle: state.cycle + 1 }),
            scriptingStart: Timing.now(),
          };
        case 'complete':
          return { ...state, running: false, cycle: 0 };
        default:
          return state;
      }
    },
    { cycle: 0, running: false },
    ({ cycle, running }) => ({
      startTime: 0,
      scriptingStart: 0,
      cycle,
      running,
      componentProps: getComponentProps({ cycle }),
    })
  );

  const deferredState = useDeferredValue(_state);
  const state = forceConcurrent ? deferredState : _state;
  const { cycle, running, componentProps, scriptingStart, startTime } = state;

  // const runningRef = useRef(false);
  useEffect(() => {
    // if (running && !runningRef.current) {
    //   _startTime.current = Timing.now();
    // }
    // runningRef.current = running;

    if (!running) return;

    if (shouldRecord(cycle, type)) {
      samplesRef.current[cycle] = { scriptingStart };
      samplesRef.current[cycle].scriptingEnd = Timing.now();

      // force style recalc that would otherwise happen before the next frame
      samplesRef.current[cycle].layoutStart = Timing.now();
      if (document.body) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        document.body.offsetWidth;
      }
      samplesRef.current[cycle].layoutEnd = Timing.now();
    }

    const now = Timing.now();
    if (!isDone(cycle, sampleCount, type) && now - startTime < timeout) {
      const raf = requestAnimationFrame(() => {
        dispatch({ type: 'cycle' });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      console.log('samplesRef.current', samplesRef.current);
      const samples = samplesRef.current.reduce(
        (memo, { scriptingStart, scriptingEnd, layoutStart, layoutEnd }) => {
          memo.push({
            start: scriptingStart,
            end: layoutEnd || scriptingEnd || 0,
            scriptingStart,
            scriptingEnd: scriptingEnd || 0,
            layoutStart: layoutStart || 0,
            layoutEnd: layoutEnd || 0,
          });
          return memo;
        },
        [] as {
          start: number;
          end: number;
          scriptingStart: number;
          scriptingEnd: number;
          layoutStart: number;
          layoutEnd: number;
        }[]
      );
      const runTime = now - startTime;
      const sortedElapsedTimes = samples.map(({ start, end }) => end - start).sort(sortNumbers);
      const sortedScriptingElapsedTimes = samples
        .map(({ scriptingStart, scriptingEnd }) => scriptingEnd - scriptingStart)
        .sort(sortNumbers);
      const sortedLayoutElapsedTimes = samples
        .map(({ layoutStart, layoutEnd }) => (layoutEnd || 0) - (layoutStart || 0))
        .sort(sortNumbers);
      const raf = requestAnimationFrame(() => {
        dispatch({ type: 'complete' });

        onComplete({
          startTime,
          endTime: now,
          runTime,
          sampleCount: samples.length,
          samples: samples,
          max: sortedElapsedTimes[sortedElapsedTimes.length - 1],
          min: sortedElapsedTimes[0],
          median: getMedian(sortedElapsedTimes),
          mean: getMean(sortedElapsedTimes),
          stdDev: getStdDev(sortedElapsedTimes),
          meanLayout: getMean(sortedLayoutElapsedTimes),
          meanScripting: getMean(sortedScriptingElapsedTimes),
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [
    cycle,
    forceLayout,
    onComplete,
    running,
    sampleCount,
    scriptingStart,
    startTime,
    timeout,
    type,
  ]);

  return (
    <Activity mode={running && shouldRender(cycle, type) ? 'visible' : 'hidden'}>
      <Component
        key={
          type === BenchmarkType.UPDATE
            ? undefined
            : `${type}-${shouldRender(cycle, type) ? cycle - 1 : cycle}`
        }
        {...componentProps}
        // make sure props always change for update tests
        // data-test={type === BenchmarkType.UPDATE ? cycle : undefined}
      />
    </Activity>
  );
}
BenchmarkProfiler.displayName = 'BenchmarkProfiler';
BenchmarkProfiler.Type = BenchmarkType;
