import { computeAccuracyMetrics } from './accuracyMetrics';
import { detectAnomaliesForLanes, Anomaly } from './anomalyDetection';
import { getAllMockLaneData, HistoricalPoint, LaneData } from './generateMockData';

interface AggregatedPoint {
  week: string;
  totalLoads: number;
}

interface LanePerformance {
  lane: string;
  origin: string;
  destination: string;
  currentAverage: number;
  previousAverage: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  history: HistoricalPoint[];
}

interface DashboardActivity {
  id: string;
  type: 'quote' | 'match' | 'document' | 'forecast';
  action: string;
  detail: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

interface SystemStatus {
  system: string;
  status: 'operational' | 'degraded' | 'offline';
  latencyMs: number;
  throughputPerMinute: number;
  uptimePercent: number;
}

export interface DashboardSnapshot {
  stats: {
    activeShipments: number;
    quoteRequests: number;
    matchRate: number;
    avgResponseTimeMinutes: number;
  };
  utilization: {
    availableVehicles: number;
    utilizationPercent: number;
    idleVehicles: number;
  };
  laneHighlights: Array<{
    lane: string;
    origin: string;
    destination: string;
    weeklyLoads: number;
    changePercent: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  recentActivity: DashboardActivity[];
  systemStatus: SystemStatus[];
  alerts: {
    count: number;
    topAlerts: Anomaly[];
  };
  updatedAt: string;
}

export interface AnalyticsSnapshot {
  kpis: {
    avgFreightCost: { value: number; unit: 'usd'; changePercent: number; trend: 'up' | 'down' };
    matchAccuracy: { value: number; unit: 'percent'; changePercent: number; trend: 'up' | 'down' };
    processingTime: { value: number; unit: 'minutes'; changePercent: number; trend: 'up' | 'down' };
    aiRoi: { value: number; unit: 'percent'; changePercent: number; trend: 'up' | 'down' };
  };
  volumeTrends: Array<{ week: string; totalLoads: number; movingAverage: number }>;
  laneBreakdown: Array<{
    lane: string;
    origin: string;
    destination: string;
    current: number;
    previous: number;
    changePercent: number;
  }>;
  systemPerformance: {
    uptimePercent: number;
    subsystems: Array<{ name: string; utilization: number; latencyMs: number }>;
  };
  forecastAccuracy: {
    mae: number;
    mape: number;
    rmse: number;
    rating: 'excellent' | 'strong' | 'moderate' | 'needs-attention';
  };
  insights: Array<{ title: string; description: string }>;
  updatedAt: string;
}

interface OperationsContext {
  lanes: LaneData[];
  aggregated: AggregatedPoint[];
  lanePerformance: LanePerformance[];
  anomalies: Anomaly[];
  activeShipments: number;
  previousShipments: number;
  overallChangePercent: number;
  quoteRequests: number;
  matchRate: number;
  avgResponseTimeMinutes: number;
  availableVehicles: number;
  utilizationPercent: number;
  idleVehicles: number;
  volatility: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function percentChange(current: number, previous: number): number {
  if (previous <= 0) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) * (value - mean), 0) / values.length;
  return Math.sqrt(variance);
}

function computeMovingAverage(values: number[], windowSize: number): number[] {
  return values.map((_value, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = values.slice(start, index + 1);
    if (window.length === 0) {
      return 0;
    }
    const total = window.reduce((sum, item) => sum + item, 0);
    return total / window.length;
  });
}

function buildOperationsContext(): OperationsContext {
  const lanes = getAllMockLaneData();
  const referenceLane = lanes[0];

  const aggregated: AggregatedPoint[] = referenceLane
    ? referenceLane.history.map((point, index) => ({
        week: point.week,
        totalLoads: lanes.reduce(
          (sum, lane) => sum + (lane.history[index] ? lane.history[index].loads : 0),
          0,
        ),
      }))
    : [];

  const lanePerformance: LanePerformance[] = lanes.map((lane) => {
    const history = lane.history;
    const currentWindow = history.slice(-4);
    const previousWindow = history.slice(-8, -4);

    const currentAverage =
      currentWindow.reduce((sum, point) => sum + point.loads, 0) /
      Math.max(1, currentWindow.length);
    const previousAverage =
      previousWindow.reduce((sum, point) => sum + point.loads, 0) /
      Math.max(1, previousWindow.length || currentWindow.length);

    const change = percentChange(currentAverage, previousAverage);
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > 3) {
      trend = 'up';
    } else if (change < -3) {
      trend = 'down';
    }

    return {
      lane: lane.lane,
      origin: lane.origin,
      destination: lane.destination,
      currentAverage: round(currentAverage, 0),
      previousAverage: round(previousAverage, 0),
      changePercent: round(change, 1),
      trend,
      history,
    };
  });

  const activeShipments =
    aggregated.length > 0 ? aggregated[aggregated.length - 1].totalLoads : 0;
  const previousShipments =
    aggregated.length > 1 ? aggregated[aggregated.length - 2].totalLoads : activeShipments;
  const overallChangePercent = round(percentChange(activeShipments, previousShipments), 1);

  const quoteRequests = Math.max(60, Math.round(activeShipments * 0.42));
  const matchRate = round(clamp(92 + overallChangePercent * 0.6, 88, 98), 1);
  const avgResponseTimeMinutes = round(
    clamp(3.4 - (matchRate - 85) * 0.07, 1.6, 3.8),
    1,
  );

  const availableVehicles = 238;
  const utilizationPercent = round(clamp(68 + overallChangePercent * 0.9, 62, 92), 1);
  const idleVehicles = Math.max(
    0,
    Math.round(availableVehicles * (1 - utilizationPercent / 100)),
  );

  const volatility = standardDeviation(lanePerformance.map((lane) => lane.changePercent));

  const anomalies = detectAnomaliesForLanes(
    lanePerformance.map((lane) => {
      const historicalLoads = lane.history.slice(-12).map((point) => point.loads);
      const changeFactor = 1 + lane.changePercent / 100;
      const forecastLoads = historicalLoads.map((value, index, array) => {
        const weight = array.length <= 1 ? 1 : index / (array.length - 1);
        const projected = value * (1 + (changeFactor - 1) * 0.6 * (weight + 0.4));
        return Math.max(50, Math.round(projected));
      });

      return {
        lane: lane.lane,
        historical: historicalLoads,
        forecast: forecastLoads,
      };
    }),
  );

  return {
    lanes,
    aggregated,
    lanePerformance,
    anomalies,
    activeShipments,
    previousShipments,
    overallChangePercent,
    quoteRequests,
    matchRate,
    avgResponseTimeMinutes,
    availableVehicles,
    utilizationPercent,
    idleVehicles,
    volatility,
  };
}

export function buildDashboardSnapshot(): DashboardSnapshot {
  const context = buildOperationsContext();
  const { lanePerformance, anomalies } = context;

  const laneHighlights = lanePerformance
    .map((lane) => ({
      lane: lane.lane,
      origin: lane.origin,
      destination: lane.destination,
      weeklyLoads: Math.round(lane.currentAverage),
      changePercent: lane.changePercent,
      trend: lane.trend,
    }))
    .sort((a, b) => b.weeklyLoads - a.weeklyLoads)
    .slice(0, 5);

  const now = Date.now();
  const recentActivity: DashboardActivity[] = laneHighlights.slice(0, 4).map((lane, index) => {
    const changeText =
      lane.changePercent === 0
        ? 'stable demand'
        : `${lane.changePercent > 0 ? '+' : ''}${lane.changePercent}% ${
            lane.changePercent > 0 ? 'increase' : 'decrease'
          }`;

    const activityTypes: DashboardActivity['type'][] = ['quote', 'match', 'forecast', 'document'];
    const statuses: DashboardActivity['status'][] = ['success', 'success', 'info', 'info'];

    return {
      id: `activity-${index}`,
      type: activityTypes[index % activityTypes.length],
      action: `${lane.lane} updated`,
      detail: `${changeText} · ${lane.weeklyLoads.toLocaleString()} weekly loads`,
      timestamp: new Date(now - index * 4 * 60 * 1000).toISOString(),
      status: statuses[index % statuses.length],
    };
  });

  const systemStatus: SystemStatus[] = [
    {
      system: 'Quote Engine',
      status: 'operational',
      latencyMs: Math.round(clamp(420 - context.overallChangePercent * 2.2, 280, 520)),
      throughputPerMinute: Math.max(30, Math.round(context.quoteRequests / 6)),
      uptimePercent: round(clamp(99.4 - context.volatility * 0.05, 97.2, 99.6), 2),
    },
    {
      system: 'Load Matcher',
      status: context.matchRate > 94 ? 'operational' : 'degraded',
      latencyMs: Math.round(clamp(510 - context.matchRate * 1.4, 320, 520)),
      throughputPerMinute: Math.max(25, Math.round(context.activeShipments / 8)),
      uptimePercent: round(clamp(99.1 - context.volatility * 0.04, 96.8, 99.4), 2),
    },
    {
      system: 'Document AI',
      status: 'operational',
      latencyMs: Math.round(clamp(380 - context.overallChangePercent * 1.5, 260, 440)),
      throughputPerMinute: Math.max(18, Math.round(context.quoteRequests / 10)),
      uptimePercent: round(clamp(99.6 - context.volatility * 0.03, 97.5, 99.7), 2),
    },
    {
      system: 'Forecasting',
      status: anomalies.some((alert) => alert.severity === 'high') ? 'degraded' : 'operational',
      latencyMs: Math.round(clamp(640 - context.matchRate * 2, 360, 620)),
      throughputPerMinute: Math.max(12, Math.round(context.quoteRequests / 12)),
      uptimePercent: round(clamp(98.7 - context.volatility * 0.06, 96, 99.2), 2),
    },
  ];

  return {
    stats: {
      activeShipments: Math.round(context.activeShipments),
      quoteRequests: context.quoteRequests,
      matchRate: context.matchRate,
      avgResponseTimeMinutes: context.avgResponseTimeMinutes,
    },
    utilization: {
      availableVehicles: context.availableVehicles,
      utilizationPercent: context.utilizationPercent,
      idleVehicles: context.idleVehicles,
    },
    laneHighlights,
    recentActivity,
    systemStatus,
    alerts: {
      count: anomalies.length,
      topAlerts: anomalies.slice(0, 4),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function buildAnalyticsSnapshot(): AnalyticsSnapshot {
  const context = buildOperationsContext();
  const { aggregated, lanePerformance, anomalies } = context;

  const historyWindow = aggregated.slice(-26);
  const totals = historyWindow.map((point) => point.totalLoads);
  const movingAverage = computeMovingAverage(totals, 4);
  const lastValue = totals[totals.length - 1] ?? 0;
  const previousValue = totals[totals.length - 5] ?? lastValue;
  const volumeChange = percentChange(lastValue, previousValue);

  const averageFreightCost = round(lastValue * 1.92);
  const previousCost = round(previousValue * 1.92);
  const costChange = round(percentChange(averageFreightCost, previousCost), 1);

  const accuracyBase = clamp(97 - context.volatility * 0.12, 90, 98.5);
  const accuracyChange = round(context.overallChangePercent * 0.4, 1);

  const processingTime = clamp(context.avgResponseTimeMinutes * 0.92, 1.4, 3.2);
  const processingChange = round(-context.overallChangePercent * 0.5, 1);

  const roi = round(clamp(320 + context.overallChangePercent * 4.4, 240, 380), 1);
  const roiChange = round(context.overallChangePercent * 0.8, 1);

  const laneBreakdown = lanePerformance
    .map((lane) => ({
      lane: lane.lane,
      origin: lane.origin,
      destination: lane.destination,
      current: lane.currentAverage,
      previous: lane.previousAverage,
      changePercent: lane.changePercent,
    }))
    .sort((a, b) => b.current - a.current)
    .slice(0, 6);

  const subsystems = [
    {
      name: 'Quote Engine',
      utilization: round(clamp(68 + volumeChange * 0.4, 55, 92), 1),
      latencyMs: Math.round(clamp(400 - context.matchRate * 1.6, 300, 480)),
    },
    {
      name: 'Load Matcher',
      utilization: round(clamp(72 + context.matchRate * 0.25, 60, 96), 1),
      latencyMs: Math.round(clamp(480 - context.overallChangePercent * 2, 320, 520)),
    },
    {
      name: 'Document AI',
      utilization: round(clamp(58 + costChange * 0.5, 45, 82), 1),
      latencyMs: Math.round(clamp(350 - context.overallChangePercent * 1.5, 260, 420)),
    },
    {
      name: 'Forecasting',
      utilization: round(
        clamp(64 + anomalies.length * 3 + volumeChange * 0.3, 50, 88),
        1,
      ),
      latencyMs: Math.round(clamp(520 - anomalies.length * 12, 360, 520)),
    },
  ];

  const actualSeries = aggregated.slice(-12).map((point) => point.totalLoads);
  const projectionTrend = context.overallChangePercent;
  const projectedSeries = actualSeries.map((value, index, array) => {
    const weight = array.length <= 1 ? 1 : index / (array.length - 1);
    const adjusted = value * (1 + (projectionTrend / 100) * (weight + 0.5) * 0.6);
    return Math.max(50, round(adjusted, 0));
  });

  const accuracyMetrics = computeAccuracyMetrics(actualSeries, projectedSeries);
  const normalizedMape = round(Math.max(3, Math.min(accuracyMetrics.mape, 18)), 1);

  const rating =
    normalizedMape <= 5
      ? 'excellent'
      : normalizedMape <= 8
      ? 'strong'
      : normalizedMape <= 12
      ? 'moderate'
      : 'needs-attention';

  const topLane = laneBreakdown[0];
  const topAlert = anomalies[0];

  const insights = [
    topLane
      ? {
          title: 'Lane Momentum',
          description: `${topLane.lane} demand up ${topLane.changePercent >= 0 ? '+' : ''}${topLane.changePercent}% compared to prior month.`,
        }
      : null,
    {
      title: 'Fleet Utilization',
      description: `Utilization running at ${context.utilizationPercent}% with ${context.idleVehicles} idle assets available.`,
    },
    topAlert
      ? {
          title: 'AI Alert',
          description: topAlert.message,
        }
      : null,
  ].filter((insight): insight is { title: string; description: string } => Boolean(insight));

  return {
    kpis: {
      avgFreightCost: {
        value: averageFreightCost,
        unit: 'usd',
        changePercent: costChange,
        trend: costChange <= 0 ? 'down' : 'up',
      },
      matchAccuracy: {
        value: accuracyBase,
        unit: 'percent',
        changePercent: accuracyChange,
        trend: accuracyChange >= 0 ? 'up' : 'down',
      },
      processingTime: {
        value: round(processingTime, 1),
        unit: 'minutes',
        changePercent: processingChange,
        trend: processingChange <= 0 ? 'down' : 'up',
      },
      aiRoi: {
        value: roi,
        unit: 'percent',
        changePercent: roiChange,
        trend: roiChange >= 0 ? 'up' : 'down',
      },
    },
    volumeTrends: historyWindow.map((point, index) => ({
      week: point.week,
      totalLoads: totals[index],
      movingAverage: round(movingAverage[index], 0),
    })),
    laneBreakdown,
    systemPerformance: {
      uptimePercent: round(clamp(99 - context.volatility * 0.04, 96.5, 99.4), 2),
      subsystems,
    },
    forecastAccuracy: {
      mae: round(accuracyMetrics.mae, 1),
      mape: normalizedMape,
      rmse: round(accuracyMetrics.rmse, 1),
      rating,
    },
    insights,
    updatedAt: new Date().toISOString(),
  };
}


