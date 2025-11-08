import { Router } from 'express';
import { getForecastsForLane, getLatestForecastForLane } from '../utils/forecastStorage';
import { detectAnomaliesForLanes } from '../utils/anomalyDetection';

const router = Router();

router.get('/', (req, res) => {
  const lanesParam = (req.query.lanes as string) || '';
  const lanes = lanesParam
    .split(',')
    .map((lane) => lane.trim())
    .filter(Boolean);

  if (lanes.length === 0) {
    return res.json({ success: true, alerts: [], count: 0, timestamp: new Date().toISOString() });
  }

  const laneEntries = lanes
    .map((lane) => {
      const latest = getLatestForecastForLane(lane);
      if (!latest) {
        return null;
      }
      const historicalLoads = latest.history.slice(-12).map((item) => item.loads);
      const forecastLoads = latest.forecast.map((item) => item.predicted_loads);
      return { lane, historical: historicalLoads, forecast: forecastLoads };
    })
    .filter((entry): entry is { lane: string; historical: number[]; forecast: number[] } => entry !== null);

  if (laneEntries.length === 0) {
    return res.json({ success: true, alerts: [], count: 0, timestamp: new Date().toISOString() });
  }

  const anomalies = detectAnomaliesForLanes(laneEntries);

  res.json({
    success: true,
    alerts: anomalies,
    count: anomalies.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;


