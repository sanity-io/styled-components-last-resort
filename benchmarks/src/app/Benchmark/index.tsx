/**
 * The MIT License (MIT)
 * Copyright (c) 2017 Paul Armstrong
 * https://github.com/paularmstrong/react-component-benchmark
 */

import {Component} from 'react'
import type {SafeAny, Test} from '../../types'
import {BenchmarkType} from './BenchmarkType'
import {getMean, getMeanOfFastestPercent, getMedian, getStdDev} from './math'
import * as Timing from './timing'
import {isDone, shouldRecord, shouldRender, sortNumbers} from './utils'

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

interface BenchmarkProps
  extends Pick<Test<SafeAny>, 'Component' | 'getComponentProps' | 'sampleCount'> {
  timeout: number
  type: (typeof BenchmarkType)[keyof typeof BenchmarkType]
  forceLayout?: boolean
  onComplete: (results: BenchmarkResults) => void
}
interface BenchmarkState {
  componentProps: ReturnType<BenchmarkProps['getComponentProps']>
  cycle: number
  running: boolean
}

// @TODO test Component vs PureComponent
export class Benchmark extends Component<BenchmarkProps, BenchmarkState> {
  static displayName = 'Benchmark'

  static defaultProps = {
    sampleCount: 50,
    timeout: 10000, // 10 seconds
    type: BenchmarkType.MOUNT,
  } satisfies Partial<BenchmarkProps>

  static Type = BenchmarkType

  _startTime = 0
  _samples: {
    scriptingStart: number
    scriptingEnd?: number
    layoutStart?: number
    layoutEnd?: number
  }[] = []
  _raf: number | undefined

  constructor(props: BenchmarkProps) {
    // console.log('OLD.constructor', { props });
    super(props)

    const cycle = 0
    const componentProps = props.getComponentProps({cycle})
    this.state = {
      componentProps,
      cycle,
      running: false,
    }
    this._startTime = 0
    this._samples = []
  }

  // runs outside render to avoid skewing results?
  // use getDerivedStateFromProps instead?
  UNSAFE_componentWillReceiveProps(nextProps: BenchmarkProps) {
    // console.log('OLD.componentWillReceiveProps', { nextProps }, this.props, this.state);
    if (nextProps) {
      this.setState((state) => ({
        componentProps: nextProps.getComponentProps({cycle: state.cycle}),
      }))
    }
  }

  // runs outside of render agai? Detects exactly when the running state has changed
  UNSAFE_componentWillUpdate(nextProps: BenchmarkProps, nextState: BenchmarkState) {
    // console.log('OLD.componentWillUpdate', { nextProps, nextState }, this.props, this.state);
    if (nextState.running && !this.state.running) {
      this._startTime = Timing.now()
      // console.log('OLD set start time', this._startTime);
    }
  }

  componentDidUpdate() {
    // console.log('OLD.componentDidUpdate', this.props, this.state);
    const {forceLayout, sampleCount, timeout, type} = this.props
    const {cycle, running} = this.state

    if (running && shouldRecord(cycle, type)) {
      this._samples[cycle].scriptingEnd = Timing.now()

      // force style recalc that would otherwise happen before the next frame
      if (forceLayout) {
        // this._samples[cycle].layoutStart = Timing.now();
        if (document.body) {
          // oxlint-disable-next-line no-unused-expressions
          document.body.offsetWidth
        }
        // this._samples[cycle].layoutEnd = Timing.now();
      }
    }

    if (running) {
      const now = Timing.now()
      if (!isDone(cycle, sampleCount, type) && now - this._startTime < timeout) {
        this._handleCycleComplete()
      } else {
        this._handleComplete(now)
      }
    }
  }

  componentWillUnmount() {
    // console.log('OLD.componentWillUnmount', this.props, this.state);
    if (this._raf) {
      window.cancelAnimationFrame(this._raf)
    }
  }

  render() {
    // console.log('OLD.render', this.props, this.state);
    const {Component, type} = this.props
    const {componentProps, cycle, running} = this.state
    if (running && shouldRecord(cycle, type)) {
      // console.log('OLD.render shouldRecord', Timing.now());
      this._samples[cycle] = {scriptingStart: Timing.now()}
    }
    // if (running && shouldRender(cycle, type)) {
    //   // console.log('OLD.render shouldRender', Timing.now());
    // }
    return running && shouldRender(cycle, type) && <Component {...componentProps} />
  }

  start() {
    // console.log('OLD.start', Timing.now());
    this._samples = []
    this.setState(() => ({running: true, cycle: 0}))
  }

  _handleCycleComplete() {
    // console.log('OLD._handleCycleComplete', this.props, this.state);
    const {getComponentProps, type} = this.props
    const {cycle} = this.state

    let componentProps: typeof this.state.componentProps
    if (getComponentProps) {
      // Calculate the component props outside of the time recording (render)
      // so that it doesn't skew results
      componentProps = getComponentProps({cycle})
      // make sure props always change for update tests
      if (type === BenchmarkType.UPDATE) {
        // componentProps['data-test'] = cycle;
      }
    }

    // console.log('OLD.requestAnimationFrame schedule');
    this._raf = window.requestAnimationFrame(() => {
      // console.log('OLD.requestAnimationFrame fired');
      this.setState((state) => ({
        cycle: state.cycle + 1,
        componentProps,
      }))
    })
  }

  getSamples() {
    // console.log('OLD.getSamples', this.props, this.state);
    return this._samples.reduce(
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
  }

  _handleComplete(endTime: number) {
    // console.log('OLD._handleComplete', this.props, this.state);
    const {onComplete} = this.props
    const samples = this.getSamples()

    this.setState(() => ({running: false, cycle: 0}))

    const runTime = endTime - this._startTime
    const sortedElapsedTimes = samples.map(({start, end}) => end - start).sort(sortNumbers)
    const sortedScriptingElapsedTimes = samples
      .map(({scriptingStart, scriptingEnd}) => scriptingEnd - scriptingStart)
      .sort(sortNumbers)
    const sortedLayoutElapsedTimes = samples
      .map(({layoutStart, layoutEnd}) => (layoutEnd || 0) - (layoutStart || 0))
      .sort(sortNumbers)

    onComplete({
      startTime: this._startTime,
      endTime,
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
}
