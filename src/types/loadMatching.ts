/**
 * Type definitions for AI Load Matching
 */

export type EquipmentType = 'Reefer' | 'Flatbed' | 'Dry Van' | 'Tanker' | 'Container' | 'Bulk' | 'Palletized';
export type VehicleType = 'Truck' | 'Plane' | 'Ship';

export interface Load {
  id: string;
  origin: string;
  destination: string;
  equipment: EquipmentType;
  weight: number;
  pickupDate: string;
  priority?: 'Standard' | 'Express' | 'Urgent';
  specialRequirements?: string;
}

export interface Vehicle {
  id: string;
  location: string;
  equipment: EquipmentType;
  availableDate: string;
  vehicleType: VehicleType;
  capacity?: number;
  notes?: string;
}

// Alias for compatibility
export type Truck = Vehicle;

export interface Match {
  loadId: string;
  truckId: string;
  matchScore: number;
  reason: string;
}

export interface MatchApiResponse {
  matches: Match[];
  metadata?: {
    loadsCount: number;
    trucksCount: number;
    matchesCount: number;
    processingTime: string;
    timestamp: string;
  };
}

