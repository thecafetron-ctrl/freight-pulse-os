import OpenAI from 'openai';
import { HistoricalPoint } from './generateMockData';

export interface ForecastPoint {
  week: string;
  predicted_loads: number;
}

export interface ForecastResponse {
  forecast: ForecastPoint[];
  trend_summary: string;
  trend_direction?: 'rising' | 'stable' | 'falling';
  confidence?: 'high' | 'medium' | 'low';
  explanation?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateDemandForecast(
  lane: string,
  history: HistoricalPoint[],
  horizon: number = 8,
  scenario?: string,
): Promise<ForecastResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured.');
  }

  const systemPrompt = `You are a logistics demand forecasting AI.
Given historical weekly shipment data for a freight lane, forecast the number of loads for the specified horizon in weeks.
${scenario ? `Consider the following scenario: ${scenario}` : ''}
Your response MUST be valid JSON only with this structure:
{
  "forecast": [
    {"week": "YYYY-MM-DD", "predicted_loads": number}
  ],
  "trend_summary": "brief natural language summary of the trend",
  "trend_direction": "rising" | "stable" | "falling",
  "confidence": "high" | "medium" | "low",
  "explanation": "1-2 sentence explanation of the key drivers"
}`;

  let userPrompt = `Lane: ${lane}

Historical weekly shipment data (most recent 52 weeks):
${JSON.stringify(history.slice(-52), null, 2)}

Forecast the next ${horizon} weeks of demand with weekly granularity.`;

  if (scenario) {
    userPrompt += `\n\nScenario/Assumptions:\n${scenario}\n\nAdjust the forecast based on these assumptions and explain the impact.`;
  }

  userPrompt += '\n\nReturn JSON only.';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    const parsed = JSON.parse(content) as ForecastResponse;

    if (!Array.isArray(parsed.forecast) || !parsed.trend_summary) {
      throw new Error('Invalid forecast structure from OpenAI');
    }

    if (parsed.forecast.length !== horizon) {
      console.warn(`Expected ${horizon} forecast points, received ${parsed.forecast.length}`);
    }

    if (!parsed.trend_direction) parsed.trend_direction = 'stable';
    if (!parsed.confidence) parsed.confidence = 'medium';
    if (!parsed.explanation) parsed.explanation = parsed.trend_summary;

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn('Initial forecast parse failed, attempting retry with constrained prompt...');
      try {
        const retry = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a logistics forecasting AI. Respond with STRICT JSON only.' },
            {
              role: 'user',
              content: `Forecast ${horizon} weeks of demand for lane "${lane}" using this recent history: ${JSON.stringify(
                history.slice(-12),
              )}. ${scenario ? `Scenario: ${scenario}.` : ''} Return JSON with keys forecast (array of ${horizon} items with week and predicted_loads), trend_summary, trend_direction, confidence, explanation.`,
            },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        });

        const retryContent = retry.choices[0]?.message?.content;
        if (retryContent) {
          const parsed = JSON.parse(retryContent) as ForecastResponse;
          if (!parsed.trend_direction) parsed.trend_direction = 'stable';
          if (!parsed.confidence) parsed.confidence = 'medium';
          if (!parsed.explanation) parsed.explanation = parsed.trend_summary;
          return parsed;
        }
      } catch (innerError) {
        console.error('Retry forecast generation failed', innerError);
      }
    }

    if (error instanceof Error) {
      throw new Error(`Failed to generate forecast: ${error.message}`);
    }

    throw new Error('Failed to generate forecast due to an unknown error');
  }
}

interface InsightParams {
  lane: string;
  question: string;
  history: HistoricalPoint[];
  forecast?: ForecastPoint[];
  trendSummary?: string;
}

export async function generateForecastInsight(params: InsightParams): Promise<string> {
  const { lane, question, history, forecast, trendSummary } = params;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured.');
  }

  const recentHistory = history.slice(-16);
  const recentForecast = forecast ? forecast.slice(0, 16) : [];

  const systemPrompt = `You are a senior logistics analyst helping stakeholders interpret demand forecasts.
Use the provided historical shipment volumes and AI forecast data to answer questions clearly and concisely.
Highlight important trends, risk factors, and actionable insights.`;

  const userPrompt = `Lane: ${lane}

Historical weekly data (most recent ${recentHistory.length} points):
${JSON.stringify(recentHistory, null, 2)}

Forecasted weekly loads (${recentForecast.length} points):
${JSON.stringify(recentForecast, null, 2)}

Trend summary: ${trendSummary || 'Not available'}

Question: ${question}

Provide a direct answer referencing the data. Keep it under 6 sentences.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    return content.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate insight: ${error.message}`);
    }
    throw new Error('Failed to generate insight due to an unknown error');
  }
}


