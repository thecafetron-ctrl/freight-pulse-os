export interface AccuracyMetrics {
  mae: number;
  mape: number;
  rmse: number;
  dataPoints: number;
}

export function meanAbsoluteError(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) {
    return 0;
  }
  const sum = actual.reduce((acc, value, index) => acc + Math.abs(value - predicted[index]), 0);
  return sum / actual.length;
}

export function meanAbsolutePercentageError(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) {
    return 0;
  }
  let validPoints = 0;
  const sum = actual.reduce((acc, value, index) => {
    if (value === 0) {
      return acc;
    }
    validPoints += 1;
    return acc + Math.abs((value - predicted[index]) / value);
  }, 0);
  return validPoints === 0 ? 0 : (sum / validPoints) * 100;
}

export function rootMeanSquaredError(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) {
    return 0;
  }
  const sumSquares = actual.reduce((acc, value, index) => acc + Math.pow(value - predicted[index], 2), 0);
  return Math.sqrt(sumSquares / actual.length);
}

export function computeAccuracyMetrics(actual: number[], predicted: number[]): AccuracyMetrics {
  return {
    mae: meanAbsoluteError(actual, predicted),
    mape: meanAbsolutePercentageError(actual, predicted),
    rmse: rootMeanSquaredError(actual, predicted),
    dataPoints: actual.length,
  };
}

export function getAccuracyRating(mape: number): { label: string; color: 'green' | 'blue' | 'yellow' | 'red' } {
  if (mape < 10) {
    return { label: 'Excellent', color: 'green' };
  }
  if (mape < 20) {
    return { label: 'Good', color: 'blue' };
  }
  if (mape < 30) {
    return { label: 'Fair', color: 'yellow' };
  }
  return { label: 'Poor', color: 'red' };
}


