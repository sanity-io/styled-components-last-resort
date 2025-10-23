/**
 * Uses the React Profiler to gather benchmarking metrics,
 * which is able to better scope the performance of a component
 * and omit scripting time from the benchmarker itself.
 */

import {
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useTransition,
  use,
  Activity,
  useState,
} from 'react'
import type {BenchmarkRef} from '../../types'
import {BenchmarkType} from './BenchmarkType'
import {getMean, getMedian, getStdDev, getMeanOfFastestPercent} from './math'
import * as Timing from './timing'
import {isDone, shouldRecord, shouldRender, shouldSuspend, sortNumbers} from './utils'

export interface BenchmarkResults {
  startTime: number
  endTime: number
  runTime: number
  sampleCount: number
  samples: {
    start: number
    end: number
    scriptingStart: number
    scriptingEnd: number
    layoutStart: number
    layoutEnd: number
  }[]
  max: number
  min: number
  median: number
  mean: number
  stdDev: number
  meanLayout: number
  meanScripting: number
  meanScriptingP75: number
  meanScriptingP99: number
}

export interface BenchmarkProps {
  sampleCount: number
  timeout: number
  type: (typeof BenchmarkType)[keyof typeof BenchmarkType]
  getComponentProps: (props: {cycle: number}) => Record<string, any>
  ref: React.Ref<BenchmarkRef>
  component: any
  onComplete: (results: BenchmarkResults) => void
}

interface BenchmarkState {
  cycle: number
  running: boolean
  componentProps: Record<string, any>
  startTime: number
  scriptingStart: number
  suspend: PromiseWithResolvers<true> | null
}

type BenchmarkAction = {type: 'start'} | {type: 'cycle'} | {type: 'complete'} | {type: 'suspend'}

export function BenchmarkProfiler(props: BenchmarkProps) {
  const {
    sampleCount = 50,
    timeout = 10_000, // 10 seconds
    type = BenchmarkType.MOUNT,
    getComponentProps,
    ref,
    component: Component,
    onComplete,
  } = props

  const samplesRef = useRef<
    {
      scriptingStart: number
      scriptingEnd?: number
      layoutStart?: number
      layoutEnd?: number
    }[]
  >([])

  const [suspending, startTransition] = useTransition()
  // const suspending = false;
  // const startTransition = (cb: () => void) => cb();

  const [state, dispatch] = useReducer(
    (state: BenchmarkState, action: BenchmarkAction) => {
      switch (action.type) {
        case 'start':
          return {
            ...state,
            running: true,
            cycle: 0,
            startTime: Timing.now(),
            scriptingStart: Timing.now(),
            suspend: null,
          }
        case 'cycle':
          return {
            ...state,
            cycle: state.cycle + 1,
            componentProps: getComponentProps({cycle: state.cycle + 1}),
            scriptingStart: Timing.now(),
            suspend: null,
          }
        case 'complete':
          return {
            ...state,
            running: false,
            cycle: 0,
            scriptingStart: 0,
            startTime: 0,
            componentProps: getComponentProps({cycle: 0}),
            suspend: null,
          }
        case 'suspend':
          return {
            ...state,
            cycle: state.cycle + 1,
            componentProps: getComponentProps({
              cycle: state.cycle + 1,
            }),
            scriptingStart: Timing.now(),
            suspend: Promise.withResolvers<true>(),
          }
        default:
          return state
      }
    },
    {cycle: 0, running: false},
    ({cycle, running}) => ({
      startTime: 0,
      scriptingStart: 0,
      cycle,
      running,
      componentProps: getComponentProps({cycle}),
      suspend: null,
    }),
  )

  const {cycle, running, componentProps, scriptingStart, startTime, suspend} = state

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        samplesRef.current = []
        dispatch({type: 'start'})
      },
    }),
    [],
  )

  useEffect(() => {
    if (!running || suspending || suspend) return

    if (shouldRecord(cycle, type)) {
      samplesRef.current[cycle] = {scriptingStart}
      samplesRef.current[cycle].scriptingEnd = Timing.now()

      // force style recalc that would otherwise happen before the next frame
      samplesRef.current[cycle].layoutStart = Timing.now()
      if (document.body) {
        // oxlint-disable-next-line no-unused-expressions
        document.body.offsetWidth
      }
      samplesRef.current[cycle].layoutEnd = Timing.now()
    }

    const now = Timing.now()
    if (!isDone(cycle, sampleCount, type) && now - startTime < timeout) {
      const done = () => {
        dispatch({type: 'cycle'})
      }
      const raf = requestAnimationFrame(() => {
        if (shouldSuspend(cycle, type)) {
          startTransition(() => {
            dispatch({type: 'suspend'})
          })
        } else {
          done()
        }
      })
      return () => {
        cancelAnimationFrame(raf)
      }
    } else {
      const samples = samplesRef.current.reduce(
        (memo, {scriptingStart, scriptingEnd, layoutStart, layoutEnd}) => {
          memo.push({
            start: scriptingStart,
            end: layoutEnd || scriptingEnd || 0,
            scriptingStart,
            scriptingEnd: scriptingEnd || 0,
            layoutStart: layoutStart || 0,
            layoutEnd: layoutEnd || 0,
          })
          return memo
        },
        [] as {
          start: number
          end: number
          scriptingStart: number
          scriptingEnd: number
          layoutStart: number
          layoutEnd: number
        }[],
      )
      const runTime = now - startTime
      const sortedElapsedTimes = samples.map(({start, end}) => end - start).sort(sortNumbers)
      const sortedScriptingElapsedTimes = samples
        .map(({scriptingStart, scriptingEnd}) => scriptingEnd - scriptingStart)
        .sort(sortNumbers)
      const sortedLayoutElapsedTimes = samples
        .map(({layoutStart, layoutEnd}) => (layoutEnd || 0) - (layoutStart || 0))
        .sort(sortNumbers)

      dispatch({type: 'complete'})

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
        meanScriptingP75: getMeanOfFastestPercent(sortedScriptingElapsedTimes, 75),
        meanScriptingP99: getMeanOfFastestPercent(sortedScriptingElapsedTimes, 99),
      })
    }
  }, [
    cycle,
    onComplete,
    running,
    sampleCount,
    scriptingStart,
    startTime,
    suspend,
    suspending,
    timeout,
    type,
  ])

  return (
    <>
      <Activity mode={running && shouldRender(cycle, type) ? 'visible' : 'hidden'}>
        <Component
          // Change the key during mount/unmount test runs to force remounts
          key={type === BenchmarkType.UPDATE ? undefined : `cycle:${cycle}`}
          {...componentProps}
        />
        {suspend && (
          <Suspend
            promise={suspend.promise}
            // resolve={suspend.resolve}
            proceed={() => {
              if (shouldRecord(cycle, type)) {
                samplesRef.current[cycle] = {scriptingStart}
                samplesRef.current[cycle].scriptingEnd = Timing.now()

                // force style recalc that would otherwise happen before the next frame
                samplesRef.current[cycle].layoutStart = Timing.now()
                if (document.body) {
                  // oxlint-disable-next-line no-unused-expressions
                  document.body.offsetWidth
                }
                samplesRef.current[cycle].layoutEnd = Timing.now()
              }
              dispatch({type: 'cycle'})
            }}
          />
        )}
      </Activity>
    </>
  )
}
BenchmarkProfiler.displayName = 'BenchmarkProfiler'
BenchmarkProfiler.Type = BenchmarkType

function Suspend({
  promise,
  // resolve,
  proceed,
}: {
  promise: Promise<true>
  // resolve: PromiseWithResolvers<true>['resolve']
  proceed: () => void
}) {
  const [proceeded, setProceeded] = useState(false)
  // Resolve the promise right away
  // resolve(true)
  if (!proceeded) {
    // requestAnimationFrame(() => {
    //   console.log('Suspend render resolved')
    //   // resolve(true)
    //   proceed()
    // })
    // Go to the cycle right away, do not resolve the promise
    void Promise.resolve().then(() => {
      proceed()
    })
    // startTransition(() => setProceeded(true))
    setProceeded(true)
  }
  // Even though we resolved the promise it won't happen until the next microtask, so it'll suspend here
  use(promise)

  return null
}
