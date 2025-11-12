import type { AnalyticsSnapshot, DashboardSnapshot } from "@/types/analytics";

const buildRecentTimestamps = (count: number, stepMinutes: number): string[] =>
  Array.from({ length: count }, (_value, index) => {
    const date = new Date(Date.now() - index * stepMinutes * 60_000);
    return date.toISOString();
  });

const buildWeeklySeries = (weeks: number, baseline: number[]): { week: string; loads: number }[] => {
  const result: { week: string; loads: number }[] = [];
  const today = new Date();

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const loads = baseline[baseline.length - (weeks - i)] ?? baseline[baseline.length - 1];
    result.push({ week: date.toISOString(), loads });
  }

  return result;
};

const computeMovingAverage = (values: number[], window = 4): number[] =>
  values.map((_value, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = values.slice(start, index + 1);
    const average = slice.reduce((sum, item) => sum + item, 0) / slice.length;
    return Math.round(average);
  });

export const getFallbackDashboardSnapshot = (): DashboardSnapshot => {
  const laneHighlights = [
    {
      lane: "Los Angeles → New York",
      origin: "Los Angeles, CA",
      destination: "New York, NY",
      weeklyLoads: 186,
      changePercent: 6.4,
      trend: "up" as const,
    },
    {
      lane: "Chicago → Dallas",
      origin: "Chicago, IL",
      destination: "Dallas, TX",
      weeklyLoads: 158,
      changePercent: 4.1,
      trend: "up" as const,
    },
    {
      lane: "Memphis → Atlanta",
      origin: "Memphis, TN",
      destination: "Atlanta, GA",
      weeklyLoads: 132,
      changePercent: -2.3,
      trend: "stable" as const,
    },
    {
      lane: "Seattle → Denver",
      origin: "Seattle, WA",
      destination: "Denver, CO",
      weeklyLoads: 118,
      changePercent: 3.8,
      trend: "up" as const,
    },
    {
      lane: "Houston → Miami",
      origin: "Houston, TX",
      destination: "Miami, FL",
      weeklyLoads: 111,
      changePercent: -4.6,
      trend: "down" as const,
    },
  ];

  const timestamps = buildRecentTimestamps(4, 6);

  return {
    stats: {
      activeShipments: 864,
      quoteRequests: 362,
      matchRate: 95.2,
      avgResponseTimeMinutes: 2.4,
    },
    utilization: {
      availableVehicles: 238,
      utilizationPercent: 84.5,
      idleVehicles: 37,
    },
    laneHighlights,
    recentActivity: laneHighlights.slice(0, 4).map((lane, index) => ({
      id: `fallback-activity-${index}`,
      type: (["quote", "match", "forecast", "document"] as const)[index % 4],
      action: `${lane.lane} updated`,
      detail: `${lane.changePercent >= 0 ? "+" : ""}${lane.changePercent}% change · ${
        lane.weeklyLoads
      } weekly loads`,
      timestamp: timestamps[index],
      status: (["success", "success", "info", "info"] as const)[index % 4],
    })),
    systemStatus: [
      {
        system: "Quote Engine",
        status: "operational",
        latencyMs: 318,
        throughputPerMinute: 64,
        uptimePercent: 99.42,
      },
      {
        system: "Load Matcher",
        status: "operational",
        latencyMs: 366,
        throughputPerMinute: 58,
        uptimePercent: 99.18,
      },
      {
        system: "Document AI",
        status: "operational",
        latencyMs: 294,
        throughputPerMinute: 32,
        uptimePercent: 99.67,
      },
      {
        system: "Forecasting",
        status: "degraded",
        latencyMs: 412,
        throughputPerMinute: 24,
        uptimePercent: 98.94,
      },
    ],
    alerts: {
      count: 3,
      topAlerts: [
        {
          lane: "Chicago → Dallas",
          type: "spike",
          severity: "medium",
          message: "Demand spike driven by retail replenishment activity.",
          percentChange: 12.4,
        },
        {
          lane: "Houston → Miami",
          type: "drop",
          severity: "high",
          message: "Weather-related slowdowns impacting departure cadence.",
          percentChange: -15.8,
        },
        {
          lane: "Seattle → Denver",
          type: "spike",
          severity: "low",
          message: "E-commerce overflow increasing west-to-midwest volume.",
          percentChange: 8.1,
        },
      ],
    },
    updatedAt: new Date().toISOString(),
  };
};

export const getFallbackAnalyticsSnapshot = (): AnalyticsSnapshot => {
  const weeklyBaseline = [612, 624, 639, 652, 668, 681, 694, 702, 718, 733, 744, 758];
  const weeklySeries = buildWeeklySeries(12, weeklyBaseline);
  const movingAverage = computeMovingAverage(weeklySeries.map((point) => point.loads));

  return {
    kpis: {
      avgFreightCost: {
        value: 187_400,
        unit: "usd",
        changePercent: -3.6,
        trend: "down",
      },
      matchAccuracy: {
        value: 96.2,
        unit: "percent",
        changePercent: 1.4,
        trend: "up",
      },
      processingTime: {
        value: 2.2,
        unit: "minutes",
        changePercent: -0.9,
        trend: "down",
      },
      aiRoi: {
        value: 332.5,
        unit: "percent",
        changePercent: 4.8,
        trend: "up",
      },
    },
    volumeTrends: weeklySeries.map((point, index) => ({
      week: point.week,
      totalLoads: point.loads,
      movingAverage: movingAverage[index],
    })),
    laneBreakdown: [
      {
        lane: "Los Angeles → New York",
        origin: "Los Angeles, CA",
        destination: "New York, NY",
        current: 186,
        previous: 174,
        changePercent: 6.4,
      },
      {
        lane: "Chicago → Dallas",
        origin: "Chicago, IL",
        destination: "Dallas, TX",
        current: 158,
        previous: 152,
        changePercent: 4.1,
      },
      {
        lane: "Memphis → Atlanta",
        origin: "Memphis, TN",
        destination: "Atlanta, GA",
        current: 132,
        previous: 135,
        changePercent: -2.3,
      },
      {
        lane: "Seattle → Denver",
        origin: "Seattle, WA",
        destination: "Denver, CO",
        current: 118,
        previous: 113,
        changePercent: 3.8,
      },
      {
        lane: "Houston → Miami",
        origin: "Houston, TX",
        destination: "Miami, FL",
        current: 111,
        previous: 116,
        changePercent: -4.6,
      },
      {
        lane: "Toronto → Montreal",
        origin: "Toronto, ON",
        destination: "Montreal, QC",
        current: 96,
        previous: 92,
        changePercent: 4.2,
      },
    ],
    systemPerformance: {
      uptimePercent: 99.12,
      subsystems: [
        { name: "Quote Engine", utilization: 82.4, latencyMs: 332 },
        { name: "Load Matcher", utilization: 85.1, latencyMs: 348 },
        { name: "Document AI", utilization: 72.6, latencyMs: 286 },
        { name: "Forecasting", utilization: 78.3, latencyMs: 364 },
      ],
    },
    forecastAccuracy: {
      mae: 6.4,
      mape: 4.9,
      rmse: 8.1,
      rating: "excellent",
    },
    insights: [
      {
        title: "Lane Momentum",
        description: "Los Angeles → New York volume up +6.4% with sustained retail pull-through.",
      },
      {
        title: "Fleet Utilization",
        description: "AI-backed dispatch keeping utilization at 84.5% with 37 idle assets ready.",
      },
      {
        title: "Alert Spotlight",
        description: "Houston → Miami slowdown flagged for proactive mode-shift mitigation.",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
};


