/**
 * LoadMatch AI - Backend Server
 * 
 * Express server that provides an API endpoint for AI-powered
 * load-truck matching using OpenAI.
 */

import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 3001;

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
