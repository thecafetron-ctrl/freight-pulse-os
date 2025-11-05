/**
 * Type definitions for LoadMatch AI system
 */

/**
 * Equipment types for loads
 */
export type EquipmentType = 'Reefer' | 'Flatbed' | 'Dry Van' | 'Tanker' | 'Container' | 'Bulk' | 'Palletized';

/**
 * Vehicle types for transportation
 */
export type VehicleType = 'Truck' | 'Plane' | 'Ship';

/**
 * Represents a freight load that needs to be transported
 */
export interface Load {
  id: string;
  origin: string;
  destination: string;
  equipment: EquipmentType;
  weight: number; // in pounds
  pickupDate: string; // ISO date string
  priority?: 'Standard' | 'Express' | 'Urgent';
  specialRequirements?: string;
}

/**
 * Represents an available vehicle (truck/plane/ship)
 */
export interface Truck {
  id: string;
  location: string;
  equipment: EquipmentType;
  availableDate: string; // ISO date string
  vehicleType: VehicleType;
  capacity?: number; // max weight capacity
  notes?: string;
}

/**
 * Request body for the match endpoint
 */
export interface MatchRequest {
  loads: Load[];
  trucks: Truck[];
}

/**
 * Represents a single match between a load and truck
 */
export interface Match {
  loadId: string;
  truckId: string;
  matchScore: number; // 0-100
  reason: string;
}

/**
 * Response from the match endpoint
 */
export type MatchResponse = Match[];

