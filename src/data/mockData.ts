/**
 * Mock data for LoadMatch AI demo
 * 
 * Realistic logistics data for testing the matching system
 */

import { Load, Truck } from '@/types/loadMatching';

/**
 * Sample freight loads across various US routes
 */
export const mockLoads: Load[] = [
  {
    id: 'L1',
    origin: 'Dallas, TX',
    destination: 'Atlanta, GA',
    equipment: 'Reefer',
    weight: 42000,
    pickupDate: '2025-11-05'
  },
  {
    id: 'L2',
    origin: 'Chicago, IL',
    destination: 'Denver, CO',
    equipment: 'Flatbed',
    weight: 48000,
    pickupDate: '2025-11-06'
  },
  {
    id: 'L3',
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    equipment: 'Dry Van',
    weight: 38000,
    pickupDate: '2025-11-05'
  },
  {
    id: 'L4',
    origin: 'Miami, FL',
    destination: 'New York, NY',
    equipment: 'Reefer',
    weight: 45000,
    pickupDate: '2025-11-07'
  },
  {
    id: 'L5',
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    equipment: 'Dry Van',
    weight: 32000,
    pickupDate: '2025-11-06'
  }
];

/**
 * Sample available trucks with various locations and equipment
 */
export const mockTrucks: Truck[] = [
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
  }
];

