export type AnomalyType = 'spike' | 'drop' | 'stable';
export type AnomalySeverity = 'low' | 'medium' | 'high';

export interface Anomaly {
  lane: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  percentChange: number;
}

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function determineSeverity(percentChange: number): AnomalySeverity {
  const abs = Math.abs(percentChange);
  if (abs >= 40) return 'high';
  if (abs >= 30) return 'medium';
  return 'low';
}

export function detectAnomaly(
  lane: string,
  historicalLoads: number[],
  forecastLoads: number[],
): Anomaly | null {
  if (historicalLoads.length === 0 || forecastLoads.length === 0) {
    return null;
  }

  const historicalMean = mean(historicalLoads);
  const forecastMean = mean(forecastLoads);
  const percentChange = ((forecastMean - historicalMean) / (historicalMean || 1)) * 100;

  if (Math.abs(percentChange) < 20) {
    return {
      lane,
      type: 'stable',
      severity: 'low',
      message: `Demand expected to remain stable (${percentChange.toFixed(1)}% change)`,
      percentChange,
    };
  }

  const severity = determineSeverity(percentChange);

  if (percentChange > 0) {
    return {
      lane,
      type: 'spike',
      severity,
      message: `⚠️ Demand surge detected: ${percentChange.toFixed(1)}% increase expected`,
      percentChange,
    };
  }

  return {
    lane,
    type: 'drop',
    severity,
    message: `⚠️ Demand decline detected: ${Math.abs(percentChange).toFixed(1)}% decrease expected`,
    percentChange,
  };
}

export function detectAnomaliesForLanes(
  entries: Array<{ lane: string; historical: number[]; forecast: number[] }>,
): Anomaly[] {
  return entries
    .map((entry) => detectAnomaly(entry.lane, entry.historical, entry.forecast))
    .filter((anomaly): anomaly is Anomaly => anomaly !== null);
}


