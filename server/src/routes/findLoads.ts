/**
 * Find Loads API Route
 * 
 * POST /api/find-loads - Find best loads for a specific vehicle
 */

import express, { Request, Response, Router } from 'express';
import { generateMatches } from '../utils/openaiClient';
import { Load, Truck } from '../types';

const router: Router = express.Router();

interface FindLoadsRequest {
  vehicle: Truck;
  loads: Load[];
}

/**
 * POST /api/find-loads
 * 
 * Finds best loads for a specific vehicle (reverse matching)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { vehicle, loads }: FindLoadsRequest = req.body;

    // Validation
    if (!vehicle || !loads || !Array.isArray(loads)) {
      return res.status(400).json({ error: 'Invalid request: vehicle and loads array required' });
    }

    if (loads.length === 0) {
      return res.status(400).json({ error: 'At least one load is required' });
    }

    console.log(`\n🔍 Finding best loads for vehicle ${vehicle.id} at ${vehicle.location}...`);

    // Use the same matching engine but with single vehicle
    const matches = await generateMatches(loads, [vehicle]);

    // Sort by score (best first)
    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      matches: sortedMatches,
      metadata: {
        vehicleId: vehicle.id,
        loadsAnalyzed: loads.length,
        matchesFound: sortedMatches.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error in find-loads route:', error);
    res.status(500).json({
      error: error.message || 'Failed to find loads',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

