/**
 * Extended mock data with trucks, planes, and ships
 * Now includes 200+ vehicles from around the world!
 */

import { Load, Truck } from '@/types/loadMatching';
import { globalVehicles } from './globalVehicles';

const baseLoads: Load[] = [
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

const additionalLoads: Load[] = [
  {
    id: 'L9',
    origin: 'Paris, France',
    destination: 'Berlin, Germany',
    equipment: 'Container',
    weight: 68000,
    pickupDate: '2025-11-09',
    priority: 'Standard'
  },
  {
    id: 'L10',
    origin: 'London, UK',
    destination: 'Madrid, Spain',
    equipment: 'Reefer',
    weight: 52000,
    pickupDate: '2025-11-11',
    priority: 'Express'
  },
  {
    id: 'L11',
    origin: 'Toronto, Canada',
    destination: 'Vancouver, Canada',
    equipment: 'Dry Van',
    weight: 36000,
    pickupDate: '2025-11-06',
    priority: 'Standard'
  },
  {
    id: 'L12',
    origin: 'Montreal, Canada',
    destination: 'Miami, FL',
    equipment: 'Reefer',
    weight: 41000,
    pickupDate: '2025-11-07',
    priority: 'Express'
  },
  {
    id: 'L13',
    origin: 'Mexico City, Mexico',
    destination: 'Guadalajara, Mexico',
    equipment: 'Bulk',
    weight: 58000,
    pickupDate: '2025-11-05',
    priority: 'Standard'
  },
  {
    id: 'L14',
    origin: 'Bogota, Colombia',
    destination: 'Lima, Peru',
    equipment: 'Dry Van',
    weight: 34000,
    pickupDate: '2025-11-12',
    priority: 'Standard'
  },
  {
    id: 'L15',
    origin: 'Buenos Aires, Argentina',
    destination: 'Santiago, Chile',
    equipment: 'Reefer',
    weight: 37000,
    pickupDate: '2025-11-08',
    priority: 'Express'
  },
  {
    id: 'L16',
    origin: 'São Paulo, Brazil',
    destination: 'Rio de Janeiro, Brazil',
    equipment: 'Dry Van',
    weight: 32000,
    pickupDate: '2025-11-06',
    priority: 'Standard'
  },
  {
    id: 'L17',
    origin: 'Madrid, Spain',
    destination: 'Lisbon, Portugal',
    equipment: 'Dry Van',
    weight: 30000,
    pickupDate: '2025-11-09',
    priority: 'Standard'
  },
  {
    id: 'L18',
    origin: 'Berlin, Germany',
    destination: 'Warsaw, Poland',
    equipment: 'Container',
    weight: 62000,
    pickupDate: '2025-11-10',
    priority: 'Standard'
  },
  {
    id: 'L19',
    origin: 'Rome, Italy',
    destination: 'Athens, Greece',
    equipment: 'Reefer',
    weight: 33000,
    pickupDate: '2025-11-12',
    priority: 'Standard'
  },
  {
    id: 'L20',
    origin: 'Istanbul, Turkey',
    destination: 'Dubai, UAE',
    equipment: 'Container',
    weight: 78000,
    pickupDate: '2025-11-07',
    priority: 'Urgent',
    specialRequirements: 'High-value electronics, secure handling'
  },
  {
    id: 'L21',
    origin: 'Dubai, UAE',
    destination: 'Mumbai, India',
    equipment: 'Container',
    weight: 54000,
    pickupDate: '2025-11-08',
    priority: 'Express'
  },
  {
    id: 'L22',
    origin: 'Delhi, India',
    destination: 'Chennai, India',
    equipment: 'Dry Van',
    weight: 29000,
    pickupDate: '2025-11-09',
    priority: 'Standard'
  },
  {
    id: 'L23',
    origin: 'Shanghai, China',
    destination: 'Hong Kong, China',
    equipment: 'Container',
    weight: 83000,
    pickupDate: '2025-11-10',
    priority: 'Express',
    specialRequirements: 'Time-sensitive electronics'
  },
  {
    id: 'L24',
    origin: 'Shenzhen, China',
    destination: 'Singapore',
    equipment: 'Container',
    weight: 90000,
    pickupDate: '2025-11-11',
    priority: 'Express'
  },
  {
    id: 'L25',
    origin: 'Bangkok, Thailand',
    destination: 'Ho Chi Minh City, Vietnam',
    equipment: 'Dry Van',
    weight: 27000,
    pickupDate: '2025-11-07',
    priority: 'Standard'
  },
  {
    id: 'L26',
    origin: 'Tokyo, Japan',
    destination: 'Seoul, South Korea',
    equipment: 'Palletized',
    weight: 25000,
    pickupDate: '2025-11-08',
    priority: 'Express'
  },
  {
    id: 'L27',
    origin: 'Sydney, Australia',
    destination: 'Melbourne, Australia',
    equipment: 'Dry Van',
    weight: 28000,
    pickupDate: '2025-11-06',
    priority: 'Standard'
  },
  {
    id: 'L28',
    origin: 'Johannesburg, South Africa',
    destination: 'Cape Town, South Africa',
    equipment: 'Reefer',
    weight: 35000,
    pickupDate: '2025-11-09',
    priority: 'Standard'
  }
];

export const extendedMockLoads: Load[] = [...baseLoads, ...additionalLoads];

/**
 * Expanded vehicles including trucks, planes, and ships
 */
const baseVehicles: Truck[] = [
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
  }
];

type VehicleSeed = {
  location: string;
  equipment: Load['equipment'];
  capacity: number;
  availableDate?: string;
  notes?: string;
};

const additionalTruckSeed: VehicleSeed[] = [
  // United States - East & Midwest
  { location: 'Raleigh, NC', equipment: 'Dry Van', capacity: 41000 },
  { location: 'Birmingham, AL', equipment: 'Reefer', capacity: 43000 },
  { location: 'Cincinnati, OH', equipment: 'Flatbed', capacity: 47000 },
  { location: 'Louisville, KY', equipment: 'Dry Van', capacity: 42000 },
  { location: 'Greensboro, NC', equipment: 'Reefer', capacity: 44000 },
  { location: 'Cleveland, OH', equipment: 'Dry Van', capacity: 41000 },
  { location: 'Pittsburgh, PA', equipment: 'Flatbed', capacity: 46000 },
  { location: 'Buffalo, NY', equipment: 'Reefer', capacity: 43000 },
  { location: 'Hartford, CT', equipment: 'Dry Van', capacity: 40000 },
  { location: 'Newark, NJ', equipment: 'Reefer', capacity: 44000, notes: 'Port drayage ready' },
  { location: 'Richmond, VA', equipment: 'Dry Van', capacity: 42000 },
  { location: 'Norfolk, VA', equipment: 'Container', capacity: 52000, notes: 'Port-side chassis' },
  { location: 'Charleston, WV', equipment: 'Dry Van', capacity: 39000 },
  { location: 'Des Moines, IA', equipment: 'Flatbed', capacity: 47000 },
  { location: 'Omaha, NE', equipment: 'Dry Van', capacity: 43000 },
  { location: 'Fargo, ND', equipment: 'Reefer', capacity: 42000 },
  { location: 'Sioux Falls, SD', equipment: 'Dry Van', capacity: 41000 },
  { location: 'Wichita, KS', equipment: 'Flatbed', capacity: 48000 },
  { location: 'Tulsa, OK', equipment: 'Dry Van', capacity: 42000 },
  { location: 'Little Rock, AR', equipment: 'Reefer', capacity: 43000 },
  { location: 'Baton Rouge, LA', equipment: 'Tanker', capacity: 58000, notes: 'Chemical certified' },
  { location: 'Mobile, AL', equipment: 'Flatbed', capacity: 47000 },
  { location: 'Savannah, GA', equipment: 'Dry Van', capacity: 42000 },
  { location: 'Orlando, FL', equipment: 'Reefer', capacity: 44000 },
  { location: 'Tampa, FL', equipment: 'Dry Van', capacity: 41000 },
  { location: 'Knoxville, TN', equipment: 'Flatbed', capacity: 45000 },
  { location: 'Columbia, SC', equipment: 'Dry Van', capacity: 40500 },
  { location: 'Greenville, SC', equipment: 'Reefer', capacity: 43000 },

  // United States - Central & West
  { location: 'Albuquerque, NM', equipment: 'Dry Van', capacity: 40000 },
  { location: 'El Paso, TX', equipment: 'Flatbed', capacity: 47000 },
  { location: 'Lubbock, TX', equipment: 'Dry Van', capacity: 42000 },
  { location: 'Amarillo, TX', equipment: 'Reefer', capacity: 43000 },
  { location: 'Boise, ID', equipment: 'Flatbed', capacity: 46000 },
  { location: 'Spokane, WA', equipment: 'Dry Van', capacity: 42000 },
  { location: 'Reno, NV', equipment: 'Dry Van', capacity: 41000 },
  { location: 'Bakersfield, CA', equipment: 'Reefer', capacity: 44000 },
  { location: 'Fresno, CA', equipment: 'Flatbed', capacity: 46000 },
  { location: 'Stockton, CA', equipment: 'Dry Van', capacity: 43000 },
  { location: 'Sacramento, CA', equipment: 'Reefer', capacity: 44000 },
  { location: 'San Bernardino, CA', equipment: 'Dry Van', capacity: 42000 },
  { location: 'Ogden, UT', equipment: 'Flatbed', capacity: 46000 },
  { location: 'Billings, MT', equipment: 'Flatbed', capacity: 45000 },
  { location: 'Anchorage, AK', equipment: 'Reefer', capacity: 38000, notes: 'Ice road rated' },
  { location: 'Honolulu, HI', equipment: 'Reefer', capacity: 36000, notes: 'Inter-island service' },

  // Canada
  { location: 'Winnipeg, MB, Canada', equipment: 'Flatbed', capacity: 46000 },
  { location: 'Regina, SK, Canada', equipment: 'Dry Van', capacity: 42000 },

  // Europe
  { location: 'Glasgow, UK', equipment: 'Dry Van', capacity: 40000 },
  { location: 'Manchester, UK', equipment: 'Reefer', capacity: 42000 },
  { location: 'Marseille, France', equipment: 'Dry Van', capacity: 41000 },
  { location: 'Lyon, France', equipment: 'Reefer', capacity: 43000 },
  { location: 'Hamburg, Germany', equipment: 'Container', capacity: 44000, notes: 'Port logistics' },
  { location: 'Cologne, Germany', equipment: 'Dry Van', capacity: 42000 },
  { location: 'Stuttgart, Germany', equipment: 'Flatbed', capacity: 46000 },
  { location: 'Antwerp, Belgium', equipment: 'Container', capacity: 44000, notes: 'Gateway port' },
  { location: 'Rotterdam, Netherlands', equipment: 'Container', capacity: 45000, notes: 'Delta Works certified' },
  { location: 'Basel, Switzerland', equipment: 'Reefer', capacity: 42000 },
  { location: 'Turin, Italy', equipment: 'Dry Van', capacity: 41000 },
  { location: 'Valencia, Spain', equipment: 'Reefer', capacity: 43000 },
  { location: 'Bilbao, Spain', equipment: 'Flatbed', capacity: 44000 },
  { location: 'Porto, Portugal', equipment: 'Dry Van', capacity: 40000 }
];

const additionalPlaneSeed: VehicleSeed[] = [
  { location: 'LHR, London, UK', equipment: 'Container', capacity: 150000, notes: 'Transatlantic freighter' },
  { location: 'FRA, Frankfurt, Germany', equipment: 'Palletized', capacity: 145000 },
  { location: 'DXB, Dubai, UAE', equipment: 'Container', capacity: 170000, notes: 'Middle East express' },
  { location: 'SIN, Singapore', equipment: 'Palletized', capacity: 160000 },
  { location: 'HKG, Hong Kong', equipment: 'Palletized', capacity: 155000 },
  { location: 'PVG, Shanghai, China', equipment: 'Container', capacity: 165000 },
  { location: 'ICN, Seoul, South Korea', equipment: 'Palletized', capacity: 150000 },
  { location: 'NRT, Tokyo, Japan', equipment: 'Palletized', capacity: 152000 },
  { location: 'SYD, Sydney, Australia', equipment: 'Container', capacity: 140000 },
  { location: 'MEL, Melbourne, Australia', equipment: 'Palletized', capacity: 138000 },
  { location: 'YYZ, Toronto, Canada', equipment: 'Container', capacity: 142000 },
  { location: 'YVR, Vancouver, Canada', equipment: 'Palletized', capacity: 139000 },
  { location: 'GRU, São Paulo, Brazil', equipment: 'Container', capacity: 148000 },
  { location: 'EZE, Buenos Aires, Argentina', equipment: 'Palletized', capacity: 136000 },
  { location: 'JNB, Johannesburg, South Africa', equipment: 'Container', capacity: 145000 },
  { location: 'CAI, Cairo, Egypt', equipment: 'Palletized', capacity: 140000 },
  { location: 'AMS, Amsterdam, Netherlands', equipment: 'Container', capacity: 149000 },
  { location: 'CDG, Paris, France', equipment: 'Palletized', capacity: 150000 },
  { location: 'MAD, Madrid, Spain', equipment: 'Container', capacity: 143000 },
  { location: 'DEL, Delhi, India', equipment: 'Palletized', capacity: 147000 }
];

const additionalShipSeed: VehicleSeed[] = [
  { location: 'Port of Rotterdam, Netherlands', equipment: 'Container', capacity: 520000, notes: 'Maasvlakte berth' },
  { location: 'Port of Antwerp, Belgium', equipment: 'Container', capacity: 500000 },
  { location: 'Port of Hamburg, Germany', equipment: 'Container', capacity: 480000 },
  { location: 'Port of Felixstowe, UK', equipment: 'Container', capacity: 450000 },
  { location: 'Port of Le Havre, France', equipment: 'Container', capacity: 430000 },
  { location: 'Port of Barcelona, Spain', equipment: 'Container', capacity: 460000 },
  { location: 'Port of Valencia, Spain', equipment: 'Container', capacity: 470000 },
  { location: 'Port of Genoa, Italy', equipment: 'Container', capacity: 420000 },
  { location: 'Port of Piraeus, Greece', equipment: 'Container', capacity: 440000 },
  { location: 'Port of Istanbul, Turkey', equipment: 'Container', capacity: 410000 },
  { location: 'Port of Dubai, UAE', equipment: 'Container', capacity: 540000 },
  { location: 'Port of Singapore', equipment: 'Container', capacity: 600000 },
  { location: 'Port of Shanghai, China', equipment: 'Container', capacity: 620000 },
  { location: 'Port of Ningbo-Zhoushan, China', equipment: 'Container', capacity: 610000 },
  { location: 'Port of Busan, South Korea', equipment: 'Container', capacity: 590000 },
  { location: 'Port of Hong Kong', equipment: 'Container', capacity: 580000 },
  { location: 'Port of Melbourne, Australia', equipment: 'Container', capacity: 470000 },
  { location: 'Port of Santos, Brazil', equipment: 'Container', capacity: 520000 },
  { location: 'Port of Cartagena, Colombia', equipment: 'Container', capacity: 430000 },
  { location: 'Port of Durban, South Africa', equipment: 'Bulk', capacity: 440000, notes: 'Dry bulk terminal' }
];

const additionalTrucks: Truck[] = additionalTruckSeed.map((seed, index) => ({
  id: `NT${index + 1}`,
  location: seed.location,
  equipment: seed.equipment,
  availableDate: seed.availableDate ?? '2025-11-08',
  vehicleType: 'Truck',
  capacity: seed.capacity,
  notes: seed.notes
}));

const additionalPlanes: Truck[] = additionalPlaneSeed.map((seed, index) => ({
  id: `NP${index + 1}`,
  location: seed.location,
  equipment: seed.equipment,
  availableDate: seed.availableDate ?? '2025-11-09',
  vehicleType: 'Plane',
  capacity: seed.capacity,
  notes: seed.notes
}));

const additionalShips: Truck[] = additionalShipSeed.map((seed, index) => ({
  id: `NS${index + 1}`,
  location: seed.location,
  equipment: seed.equipment,
  availableDate: seed.availableDate ?? '2025-11-12',
  vehicleType: 'Ship',
  capacity: seed.capacity,
  notes: seed.notes
}));

export const extendedMockVehicles: Truck[] = [
  ...baseVehicles,
  ...additionalTrucks,
  ...additionalPlanes,
  ...additionalShips,
  ...globalVehicles
];

