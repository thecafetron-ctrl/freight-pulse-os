import { haversineDistance } from './distanceCalculator';

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface RouteAnalysis {
  requiresSea: boolean;
  requiresAir: boolean;
  maxDistance: number;
  crossesOcean: boolean;
  recommendedModes: string[];
  totalDistance: number;
  reasoning: string;
}

function crossesOcean(lat1: number, lng1: number, lat2: number, lng2: number): boolean {
  const distance = haversineDistance(lat1, lng1, lat2, lng2);

  if (distance > 3000) {
    const lngDiff = Math.abs(lng1 - lng2);
    if (lngDiff > 100 || (lngDiff > 40 && lngDiff < 100)) {
      return true;
    }
  }

  const isWesternHemisphere1 = lng1 < -30;
  const isEasternHemisphere1 = lng1 > 30;
  const isWesternHemisphere2 = lng2 < -30;
  const isEasternHemisphere2 = lng2 > 30;

  if (
    (isWesternHemisphere1 && isEasternHemisphere2) ||
    (isWesternHemisphere2 && isEasternHemisphere1)
  ) {
    return true;
  }

  return false;
}

export function analyzeRoute(origin: Location, stops: Location[]): RouteAnalysis {
  const allPoints = [origin, ...stops];
  let maxDistance = 0;
  let totalDistance = 0;
  let crossesWater = false;

  for (let i = 0; i < allPoints.length - 1; i++) {
    const distance = haversineDistance(
      allPoints[i].lat,
      allPoints[i].lng,
      allPoints[i + 1].lat,
      allPoints[i + 1].lng
    );

    totalDistance += distance;
    maxDistance = Math.max(maxDistance, distance);

    if (
      crossesOcean(
        allPoints[i].lat,
        allPoints[i].lng,
        allPoints[i + 1].lat,
        allPoints[i + 1].lng
      )
    ) {
      crossesWater = true;
    }
  }

  const recommendedModes: string[] = [];
  let reasoning = '';

  if (crossesWater) {
    if (maxDistance > 5000) {
      recommendedModes.push('air');
      reasoning = `Route crosses major oceans over ${maxDistance.toFixed(
        0
      )} km. Air transport is the practical option.`;
    } else {
      recommendedModes.push('air', 'sea');
      reasoning = `Route crosses water bodies. Air offers speed while sea freight is economical over ${maxDistance.toFixed(
        0
      )} km.`;
    }
  } else {
    if (maxDistance < 1000) {
      recommendedModes.push('land');
      reasoning = `All stops are within ${maxDistance.toFixed(
        0
      )} km on the same landmass. Ground transport is most practical.`;
    } else if (maxDistance < 3000) {
      recommendedModes.push('land', 'air');
      reasoning = `Route spans ${maxDistance.toFixed(
        0
      )} km on land. Trucks are economical; air is faster for urgent freight.`;
    } else {
      recommendedModes.push('air');
      reasoning = `Long continental distance (${maxDistance.toFixed(
        0
      )} km). Air transport is the most efficient option.`;
    }
  }

  return {
    requiresSea: crossesWater && maxDistance > 2000,
    requiresAir: crossesWater || maxDistance > 3000,
    maxDistance,
    crossesOcean: crossesWater,
    recommendedModes,
    totalDistance,
    reasoning,
  };
}

export function isTransportModeValid(mode: string, routeAnalysis: RouteAnalysis): {
  valid: boolean;
  reason?: string;
} {
  if (mode === 'land') {
    if (routeAnalysis.crossesOcean) {
      return {
        valid: false,
        reason: 'Land transport cannot cross oceans. Choose air or sea transport.',
      };
    }
    if (routeAnalysis.maxDistance > 5000) {
      return {
        valid: false,
        reason: `Distance too long (${routeAnalysis.maxDistance.toFixed(
          0
        )} km) for practical ground transport. Consider air freight.`,
      };
    }
  }

  if (mode === 'sea') {
    if (!routeAnalysis.crossesOcean && routeAnalysis.maxDistance < 1000) {
      return {
        valid: false,
        reason: 'Sea transport is not practical for short inland routes. Use land or air transport.',
      };
    }
  }

  return { valid: true };
}


