import { Router } from 'express';
import { getAllMockLaneData } from '../utils/generateMockData';

const router = Router();

router.get('/', (_req, res) => {
  const data = getAllMockLaneData();
  res.json({
    success: true,
    data,
    lanes: data.map((lane) => lane.lane),
    timestamp: new Date().toISOString(),
  });
});

export default router;


