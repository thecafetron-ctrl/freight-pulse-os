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

/**
 * Error Handler
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`\n🚛 LoadMatch AI Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Match API: http://localhost:${PORT}/api/match`);
  console.log(`🗺️ Route Planner API: http://localhost:${PORT}/api/route/optimize\n`);
});

