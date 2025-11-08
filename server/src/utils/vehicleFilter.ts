/**
 * Smart Vehicle Filtering Algorithm
 * 
 * Pre-filters vehicles before sending to OpenAI to reduce toke\ns and improve speed
 */

import { Load, Truck } from '../types';
import { calculateDistance } from './distanceCalculator';

/**
 * Calculates ACCURATE distance score based on REAL MILES
 * Uses actual distance calculation
 * (0-100, higher is better)
 */
function calculateLocationScore(loadOrigin: string, vehicleLocation: string): number {
  const distanceMiles = calculateDistance(loadOrigin, vehicleLocation);
  
  // Convert distance to score (more accurate)
  if (distanceMiles <= 30) return 100;      // Same city
  if (distanceMiles <= 50) return 98;       // Very close
  if (distanceMiles <= 100) return 92;      // Close
  if (distanceMiles <= 200) return 82;      // Nearby
  if (distanceMiles <= 350) return 70;      // Regional
  if (distanceMiles <= 500) return 58;      // Same region
  if (distanceMiles <= 750) return 45;      // Far
  if (distanceMiles <= 1000) return 32;     // Very far
  if (distanceMiles <= 1500) return 20;     // Extremely far
  if (distanceMiles <= 2500) return 12;     // Cross-continental
  return 5;                                  // Different continents
}

/**
 * Checks if two cities are known to be close to each other
 */
function checkCloseProximity(city1: string, city2: string): number {
  const proximityMap: Record<string, string[]> = {
    'dallas': ['fort worth', 'arlington'],
    'fort worth': ['dallas', 'arlington'],
    'los angeles': ['long beach', 'anaheim', 'pasadena'],
    'long beach': ['los angeles'],
    'new york': ['newark', 'jersey city'],
    'san francisco': ['oakland', 'san jose'],
    'dubai': ['abu dhabi'],
    'abu dhabi': ['dubai'],
  };
  
  const city1Lower = city1.toLowerCase();
  const city2Lower = city2.toLowerCase();
  
  if (proximityMap[city1Lower]?.some(c => city2Lower.includes(c))) {
    return 90; // Very close, within 50 miles
  }
  
  return 0;
}

/**
 * Checks if vehicle type is suitable for the load
 */
function isVehicleTypeSuitable(load: Load, vehicle: Truck): boolean {
  const weight = load.weight;
  const priority = load.priority || 'Standard';
  const equipment = load.equipment;
  
  // Equipment compatibility check
  if (vehicle.vehicleType === 'Truck') {
    // Trucks handle: Reefer, Flatbed, Dry Van, Tanker
    const truckEquipment = ['Reefer', 'Flatbed', 'Dry Van', 'Tanker'];
    if (!truckEquipment.includes(equipment)) {
      return false; // Truck can't handle Container, Bulk, Palletized
    }
  }
  
  if (vehicle.vehicleType === 'Plane') {
    // Planes handle: Palletized, Container
    const planeEquipment = ['Palletized', 'Container'];
    if (!planeEquipment.includes(equipment)) {
      return false;
    }
  }
  
  if (vehicle.vehicleType === 'Ship') {
    // Ships handle: Container, Bulk
    const shipEquipment = ['Container', 'Bulk'];
    if (!shipEquipment.includes(equipment)) {
      return false;
    }
  }
  
  // Weight capacity check
  if (vehicle.capacity && weight > vehicle.capacity) {
    return false; // Vehicle can't handle this weight
  }
  
  return true;
}

/**
 * Calculates ACCURATE composite relevance score for a vehicle-load pair
 * Focus: Vehicle must be at ORIGIN to pick up the load!
 */
function calculateRelevanceScore(load: Load, vehicle: Truck): number {
  // Equipment match - MUST match for good score
  const equipmentMatch = load.equipment === vehicle.equipment ? 100 : 0;
  
  // Location score - proximity to ORIGIN (0-100)
  const locationScore = calculateLocationScore(load.origin, vehicle.location);
  
  // Vehicle type suitability based on load characteristics
  const priority = load.priority || 'Standard';
  const weight = load.weight;
  let vehicleTypeScore = 0;
  
  // Determine if route is international
  const isInternational = checkIfInternational(load.origin, load.destination);
  
  if (vehicle.vehicleType === 'Truck') {
    // Trucks: Best for domestic/regional, weight < 50k lbs
    if (isInternational) {
      vehicleTypeScore = 10; // Trucks don't cross oceans!
    } else if (weight < 45000 && locationScore > 60) {
      vehicleTypeScore = 95; // Perfect for regional truck
    } else if (weight < 50000 && locationScore > 40) {
      vehicleTypeScore = 75; // Good truck match
    } else {
      vehicleTypeScore = 40; // Marginal truck match
    }
  } else if (vehicle.vehicleType === 'Plane') {
    // Planes: Best for urgent/express, international, any weight under capacity
    if (priority === 'Urgent') {
      vehicleTypeScore = 95;
    } else if (priority === 'Express' || isInternational) {
      vehicleTypeScore = 85;
    } else {
      vehicleTypeScore = 50; // Expensive for standard domestic
    }
  } else if (vehicle.vehicleType === 'Ship') {
    // Ships: Best for heavy international, cost-effective
    if (!isInternational) {
      vehicleTypeScore = 10; // Ships need ocean routes!
    } else if (weight > 100000) {
      vehicleTypeScore = 95; // Perfect for heavy cargo
    } else if (weight > 70000 && priority === 'Standard') {
      vehicleTypeScore = 85; // Good for standard heavy
    } else {
      vehicleTypeScore = 60; // Acceptable but slower
    }
  }
  
  // Capacity match - vehicle should handle the weight comfortably
  const capacityScore = vehicle.capacity 
    ? Math.min(100, Math.max(0, ((vehicle.capacity - weight) / vehicle.capacity) * 100))
    : 60;
  
  // ACCURATE weighted composite score
  // Location is MOST important (50%), then equipment (30%), then type (15%), capacity (5%)
  const compositeScore = 
    (locationScore * 0.50) +
    (equipmentMatch * 0.30) +
    (vehicleTypeScore * 0.15) +
    (capacityScore * 0.05);
  
  return Math.round(compositeScore);
}

/**
 * Checks if route is international (crosses major bodies of water)
 */
function checkIfInternational(origin: string, destination: string): boolean {
  const originLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();
  
  const continentMap: Record<string, string> = {
    'usa': 'north_america',
    'canada': 'north_america',
    'mexico': 'north_america',
    'uk': 'europe',
    'france': 'europe',
    'germany': 'europe',
    'spain': 'europe',
    'italy': 'europe',
    'china': 'asia',
    'japan': 'asia',
    'korea': 'asia',
    'india': 'asia',
    'dubai': 'middle_east',
    'uae': 'middle_east',
    'brazil': 'south_america',
    'argentina': 'south_america',
  };
  
  let originContinent = 'unknown';
  let destContinent = 'unknown';
  
  for (const [country, continent] of Object.entries(continentMap)) {
    if (originLower.includes(country)) originContinent = continent;
    if (destLower.includes(country)) destContinent = continent;
  }
  
  // Different continents = international
  return originContinent !== destContinent && originContinent !== 'unknown' && destContinent !== 'unknown';
}

/**
 * Filters and ranks vehicles for a specific load
 * Returns top N most relevant vehicles
 */
export function filterVehiclesForLoad(
  load: Load,
  allVehicles: Truck[],
  topN: number = 15
): Truck[] {
  // Step 1: Filter out completely unsuitable vehicles
  const suitableVehicles = allVehicles.filter(vehicle => 
    isVehicleTypeSuitable(load, vehicle)
  );
  
  // Step 2: Calculate relevance scores
  const scoredVehicles = suitableVehicles.map(vehicle => ({
    vehicle,
    score: calculateRelevanceScore(load, vehicle)
  }));
  
  // Step 3: Sort by score (highest first)
  scoredVehicles.sort((a, b) => b.score - a.score);
  
  // Step 4: Return top N vehicles
  return scoredVehicles.slice(0, topN).map(sv => sv.vehicle);
}

/**
 * Filters vehicles for multiple loads
 * Ensures each load gets its top matches
 */
export function filterVehiclesForLoads(
  loads: Load[],
  allVehicles: Truck[],
  vehiclesPerLoad: number = 15
): Truck[] {
  const uniqueVehicles = new Set<Truck>();
  
  // Get top vehicles for each load
  loads.forEach(load => {
    const topVehicles = filterVehiclesForLoad(load, allVehicles, vehiclesPerLoad);
    topVehicles.forEach(v => uniqueVehicles.add(v));
  });
  
  // Convert to array
  return Array.from(uniqueVehicles);
}

