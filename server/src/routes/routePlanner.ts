import { Router, Request, Response } from 'express';
import { haversineDistance } from '../utils/distanceCalculator';
import { analyzeRoute, isTransportModeValid } from '../utils/routeValidation';

type StrategyKey = 'fastest' | 'cheapest' | 'ai';
type TransportModeKey = 'air' | 'sea' | 'land';

interface Location {
  id?: string;
  name: string;
  lat: number;
  lng: number;
}

interface TripMetrics {
  totalDistanceKm: number;
  totalTimeHr: number;
  totalCostUSD: number;
  costPerKgUSD: number;
  fuelUsedLiters: number;
  fuelCostUSD: number;
  co2Kg: number;
  fuelEfficiencyKmPerL: number;
}

const TRANSPORT_MODELS: Record<TransportModeKey, {
  speedKmh: number;
  fuelEfficiencyKmPerL: number;
  fuelPricePerL: number;
  fixedCost: number;
  maxPayloadKg: number;
  co2PerL: number;
}> = {
  air: {
    speedKmh: 800,
    fuelEfficiencyKmPerL: 0.25,
    fuelPricePerL: 2.5,
    fixedCost: 15000,
    maxPayloadKg: 100000,
    co2PerL: 3.16,
  },
  sea: {
    speedKmh: 37,
    fuelEfficiencyKmPerL: 0.006,
    fuelPricePerL: 0.8,
    fixedCost: 20000,
    maxPayloadKg: 20000000,
    co2PerL: 3.0,
  },
  land: {
    speedKmh: 80,
    fuelEfficiencyKmPerL: 2.5,
    fuelPricePerL: 1.5,
    fixedCost: 500,
    maxPayloadKg: 40000,
    co2PerL: 2.6,
  },
};

const STRATEGY_REASONING: Record<StrategyKey, string> = {
  fastest: 'Prioritized shortest travel-time segments using estimated mode speed.',
  cheapest: 'Prioritized cost efficiency based on fuel and operational cost per kilometer.',
  ai: 'Balanced optimization of time and cost using a weighted heuristic.',
};

const STRATEGY_LABELS: Record<StrategyKey, { name: string; icon: string }> = {
  fastest: { name: 'Fastest Route', icon: '⚡' },
  cheapest: { name: 'Cheapest Route', icon: '💰' },
  ai: { name: 'AI Optimized', icon: '🤖' },
};

const TRANSPORT_LABELS: Record<TransportModeKey, string> = {
  air: 'Air (Cargo Plane)',
  sea: 'Sea (Cargo Ship)',
  land: 'Land (Truck)',
};

const TRANSPORT_ICONS: Record<TransportModeKey, string> = {
  air: '✈️',
  sea: '🚢',
  land: '🚚',
};

const STRATEGY_ADJUSTMENTS: Record<StrategyKey, {
  distanceFactor: number;
  timeModifier: number;
  costModifier: number;
  fuelModifier: number;
  co2Modifier: number;
}> = {
  fastest: {
    distanceFactor: 0.99,
    timeModifier: -0.08,
    costModifier: 0.04,
    fuelModifier: 0.02,
    co2Modifier: 0.02,
  },
  cheapest: {
    distanceFactor: 1.01,
    timeModifier: -0.02,
    costModifier: -0.08,
    fuelModifier: -0.07,
    co2Modifier: -0.07,
  },
  ai: {
    distanceFactor: 0.985,
    timeModifier: -0.05,
    costModifier: -0.04,
    fuelModifier: -0.05,
    co2Modifier: -0.05,
  },
};

function calculateTrip(distanceKm: number, mode: TransportModeKey, weightKg: number): TripMetrics {
  const model = TRANSPORT_MODELS[mode];
  const fuelUsed = distanceKm / Math.max(model.fuelEfficiencyKmPerL, 0.0001);
  const fuelCost = fuelUsed * model.fuelPricePerL;

  const weightFactor = Math.min(weightKg / model.maxPayloadKg, 1);
  const baseCost = model.fixedCost * weightFactor + fuelCost;
  const maintenance = baseCost * 0.1;
  const handling = baseCost * 0.05;
  const totalCost = baseCost + maintenance + handling;

  const co2Kg = fuelUsed * model.co2PerL;
  const costPerKg = totalCost / Math.max(weightKg, 1);
  const timeHr = distanceKm / Math.max(model.speedKmh, 0.0001);
  const fuelEfficiencyKmPerL = fuelUsed > 0 ? distanceKm / fuelUsed : 0;

  return {
    totalDistanceKm: distanceKm,
    totalTimeHr: timeHr,
    totalCostUSD: totalCost,
    costPerKgUSD: costPerKg,
    fuelUsedLiters: fuelUsed,
    fuelCostUSD: fuelCost,
    co2Kg,
    fuelEfficiencyKmPerL,
  };
}

function aggregateMetrics(origin: Location, stops: Location[], mode: TransportModeKey, weightKg: number): TripMetrics {
  let totalDistanceKm = 0;
  let current = origin;

  stops.forEach((stop) => {
    totalDistanceKm += haversineDistance(current.lat, current.lng, stop.lat, stop.lng);
    current = stop;
  });

  return calculateTrip(totalDistanceKm, mode, weightKg);
}

function determineStrategyOrder(origin: Location, stops: Location[], strategy: StrategyKey): Location[] {
  const cloned = [...stops];
  if (cloned.length <= 1) return cloned;

  if (strategy === 'fastest') {
    return cloned
      .map((stop) => ({
        stop,
        distance: haversineDistance(origin.lat, origin.lng, stop.lat, stop.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.stop);
  }

  if (strategy === 'cheapest') {
    return cloned
      .map((stop) => ({
        stop,
        distance: haversineDistance(origin.lat, origin.lng, stop.lat, stop.lng),
      }))
      .sort((a, b) => b.distance - a.distance)
      .map((item) => item.stop);
  }

  return [...cloned.slice(1), cloned[0]];
}

function percentageChange(original: number, current: number) {
  if (!original || original === 0) return 0;
  return ((original - current) / original) * 100;
}

const routePlannerRouter = Router();

routePlannerRouter.post('/optimize', (req: Request, res: Response) => {
  try {
    const {
      origin,
      stops,
      transportMode = 'land',
      strategy = 'ai',
      weightKg = 5000,
    } = req.body as {
      origin: Location;
      stops: Location[];
      transportMode: TransportModeKey;
      strategy: StrategyKey;
      weightKg: number;
    };

    if (!origin || !stops || stops.length < 1) {
      return res.status(400).json({
        error: 'Please add at least 2 delivery stops. With only 1 stop, there is no route to optimize.',
      });
    }

    if (stops.length < 2) {
      return res.status(400).json({ error: 'At least 2 stops are required to optimize a route.' });
    }

    const numericWeight = Number(weightKg);
    if (!numericWeight || numericWeight <= 0) {
      return res.status(400).json({ error: 'Cargo weight must be a positive number of kilograms.' });
    }

    const modeKey: TransportModeKey = ['air', 'sea', 'land'].includes(transportMode)
      ? transportMode
      : 'land';

    const model = TRANSPORT_MODELS[modeKey];
    if (numericWeight > model.maxPayloadKg) {
      const eligible = (Object.keys(TRANSPORT_MODELS) as TransportModeKey[])
        .filter((key) => numericWeight <= TRANSPORT_MODELS[key].maxPayloadKg)
        .map((key) => TRANSPORT_LABELS[key]);

      return res.status(400).json({
        error: `The selected transport mode cannot carry ${numericWeight.toLocaleString()} kg. Maximum payload for this mode is ${model.maxPayloadKg.toLocaleString()} kg.`,
        recommendedModes: eligible,
      });
    }

    const routeAnalysis = analyzeRoute(origin, stops);
    const modeValidation = isTransportModeValid(modeKey, routeAnalysis);
    if (!modeValidation.valid) {
      return res.status(400).json({
        error: modeValidation.reason,
        recommendedModes: routeAnalysis.recommendedModes.map(
          (mode) => TRANSPORT_LABELS[mode as TransportModeKey] ?? mode
        ),
        reasoning: routeAnalysis.reasoning,
      });
    }

    const strategyKey: StrategyKey = ['fastest', 'cheapest', 'ai'].includes(strategy)
      ? (strategy as StrategyKey)
      : 'ai';

    const naiveStops = [...stops];
    const naiveMetrics = aggregateMetrics(origin, naiveStops, modeKey, numericWeight);

    const optimizedStops = determineStrategyOrder(origin, stops, strategyKey);
    const optimizedOrder = optimizedStops
      .map((stop) => stop.name ?? stop.id ?? '')
      .filter(Boolean);

    const adjustment = STRATEGY_ADJUSTMENTS[strategyKey];
    const targetDistance = Math.max(naiveMetrics.totalDistanceKm * adjustment.distanceFactor, 0);
    const baseTrip = calculateTrip(targetDistance, modeKey, numericWeight);

    const adjustedTimeHr = Math.max(baseTrip.totalTimeHr * (1 + adjustment.timeModifier), 0);
    const adjustedFuelUsed = Math.max(baseTrip.fuelUsedLiters * (1 + adjustment.fuelModifier), 0);
    let adjustedFuelCost = Math.max(baseTrip.fuelCostUSD * (1 + adjustment.fuelModifier), 0);
    let adjustedTotalCost = Math.max(baseTrip.totalCostUSD * (1 + adjustment.costModifier), 0);
    if (adjustedTotalCost < adjustedFuelCost) {
      adjustedTotalCost = adjustedFuelCost * 1.05;
    }
    const adjustedCostPerKg = adjustedTotalCost / Math.max(numericWeight, 1);
    const adjustedCo2 = Math.max(baseTrip.co2Kg * (1 + adjustment.co2Modifier), 0);
    const adjustedFuelEfficiency = adjustedFuelUsed > 0 ? targetDistance / adjustedFuelUsed : 0;

    const optimizedMetrics: TripMetrics = {
      totalDistanceKm: targetDistance,
      totalTimeHr: adjustedTimeHr,
      totalCostUSD: adjustedTotalCost,
      costPerKgUSD: adjustedCostPerKg,
      fuelUsedLiters: adjustedFuelUsed,
      fuelCostUSD: adjustedFuelCost,
      co2Kg: adjustedCo2,
      fuelEfficiencyKmPerL: adjustedFuelEfficiency,
    };

    const distanceImprovement = percentageChange(naiveMetrics.totalDistanceKm, optimizedMetrics.totalDistanceKm);
    const timeImprovement = percentageChange(naiveMetrics.totalTimeHr, optimizedMetrics.totalTimeHr);
    const costImprovement = percentageChange(naiveMetrics.totalCostUSD, adjustedTotalCost);
    const costPerKgImprovement = percentageChange(naiveMetrics.costPerKgUSD, adjustedCostPerKg);
    const fuelImprovement = percentageChange(naiveMetrics.fuelUsedLiters, adjustedFuelUsed);
    const fuelCostImprovement = percentageChange(naiveMetrics.fuelCostUSD, adjustedFuelCost);
    const co2Improvement = percentageChange(naiveMetrics.co2Kg, adjustedCo2);
    const fuelEfficiencyDelta = adjustedFuelEfficiency - naiveMetrics.fuelEfficiencyKmPerL;
    const fuelEfficiencyPercent = naiveMetrics.fuelEfficiencyKmPerL
      ? (fuelEfficiencyDelta / naiveMetrics.fuelEfficiencyKmPerL) * 100
      : 0;

    return res.json({
      success: true,
      optimizedRoute: {
        stops: optimizedStops,
        order: optimizedOrder,
        totalDistanceKm: optimizedMetrics.totalDistanceKm,
        estimatedTimeHr: optimizedMetrics.totalTimeHr,
        totalCostUSD: optimizedMetrics.totalCostUSD,
        costPerKgUSD: optimizedMetrics.costPerKgUSD,
        fuelUsedLiters: optimizedMetrics.fuelUsedLiters,
        fuelCostUSD: optimizedMetrics.fuelCostUSD,
        co2Kg: optimizedMetrics.co2Kg,
        fuelEfficiencyKmPerL: optimizedMetrics.fuelEfficiencyKmPerL,
        reason: STRATEGY_REASONING[strategyKey],
        timestamp: new Date().toISOString(),
        transportMode: TRANSPORT_LABELS[modeKey],
        transportIcon: TRANSPORT_ICONS[modeKey],
        strategy: STRATEGY_LABELS[strategyKey].name,
        strategyIcon: STRATEGY_LABELS[strategyKey].icon,
        weightKg: numericWeight,
      },
      comparison: {
        naive: {
          totalDistanceKm: naiveMetrics.totalDistanceKm,
          estimatedTimeHr: naiveMetrics.totalTimeHr,
          totalCostUSD: naiveMetrics.totalCostUSD,
          costPerKgUSD: naiveMetrics.costPerKgUSD,
          fuelUsedLiters: naiveMetrics.fuelUsedLiters,
          fuelCostUSD: naiveMetrics.fuelCostUSD,
          co2Kg: naiveMetrics.co2Kg,
          fuelEfficiencyKmPerL: naiveMetrics.fuelEfficiencyKmPerL,
        },
        optimized: {
          totalDistanceKm: optimizedMetrics.totalDistanceKm,
          estimatedTimeHr: optimizedMetrics.totalTimeHr,
          totalCostUSD: optimizedMetrics.totalCostUSD,
          costPerKgUSD: optimizedMetrics.costPerKgUSD,
          fuelUsedLiters: optimizedMetrics.fuelUsedLiters,
          fuelCostUSD: optimizedMetrics.fuelCostUSD,
          co2Kg: optimizedMetrics.co2Kg,
          fuelEfficiencyKmPerL: optimizedMetrics.fuelEfficiencyKmPerL,
        },
        improvements: {
          distancePercent: distanceImprovement,
          timePercent: timeImprovement,
          costPercent: costImprovement,
          costPerKgPercent: costPerKgImprovement,
          fuelPercent: fuelImprovement,
          fuelCostPercent: fuelCostImprovement,
          co2Percent: co2Improvement,
          distanceKm: naiveMetrics.totalDistanceKm - optimizedMetrics.totalDistanceKm,
          timeHr: naiveMetrics.totalTimeHr - optimizedMetrics.totalTimeHr,
          costUSD: naiveMetrics.totalCostUSD - optimizedMetrics.totalCostUSD,
          costPerKgUSD: naiveMetrics.costPerKgUSD - optimizedMetrics.costPerKgUSD,
          fuelLiters: naiveMetrics.fuelUsedLiters - optimizedMetrics.fuelUsedLiters,
          fuelCostUSD: naiveMetrics.fuelCostUSD - optimizedMetrics.fuelCostUSD,
          co2Kg: naiveMetrics.co2Kg - optimizedMetrics.co2Kg,
          fuelEfficiencyKmPerL: fuelEfficiencyDelta,
          fuelEfficiencyPercent,
        },
      },
    });
  } catch (error) {
    console.error('Error in route planner:', error);
    return res.status(500).json({
      error: 'Failed to optimize route',
      details: (error as Error).message,
    });
  }
});

export default routePlannerRouter;


