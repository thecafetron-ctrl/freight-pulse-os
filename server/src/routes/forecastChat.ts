import { Router } from 'express';
import { getLaneData } from '../utils/generateMockData';
import { getLatestForecastForLane } from '../utils/forecastStorage';
import { generateForecastInsight } from '../utils/demandForecastClient';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { lane, question, history, forecast, trend_summary: trendSummary } = req.body || {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'question is required',
      });
    }

    let resolvedHistory = Array.isArray(history) ? history : undefined;
    let resolvedForecast = Array.isArray(forecast) ? forecast : undefined;
    let resolvedSummary: string | undefined = typeof trendSummary === 'string' ? trendSummary : undefined;

    if (lane) {
      const stored = getLatestForecastForLane(lane);
      if (stored) {
        resolvedHistory = stored.history;
        resolvedForecast = stored.forecast;
        resolvedSummary = stored.trend_summary;
      } else if (!resolvedHistory) {
        const laneData = getLaneData(lane);
        if (laneData) {
          resolvedHistory = laneData.history;
        }
      }
    }

    if (!resolvedHistory || resolvedHistory.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Historical data is required to answer questions.',
      });
    }

    const answer = await generateForecastInsight({
      lane: lane || 'Custom Lane',
      question,
      history: resolvedHistory,
      forecast: resolvedForecast,
      trendSummary: resolvedSummary,
    });

    res.json({
      success: true,
      message: answer,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

