import { HistoricalPoint } from './generateMockData';

export interface ForecastPoint {
  week: string;
  predicted_loads: number;
}

export interface StoredForecast {
  id: string;
  lane: string;
  timestamp: string;
  horizon: number;
  forecast: ForecastPoint[];
  trend_summary: string;
  trend_direction?: 'rising' | 'stable' | 'falling';
  explanation?: string;
  scenario?: string;
  history: HistoricalPoint[];
}

const forecastStore: Map<string, StoredForecast> = new Map();

export function storeForecast(forecast: StoredForecast): void {
  forecastStore.set(forecast.id, forecast);
}

export function getForecast(id: string): StoredForecast | undefined {
  return forecastStore.get(id);
}

export function getForecastsForLane(lane: string): StoredForecast[] {
  return Array.from(forecastStore.values()).filter((item) => item.lane === lane);
}

export function getLatestForecastForLane(lane: string): StoredForecast | undefined {
  return getForecastsForLane(lane)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
}

export function getAllForecasts(): StoredForecast[] {
  return Array.from(forecastStore.values());
}


