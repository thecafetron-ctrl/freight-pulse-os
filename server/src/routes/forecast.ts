import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateDemandForecast } from '../utils/demandForecastClient';
import { getLaneData } from '../utils/generateMockData';
import { storeForecast } from '../utils/forecastStorage';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { lane, history, horizon = 8, scenario } = req.body;

    if (!lane || typeof lane !== 'string') {
      return res.status(400).json({ success: false, error: 'Lane is required and must be a string.' });
    }

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ success: false, error: 'History must be a non-empty array.' });
    }

    if (![4, 8, 12, 24].includes(Number(horizon))) {
      return res.status(400).json({ success: false, error: 'Horizon must be one of 4, 8, 12, 24.' });
    }

    const forecast = await generateDemandForecast(lane, history, Number(horizon), scenario);

    const storedId = uuidv4();
    storeForecast({
      id: storedId,
      lane,
      timestamp: new Date().toISOString(),
      horizon: Number(horizon),
      forecast: forecast.forecast,
      trend_summary: forecast.trend_summary,
      trend_direction: forecast.trend_direction,
      explanation: forecast.explanation,
      scenario,
      history,
    });

    res.json({
      success: true,
      id: storedId,
      lane,
      forecast: forecast.forecast,
      trend_summary: forecast.trend_summary,
      trend_direction: forecast.trend_direction,
      explanation: forecast.explanation,
      confidence: forecast.confidence,
      scenario: scenario || null,
      horizon: Number(horizon),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/scenario', async (req, res, next) => {
  try {
    const { lane, scenario, horizon = 8 } = req.body;

    if (!lane || typeof lane !== 'string') {
      return res.status(400).json({ success: false, error: 'Lane is required.' });
    }
    if (!scenario || typeof scenario !== 'string') {
      return res.status(400).json({ success: false, error: 'Scenario description is required.' });
    }
    if (![4, 8, 12, 24].includes(Number(horizon))) {
      return res.status(400).json({ success: false, error: 'Horizon must be one of 4, 8, 12, 24.' });
    }

    const laneData = getLaneData(lane);
    if (!laneData) {
      return res.status(404).json({ success: false, error: 'Lane data not found.' });
    }

    const scenarioForecast = await generateDemandForecast(lane, laneData.history, Number(horizon), scenario);
    const baselineForecast = await generateDemandForecast(lane, laneData.history, Number(horizon));

    const scenarioMean = scenarioForecast.forecast.reduce((sum, point) => sum + point.predicted_loads, 0) /
      scenarioForecast.forecast.length;
    const baselineMean = baselineForecast.forecast.reduce((sum, point) => sum + point.predicted_loads, 0) /
      baselineForecast.forecast.length;

    const percentChange = baselineMean === 0 ? 0 : ((scenarioMean - baselineMean) / baselineMean) * 100;

    res.json({
      success: true,
      lane,
      scenario,
      scenarioForecast: scenarioForecast.forecast,
      baselineForecast: baselineForecast.forecast,
      scenarioExplanation: scenarioForecast.explanation || scenarioForecast.trend_summary,
      impact: {
        percentChange: Math.round(percentChange * 10) / 10,
        direction: percentChange > 0 ? 'increase' : percentChange < 0 ? 'decrease' : 'neutral',
        description: `Scenario would result in ${Math.abs(Math.round(percentChange))}% ${
          percentChange > 0 ? 'increase' : percentChange < 0 ? 'decrease' : 'change'
        } in average demand`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;


