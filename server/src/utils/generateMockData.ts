import { addWeeks, format } from 'date-fns';

export interface HistoricalPoint {
  week: string;
  loads: number;
}

export interface LaneConfig {
  lane: string;
  origin: string;
  destination: string;
  baseLoad: number;
  seasonalityAmplitude: number;
  seasonalityPhase: number;
}

export interface LaneData {
  lane: string;
  origin: string;
  destination: string;
  history: HistoricalPoint[];
}

const LANES: LaneConfig[] = [
  {
    lane: 'Dallas, TX → Atlanta, GA',
    origin: 'Dallas, TX',
    destination: 'Atlanta, GA',
    baseLoad: 150,
    seasonalityAmplitude: 30,
    seasonalityPhase: 0,
  },
  {
    lane: 'Chicago, IL → Denver, CO',
    origin: 'Chicago, IL',
    destination: 'Denver, CO',
    baseLoad: 120,
    seasonalityAmplitude: 25,
    seasonalityPhase: Math.PI / 4,
  },
  {
    lane: 'Houston, TX → Phoenix, AZ',
    origin: 'Houston, TX',
    destination: 'Phoenix, AZ',
    baseLoad: 180,
    seasonalityAmplitude: 40,
    seasonalityPhase: Math.PI / 2,
  },
];

function generateLaneHistory(
  config: LaneConfig,
  weeks: number = 104,
  startDate: Date = new Date('2023-01-01')
): HistoricalPoint[] {
  const points: HistoricalPoint[] = [];

  for (let i = 0; i < weeks; i += 1) {
    const currentWeek = addWeeks(startDate, i);
    const seasonality =
      config.seasonalityAmplitude * Math.sin((2 * Math.PI * i) / 52 + config.seasonalityPhase);
    const noise = (Math.random() - 0.5) * config.baseLoad * 0.2;
    const trend = (i / 52) * config.baseLoad * 0.005;

    const loads = Math.round(
      config.baseLoad + seasonality + noise + trend,
    );

    points.push({
      week: format(currentWeek, 'yyyy-MM-dd'),
      loads: Math.max(loads, 50),
    });
  }

  return points;
}

const MOCK_DATA_CACHE: LaneData[] = LANES.map((config) => ({
  lane: config.lane,
  origin: config.origin,
  destination: config.destination,
  history: generateLaneHistory(config),
}));

export function getAllMockLaneData(): LaneData[] {
  return JSON.parse(JSON.stringify(MOCK_DATA_CACHE));
}

export function getLaneData(lane: string): LaneData | undefined {
  const data = MOCK_DATA_CACHE.find((item) => item.lane === lane);
  return data ? JSON.parse(JSON.stringify(data)) : undefined;
}

interface CustomLaneOptions {
  origin: string;
  destination: string;
  weeks?: number;
  baseLoad?: number;
  amplitude?: number;
}

export function generateCustomLaneData(options: CustomLaneOptions): LaneData {
  const {
    origin,
    destination,
    weeks = 104,
    baseLoad = 160,
    amplitude = 35,
  } = options;

  const lane = `${origin} → ${destination}`;

  const history: HistoricalPoint[] = [];
  const startDate = new Date('2023-01-01');
  let lastValue = baseLoad;

  for (let i = 0; i < weeks; i += 1) {
    const currentWeek = addWeeks(startDate, i);
    const seasonal = amplitude * Math.sin((2 * Math.PI * i) / 52 + (i % 3) * 0.5);
    const trend = (i / 52) * baseLoad * 0.006;
    const noiseSeed = Math.sin((origin.length + destination.length + i) * 12.9898) * 43758.5453;
    const noise = (noiseSeed - Math.floor(noiseSeed) - 0.5) * baseLoad * 0.18;

    lastValue = Math.max(50, Math.round(baseLoad + seasonal + trend + noise));

    history.push({
      week: format(currentWeek, 'yyyy-MM-dd'),
      loads: lastValue,
    });
  }

  return {
    lane,
    origin,
    destination,
    history,
  };
}


