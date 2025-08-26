import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TestReport } from '../types';
import { Text } from './Text';

const fmt = (time: any) => {
  const i: any = Number(
    Math.round(
      // @ts-expect-error - fix later
      time + 'e2'
    ) + 'e-2'
  ).toFixed(2);
  return 10 / i > 1 ? `0${i}` : i;
};

export const ReportCard = memo(function ReportCard(props: TestReport) {
  const {
    benchmarkName,
    libraryName,
    sampleCount,
    mean,
    stdDev,
    libraryVersion,
    meanScriptingP75,
    meanScriptingP99,
    runner,
  } = props;

  const sampleCountText = sampleCount != null ? `(${sampleCount})` : '';

  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <Text numberOfLines={1} style={styles.bold}>
          {`${libraryName}${libraryVersion ? '@' + libraryVersion : ''} (${runner})`}
        </Text>
        <Text numberOfLines={1}>
          {benchmarkName} {sampleCountText}
        </Text>
      </View>
      <View style={styles.right}>
        {mean ? (
          <View testID={benchmarkName + ' results'}>
            <Text style={[styles.bold, styles.monoFont]}>
              {fmt(mean)} ±{fmt(stdDev)} ms
            </Text>
            <Text style={[styles.smallText, styles.monoFont]}>
              (P75/P99) {fmt(meanScriptingP75)}/{fmt(meanScriptingP99)} ms
            </Text>
          </View>
        ) : (
          <Text style={styles.bold}>In progress…</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bold: {
    fontWeight: 'bold',
  },
  smallText: { fontSize: 12 },
  monoFont: {
    fontFamily: 'monospace',
  },
  centerText: {
    display: 'flex',
    alignItems: 'center',
  },
  left: {
    width: '50%',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
