/**
 * LoadMatch AI - Backend Server
 * 
 * Express server that provides an API endpoint for AI-powered
 * load-truck matching using OpenAI.
 */

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST before other imports
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

const app: Application = express();
const PORT = process.env.PORT || 3001;

/**
 * Middleware Configuration
 */
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'], // Allow Vite and Next.js
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'LoadMatch AI Server',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Routes
 */
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

/**
 * Error Handler
 */
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof err === 'object' && err !== null && 'status' in err ? (err as { status?: number }).status : undefined;
  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('Error:', err);
  res.status(status || 500).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`\n🚛 LoadMatch AI Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check:         http://localhost:${PORT}/health`);
  console.log(`🤖 Match API:            http://localhost:${PORT}/api/match`);
  console.log(`📦 Find Loads API:       http://localhost:${PORT}/api/find-loads`);
  console.log(`🗺️ Route Planner API:     http://localhost:${PORT}/api/route/optimize`);
  console.log(`🧪 Mock Data API:        http://localhost:${PORT}/api/mockdata`);
  console.log(`📈 Forecast API:         http://localhost:${PORT}/api/forecast`);
  console.log(`🎯 Accuracy API:         http://localhost:${PORT}/api/accuracy`);
  console.log(`🚨 Alerts API:           http://localhost:${PORT}/api/alerts`);
  console.log(`🧭 Custom Route API:     http://localhost:${PORT}/api/custom-route`);
  console.log(`💬 Forecast Chat API:    http://localhost:${PORT}/api/forecast/chat\n`);
});
