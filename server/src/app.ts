import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import matchRouter from './routes/match';
import findLoadsRouter from './routes/findLoads';
import routePlannerRouter from './routes/routePlanner';
import mockDataRouter from './routes/mockdata';
import forecastRouter from './routes/forecast';
import accuracyRouter from './routes/accuracy';
import alertsRouter from './routes/alerts';
import customRouteRouter from './routes/customRoute';
import forecastChatRouter from './routes/forecastChat';
import documentsRouter from './routes/documents';
import insightsRouter from './routes/insights';
import configRouter from './routes/config';
import quotesRouter from './routes/quotes';

export function createApp(): Application {
  const app: Application = express();

  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:8083',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'LoadMatch AI Server',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/match', matchRouter);
  app.use('/api/find-loads', findLoadsRouter);
  app.use('/api/route', routePlannerRouter);
  app.use('/api/mockdata', mockDataRouter);
  app.use('/api/forecast', forecastRouter);
  app.use('/api/accuracy', accuracyRouter);
  app.use('/api/alerts', alertsRouter);
  app.use('/api/custom-route', customRouteRouter);
  app.use('/api/forecast/chat', forecastChatRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/insights', insightsRouter);
  app.use('/api/config', configRouter);
  app.use('/api/quotes', quotesRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = typeof err === 'object' && err !== null && 'status' in err
      ? (err as { status?: number }).status
      : undefined;
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error:', err);
    res.status(status || 500).json({
      error: message,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}


