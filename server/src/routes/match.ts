/**
 * Match API Route
 * 
 * POST /api/match - Generate AI-powered load-truck matches
 */

import express, { Request, Response, Router } from 'express';
import { generateMatches } from '../utils/openaiClient';
import { MatchRequest, MatchResponse } from '../types';

const router: Router = express.Router();

/**
 * POST /api/match
 * 
 * Accepts loads and trucks, returns AI-generated matches
 * 
 * @body {MatchRequest} - Object containing loads and trucks arrays
 * @returns {MatchResponse} - Array of matches with scores and reasoning
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Extract and validate request body
    const { loads, trucks }: MatchRequest = req.body;

    // Validation
    if (!loads || !Array.isArray(loads)) {
      return res.status(400).json({ 
        error: 'Invalid request: loads must be an array' 
      });
    }

    if (!trucks || !Array.isArray(trucks)) {
      return res.status(400).json({ 
        error: 'Invalid request: trucks must be an array' 
      });
    }

    if (loads.length === 0) {
      return res.status(400).json({ 
        error: 'At least one load is required' 
      });
    }

    if (trucks.length === 0) {
      return res.status(400).json({ 
        error: 'At least one truck is required' 
      });
    }

    // Validate load structure
    for (const load of loads) {
      if (!load.id || !load.origin || !load.destination || 
          !load.equipment || !load.weight || !load.pickupDate) {
        return res.status(400).json({ 
          error: `Invalid load structure for load ${load.id || 'unknown'}` 
        });
      }
    }

    // Validate truck structure
    for (const truck of trucks) {
      if (!truck.id || !truck.location || 
          !truck.equipment || !truck.availableDate) {
        return res.status(400).json({ 
          error: `Invalid truck structure for truck ${truck.id || 'unknown'}` 
        });
      }
    }

    console.log('\n🔄 Processing match request...');
    console.log(`📦 ${loads.length} loads, 🚛 ${trucks.length} trucks`);

    // Generate matches using OpenAI
    const matches: MatchResponse = await generateMatches(loads, trucks);

    const duration = Date.now() - startTime;
    console.log(`✅ Request completed in ${duration}ms`);

    // Return matches
    res.json({
      matches,
      metadata: {
        loadsCount: loads.length,
        trucksCount: trucks.length,
        matchesCount: matches.length,
        processingTime: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error in match route:', error);
    
    // Send error response
    res.status(500).json({
      error: error.message || 'Failed to generate matches',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/match
 * 
 * Returns API information
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'LoadMatch AI - Match API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/match - Generate load-truck matches'
    },
    usage: {
      method: 'POST',
      body: {
        loads: 'Array<Load>',
        trucks: 'Array<Truck>'
      }
    }
  });
});

export default router;

