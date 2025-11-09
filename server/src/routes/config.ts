import { Router } from 'express';

const router = Router();

router.get('/mapbox-token', (_req, res) => {
  const rawToken = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || '';
  if (!rawToken) {
    return res.json({
      success: false,
      token: null,
      message: 'Mapbox token not configured',
    });
  }

  return res.json({
    success: true,
    token: rawToken,
  });
});

export default router;


