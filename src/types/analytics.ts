export type AnomalyType = 'spike' | 'drop' | 'stable';
export type AnomalySeverity = 'low' | 'medium' | 'high';

export interface InsightAnomaly {
  lane: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  percentChange: number;
}

export interface DashboardActivity {
  id: string;
  type: 'quote' | 'match' | 'document' | 'forecast';
  action: string;
  detail: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface DashboardSystemStatus {
  system: string;
  status: 'operational' | 'degraded' | 'offline';
  latencyMs: number;
  throughputPerMinute: number;
  uptimePercent: number;
}

export interface DashboardLaneHighlight {
  lane: string;
  origin: string;
  destination: string;
  weeklyLoads: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
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
  laneHighlights: DashboardLaneHighlight[];
  recentActivity: DashboardActivity[];
  systemStatus: DashboardSystemStatus[];
  alerts: {
    count: number;
    topAlerts: InsightAnomaly[];
  };
  updatedAt: string;
}

export interface AnalyticsKPI {
  value: number;
  unit: 'usd' | 'percent' | 'minutes';
  changePercent: number;
  trend: 'up' | 'down';
}

export interface AnalyticsSnapshot {
  kpis: {
    avgFreightCost: AnalyticsKPI & { unit: 'usd' };
    matchAccuracy: AnalyticsKPI & { unit: 'percent' };
    processingTime: AnalyticsKPI & { unit: 'minutes' };
    aiRoi: AnalyticsKPI & { unit: 'percent' };
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


