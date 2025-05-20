import { Profiler, useRef, useState, useTransition } from 'react';
import { flushSync } from 'react-dom';
import {
  // @ts-expect-error - fix later
  Picker,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BenchmarkRef, SafeAny, TestReport, Tests } from '../types';
import { Benchmark, type BenchmarkResults } from './Benchmark';
import { BenchmarkProfiler } from './Benchmark/Profiler';
import { handleProfileRender } from './Benchmark/utils';
import { Button } from './Button';
import { IconClear, IconEye } from './Icons';
import { Layout } from './Layout';
import { ProfilerReportCard } from './ProfilerReportCard';
import { ReportCard } from './ReportCard';
import { Text } from './Text';
import { colors } from './theme';

const overlay = <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]} />;

const runnerTypes = [
  'benchmark',
  'benchmark-force-layout',
  'benchmark-profiler',
  'benchmark-profiler-force-layout',
  'benchmark-profiler-concurrent',
  'benchmark-profiler-force-layout-concurrent',
] as const;
type RunnerType = (typeof runnerTypes)[number];

function isRunnerType(value: string): value is RunnerType {
  return runnerTypes.includes(value as RunnerType);
}

function getForceLayout(runner: RunnerType) {
  switch (runner) {
    case 'benchmark-force-layout':
    case 'benchmark-profiler-force-layout':
    case 'benchmark-profiler-force-layout-concurrent':
      return true;
    default:
      return false;
  }
}

function getRunnerLabel(runner: RunnerType) {
  switch (runner) {
    default:
      return runner;
  }
}

function shouldUseBenchmarkProfiler(runner: RunnerType) {
  switch (runner) {
    case 'benchmark':
    case 'benchmark-force-layout':
      return false;
    default:
      return true;
  }
}

const timeout = 20_000;

export function App(props: { tests: Tests<React.ComponentType<SafeAny>> }) {
  const { tests } = props;
  const [currentBenchmarkName, setCurrentBenchmarkName] = useState(
    () => Object.keys(props.tests)[0]
  );
  const [currentBenchmarkRunner, setCurrentBenchmarkRunner] =
    useState<RunnerType>('benchmark-force-layout');
  const [currentLibraryName, setCurrentLibraryName] = useState('inline-styles');
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [results, setResults] = useState<
    (BenchmarkResults & { benchmarkName: string; libraryName: string; libraryVersion?: string })[]
  >([]);
  const [profilerResults, setProfilerResults] = useState<TestReport[]>([]);
  const [shouldHideBenchmark, setShouldHideBenchmark] = useState(false);
  // Loading a new benchmark might take a moment, so we hide the benchmark while it is loading to make it clear it is not ready yet
  const [pending, startTransition] = useTransition();

  const isBenchmarkProfiler = shouldUseBenchmarkProfiler(currentBenchmarkRunner);

  const forceLayout = getForceLayout(currentBenchmarkRunner);

  const benchmarkRef = useRef<BenchmarkRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleChangeBenchmark = (value: string) => {
    startTransition(() => setCurrentBenchmarkName(value));
  };
  const handleChangeLibrary = (value: string) => {
    startTransition(() => setCurrentLibraryName(value));
  };
  const handleStart = () => {
    window.cody = [];
    window.olsen = [];
    flushSync(() => {
      setStatus('running');
    });
    benchmarkRef.current!.start();
    _scrollToEnd();
  };
  const _handleClear = () => {
    setResults([]);
    setProfilerResults([]);
  };

  // scroll the most recent result into view
  const _scrollToEnd = () => {
    window.requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd();
    });
  };

  const currentImplementation = tests[currentBenchmarkName][currentLibraryName];
  const { Component, Provider, getComponentProps, sampleCount, benchmarkType } =
    currentImplementation;

  return (
    <Layout
      actionPanel={
        <View>
          <View style={styles.pickers}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Library</Text>
              <Text style={{ fontWeight: 'bold' }}>{currentLibraryName}</Text>

              <Picker
                enabled={status !== 'running'}
                onValueChange={handleChangeLibrary}
                selectedValue={currentLibraryName}
                style={styles.picker}
              >
                {Object.keys(tests[currentBenchmarkName]).map(libraryName => (
                  <Picker.Item key={libraryName} label={libraryName} value={libraryName} />
                ))}
              </Picker>
            </View>
            <View style={{ width: 1, backgroundColor: colors.fadedGray }} />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Benchmark</Text>
              <Text testID="current-benchmark-name">{currentBenchmarkName}</Text>
              <Picker
                enabled={status !== 'running'}
                onValueChange={handleChangeBenchmark}
                selectedValue={currentBenchmarkName}
                style={styles.picker}
                testID="benchmark-picker"
              >
                {Object.keys(tests).map(test => (
                  <Picker.Item key={test} label={test} value={test} />
                ))}
              </Picker>
            </View>
            <View style={{ width: 1, backgroundColor: colors.fadedGray }} />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Runner</Text>
              <Text testID="current-runner">{getRunnerLabel(currentBenchmarkRunner)}</Text>
              <Picker
                enabled={status !== 'running'}
                onValueChange={(value: string) => {
                  if (isRunnerType(value)) {
                    setCurrentBenchmarkRunner(value);
                  }
                }}
                selectedValue={currentBenchmarkRunner}
                style={styles.picker}
                testID="benchmark-runner-picker"
              >
                {runnerTypes.map(runner => (
                  <Picker.Item key={runner} label={getRunnerLabel(runner)} value={runner} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={styles.grow}>
              <Button
                onPress={handleStart}
                style={styles.button}
                title={status === 'running' ? 'Running…' : 'Run'}
                disabled={status === 'running'}
                testID="run-button"
              />
            </View>
          </View>

          {status === 'running' ? overlay : null}
        </View>
      }
      listPanel={
        <View style={styles.listPanel}>
          <View style={styles.grow}>
            <View style={styles.listBar}>
              <View style={styles.iconClearContainer}>
                <TouchableOpacity onPress={_handleClear}>
                  <IconClear />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView ref={scrollViewRef} style={styles.grow}>
              {results.map((r, i) => (
                <ReportCard
                  benchmarkName={r.benchmarkName}
                  key={i}
                  libraryName={r.libraryName}
                  libraryVersion={r.libraryVersion}
                  mean={r.mean}
                  meanLayout={r.meanLayout}
                  meanScripting={r.meanScripting}
                  runTime={r.runTime}
                  sampleCount={r.sampleCount}
                  stdDev={r.stdDev}
                />
              ))}
              {profilerResults.map((r, i) => (
                <ProfilerReportCard
                  benchmarkName={r.benchmarkName}
                  key={i}
                  libraryName={r.libraryName}
                  libraryVersion={r.libraryVersion}
                  mean={r.mean}
                  sampleCount={r.sampleCount}
                  stdDev={r.stdDev}
                />
              ))}
              {status === 'running' ? (
                <ReportCard benchmarkName={currentBenchmarkName} libraryName={currentLibraryName} />
              ) : null}
            </ScrollView>
          </View>
          {status === 'running' ? overlay : null}
        </View>
      }
      viewPanel={
        <View style={styles.viewPanel}>
          <View style={styles.iconEyeContainer}>
            <TouchableOpacity
              onPress={() => startTransition(() => setShouldHideBenchmark(prev => !prev))}
            >
              <IconEye style={styles.iconEye} />
            </TouchableOpacity>
          </View>
          <Provider>
            <View
              // optionally hide the benchmark as it is performed (no flashing on screen), or if it is pending
              style={{ opacity: pending || shouldHideBenchmark ? 0 : 1 }}
            >
              {status === 'running' ? (
                isBenchmarkProfiler ? (
                  <BenchmarkProfiler
                    component={Component}
                    forceLayout={forceLayout}
                    getComponentProps={getComponentProps}
                    onComplete={results => {
                      setProfilerResults(state =>
                        state.concat([
                          {
                            ...results,
                            benchmarkName: currentBenchmarkName,
                            libraryName: currentLibraryName,
                            libraryVersion: tests[currentBenchmarkName][currentLibraryName].version,
                          },
                        ])
                      );
                      setStatus('complete');
                    }}
                    ref={benchmarkRef}
                    sampleCount={sampleCount}
                    timeout={timeout}
                    type={benchmarkType}
                  />
                ) : (
                  <Profiler id="benchmark" onRender={handleProfileRender}>
                    <Benchmark
                      Component={Component}
                      forceLayout={forceLayout}
                      getComponentProps={getComponentProps}
                      onComplete={results => {
                        setResults(state =>
                          state.concat([
                            {
                              ...results,
                              benchmarkName: currentBenchmarkName,
                              libraryName: currentLibraryName,
                              libraryVersion:
                                tests[currentBenchmarkName][currentLibraryName].version,
                            },
                          ])
                        );
                        setStatus('complete');
                      }}
                      ref={ref => {
                        benchmarkRef.current = ref ? { start: () => ref.start() } : null;
                      }}
                      sampleCount={sampleCount}
                      timeout={timeout}
                      type={benchmarkType}
                    />
                  </Profiler>
                )
              ) : (
                <Component {...getComponentProps({ cycle: 10 })} />
              )}
            </View>
          </Provider>

          {status === 'running' ? overlay : null}
        </View>
      }
    />
  );
}
App.displayName = '@app/App';

const styles = StyleSheet.create({
  viewPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  iconEye: {
    color: 'white',
    height: 32,
  },
  iconEyeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  iconClearContainer: {
    height: '100%',
    marginLeft: 5,
  },
  grow: {
    flex: 1,
  },
  listPanel: {
    flex: 1,
    width: '100%',
    marginHorizontal: 'auto',
  },
  listBar: {
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.fadedGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    justifyContent: 'flex-end',
  },
  pickers: {
    flexDirection: 'row',
  },
  pickerContainer: {
    flex: 1,
    padding: 5,
  },
  pickerTitle: {
    fontSize: 12,
    color: colors.deepGray,
  },
  picker: {
    ...StyleSheet.absoluteFillObject,
    appearance: 'none',
    opacity: 0,
    width: '100%',
  },
  button: {
    borderRadius: 0,
    flex: 1,
  },
});
