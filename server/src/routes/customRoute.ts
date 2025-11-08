import { Router } from 'express';
import { generateCustomLaneData } from '../utils/generateMockData';

const router = Router();

router.post('/', (req, res) => {
  const { origin, destination, weeks, baseLoad, amplitude } = req.body || {};

  if (!origin || !destination) {
    return res.status(400).json({
      success: false,
      error: 'origin and destination are required',
    });
  }

  const laneData = generateCustomLaneData({
    origin: String(origin),
    destination: String(destination),
    weeks: weeks ? Number(weeks) : undefined,
    baseLoad: baseLoad ? Number(baseLoad) : undefined,
    amplitude: amplitude ? Number(amplitude) : undefined,
  });

  res.json({
    success: true,
    data: laneData,
  });
});

export default router;

