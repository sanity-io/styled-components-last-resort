export const getStdDev = (values: number[]) => {
  const avg = getMean(values);

  const squareDiffs = values.map(value => {
    const diff = value - avg;
    return diff * diff;
  });

  return Math.sqrt(getMean(squareDiffs));
};

export const getMean = (values: number[]) => {
  const sum = values.reduce((sum, value) => sum + value, 0);
  return sum / values.length;
};

export const getMedian = (values: number[]) => {
  if (values.length === 1) {
    return values[0];
  }

  const numbers = values.sort((a, b) => a - b);
  return (numbers[(numbers.length - 1) >> 1] + numbers[numbers.length >> 1]) / 2;
};

export const getPercentile = (values: number[], percentile: number) => {
  if (values.length === 0) {
    return 0;
  }
  // Ensure values are sorted for percentile calculation
  const sortedValues = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sortedValues.length - 1);
  if (Number.isInteger(index)) {
    return sortedValues[index];
  }
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const lowerValue = sortedValues[lowerIndex];
  const upperValue = sortedValues[upperIndex];
  return lowerValue + (upperValue - lowerValue) * (index - lowerIndex);
};

export const getMeanOfFastestPercent = (sortedValues: number[], percentageToKeep: number) => {
  if (sortedValues.length === 0) {
    return 0; // Or NaN, matching getMean's behavior for empty arrays if preferred
  }
  // Determine how many of the fastest values to keep
  // Math.ceil ensures that if, for example, you want 75% of 10 items (7.5), you take 8 items.
  const count = Math.ceil(sortedValues.length * (percentageToKeep / 100));

  // Slice the array to get the fastest 'count' elements
  // sortedValues is assumed to be sorted in ascending order (fastest to slowest)
  const fastestValues = sortedValues.slice(0, count);

  return getMean(fastestValues);
};
