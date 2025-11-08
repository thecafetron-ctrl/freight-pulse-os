import { Router } from 'express';
import { buildAnalyticsSnapshot, buildDashboardSnapshot } from '../utils/operationsInsights';

const router = Router();

router.get('/dashboard', (_req, res) => {
  const snapshot = buildDashboardSnapshot();
  res.json({
    success: true,
    data: snapshot,
  });
});

router.get('/analytics', (_req, res) => {
  const snapshot = buildAnalyticsSnapshot();
  res.json({
    success: true,
    data: snapshot,
  });
});

export default router;


