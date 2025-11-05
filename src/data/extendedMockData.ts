/**
 * Extended mock data with trucks, planes, and ships
 * Now includes 200+ vehicles from around the world!
 */

import { Load, Truck } from '@/types/loadMatching';
import { globalVehicles } from './globalVehicles';

/**
 * Expanded sample freight loads
 */
export const extendedMockLoads: Load[] = [
  // Original loads
  {
    id: 'L1',
    origin: 'Dallas, TX',
    destination: 'Atlanta, GA',
    equipment: 'Reefer',
    weight: 42000,
    pickupDate: '2025-11-05',
    priority: 'Standard'
  },
  {
    id: 'L2',
    origin: 'Chicago, IL',
    destination: 'Denver, CO',
    equipment: 'Flatbed',
    weight: 48000,
    pickupDate: '2025-11-06',
    priority: 'Standard'
  },
  {
    id: 'L3',
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    equipment: 'Dry Van',
    weight: 38000,
    pickupDate: '2025-11-05',
    priority: 'Express'
  },
  {
    id: 'L4',
    origin: 'Miami, FL',
    destination: 'New York, NY',
    equipment: 'Reefer',
    weight: 45000,
    pickupDate: '2025-11-07',
    priority: 'Urgent'
  },
  {
    id: 'L5',
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    equipment: 'Dry Van',
    weight: 32000,
    pickupDate: '2025-11-06',
    priority: 'Standard'
  },
  // Additional loads
  {
    id: 'L6',
    origin: 'New York, NY',
    destination: 'London, UK',
    equipment: 'Container',
    weight: 85000,
    pickupDate: '2025-11-08',
    priority: 'Express',
    specialRequirements: 'Ocean freight, temperature controlled'
  },
  {
    id: 'L7',
    origin: 'San Francisco, CA',
    destination: 'Tokyo, Japan',
    equipment: 'Palletized',
    weight: 120000,
    pickupDate: '2025-11-10',
    priority: 'Standard'
  },
  {
    id: 'L8',
    origin: 'Houston, TX',
    destination: 'Mexico City, Mexico',
    equipment: 'Bulk',
    weight: 95000,
    pickupDate: '2025-11-05',
    priority: 'Urgent'
  }
];

/**
 * Expanded vehicles including trucks, planes, and ships
 */
export const extendedMockVehicles: Truck[] = [
  // Trucks
  {
    id: 'T1',
    location: 'Fort Worth, TX',
    equipment: 'Reefer',
    availableDate: '2025-11-05',
    vehicleType: 'Truck',
    capacity: 45000
  },
  {
    id: 'T2',
    location: 'St. Louis, MO',
    equipment: 'Flatbed',
    availableDate: '2025-11-06',
    vehicleType: 'Truck',
    capacity: 50000
  },
  {
    id: 'T3',
    location: 'Las Vegas, NV',
    equipment: 'Dry Van',
    availableDate: '2025-11-05',
    vehicleType: 'Truck',
    capacity: 40000
  },
  {
    id: 'T4',
    location: 'Jacksonville, FL',
    equipment: 'Reefer',
    availableDate: '2025-11-07',
    vehicleType: 'Truck',
    capacity: 45000
  },
  {
    id: 'T5',
    location: 'Tacoma, WA',
    equipment: 'Dry Van',
    availableDate: '2025-11-06',
    vehicleType: 'Truck',
    capacity: 42000
  },
  {
    id: 'T6',
    location: 'Memphis, TN',
    equipment: 'Flatbed',
    availableDate: '2025-11-05',
    vehicleType: 'Truck',
    capacity: 48000
  },
  {
    id: 'T7',
    location: 'Phoenix, AZ',
    equipment: 'Dry Van',
    availableDate: '2025-11-06',
    vehicleType: 'Truck',
    capacity: 40000
  },
  {
    id: 'T8',
    location: 'Atlanta, GA',
    equipment: 'Reefer',
    availableDate: '2025-11-07',
    vehicleType: 'Truck',
    capacity: 45000
  },
  {
    id: 'T9',
    location: 'Chicago, IL',
    equipment: 'Tanker',
    availableDate: '2025-11-05',
    vehicleType: 'Truck',
    capacity: 60000,
    notes: 'Liquid cargo only'
  },
  {
    id: 'T10',
    location: 'Denver, CO',
    equipment: 'Flatbed',
    availableDate: '2025-11-06',
    vehicleType: 'Truck',
    capacity: 50000
  },
  
  // Cargo Planes
  {
    id: 'P1',
    location: 'LAX, Los Angeles, CA',
    equipment: 'Palletized',
    availableDate: '2025-11-08',
    vehicleType: 'Plane',
    capacity: 150000,
    notes: 'Boeing 747 Freighter'
  },
  {
    id: 'P2',
    location: 'JFK, New York, NY',
    equipment: 'Container',
    availableDate: '2025-11-08',
    vehicleType: 'Plane',
    capacity: 180000,
    notes: 'Airbus A330F'
  },
  {
    id: 'P3',
    location: 'MIA, Miami, FL',
    equipment: 'Palletized',
    availableDate: '2025-11-07',
    vehicleType: 'Plane',
    capacity: 120000,
    notes: 'Express air freight'
  },
  {
    id: 'P4',
    location: 'ORD, Chicago, IL',
    equipment: 'Container',
    availableDate: '2025-11-09',
    vehicleType: 'Plane',
    capacity: 140000,
    notes: 'MD-11F Freighter'
  },
  {
    id: 'P5',
    location: 'SFO, San Francisco, CA',
    equipment: 'Palletized',
    availableDate: '2025-11-10',
    vehicleType: 'Plane',
    capacity: 160000,
    notes: 'Wide-body cargo, transpacific routes'
  },
  
  // Cargo Ships
  {
    id: 'S1',
    location: 'Port of Los Angeles, CA',
    equipment: 'Container',
    availableDate: '2025-11-10',
    vehicleType: 'Ship',
    capacity: 500000,
    notes: 'Container vessel, 20-day transit to Asia'
  },
  {
    id: 'S2',
    location: 'Port of New York/New Jersey',
    equipment: 'Container',
    availableDate: '2025-11-08',
    vehicleType: 'Ship',
    capacity: 450000,
    notes: 'Transatlantic service to Europe'
  },
  {
    id: 'S3',
    location: 'Port of Houston, TX',
    equipment: 'Bulk',
    availableDate: '2025-11-05',
    vehicleType: 'Ship',
    capacity: 600000,
    notes: 'Bulk carrier, Latin America routes'
  },
  {
    id: 'S4',
    location: 'Port of Seattle, WA',
    equipment: 'Container',
    availableDate: '2025-11-12',
    vehicleType: 'Ship',
    capacity: 480000,
    notes: 'Pacific Northwest to Asia'
  },
  {
    id: 'S5',
    location: 'Port of Miami, FL',
    equipment: 'Container',
    availableDate: '2025-11-09',
    vehicleType: 'Ship',
    capacity: 350000,
    notes: 'Caribbean and South America service'
  },
  
  // Additional Trucks
  {
    id: 'T11',
    location: 'Boston, MA',
    equipment: 'Reefer',
    availableDate: '2025-11-06',
    vehicleType: 'Truck',
    capacity: 44000,
    notes: 'Temperature controlled, Northeast corridors'
  },
  {
    id: 'T12',
    location: 'Portland, OR',
    equipment: 'Dry Van',
    availableDate: '2025-11-08',
    vehicleType: 'Truck',
    capacity: 42000,
    notes: 'Pacific Northwest routes'
  },
  {
    id: 'T13',
    location: 'Salt Lake City, UT',
    equipment: 'Flatbed',
    availableDate: '2025-11-07',
    vehicleType: 'Truck',
    capacity: 48000,
    notes: 'Mountain state specialist'
  },
  {
    id: 'T14',
    location: 'Nashville, TN',
    equipment: 'Dry Van',
    availableDate: '2025-11-05',
    vehicleType: 'Truck',
    capacity: 40000,
    notes: 'Southeast regional'
  },
  {
    id: 'T15',
    location: 'Kansas City, MO',
    equipment: 'Reefer',
    availableDate: '2025-11-06',
    vehicleType: 'Truck',
    capacity: 45000,
    notes: 'Midwest distribution hub'
  },
  
  // Additional Cargo Planes
  {
    id: 'P6',
    location: 'DFW, Dallas, TX',
    equipment: 'Palletized',
    availableDate: '2025-11-09',
    vehicleType: 'Plane',
    capacity: 135000,
    notes: 'Boeing 767F, Central US hub'
  },
  {
    id: 'P7',
    location: 'ATL, Atlanta, GA',
    equipment: 'Container',
    availableDate: '2025-11-10',
    vehicleType: 'Plane',
    capacity: 155000,
    notes: 'Airbus A330F, Major international hub'
  },
  
  // Additional Cargo Ships
  {
    id: 'S6',
    location: 'Port of Savannah, GA',
    equipment: 'Container',
    availableDate: '2025-11-11',
    vehicleType: 'Ship',
    capacity: 420000,
    notes: 'East Coast to Europe, Mediterranean routes'
  },
  {
    id: 'S7',
    location: 'Port of Long Beach, CA',
    equipment: 'Container',
    availableDate: '2025-11-12',
    vehicleType: 'Ship',
    capacity: 550000,
    notes: 'Transpacific service, largest capacity'
  },
  {
    id: 'S8',
    location: 'Port of Charleston, SC',
    equipment: 'Bulk',
    availableDate: '2025-11-08',
    vehicleType: 'Ship',
    capacity: 380000,
    notes: 'Bulk carrier, agricultural exports'
  },
  
  // Add 200+ global vehicles from around the world
  ...globalVehicles
];

