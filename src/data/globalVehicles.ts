/**
 * Global Vehicle Fleet - 200+ vehicles from around the world
 */

import { Truck } from '@/types/loadMatching';

export const globalVehicles: Truck[] = [
  // ==================== NORTH AMERICA - TRUCKS ====================
  
  // United States - Major Cities
  { id: 'T16', location: 'New York, NY', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T17', location: 'Los Angeles, CA', equipment: 'Reefer', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T18', location: 'Chicago, IL', equipment: 'Flatbed', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 48000 },
  { id: 'T19', location: 'Houston, TX', equipment: 'Tanker', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 55000 },
  { id: 'T20', location: 'Philadelphia, PA', equipment: 'Dry Van', availableDate: '2025-11-05', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T21', location: 'San Antonio, TX', equipment: 'Reefer', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T22', location: 'San Diego, CA', equipment: 'Flatbed', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 47000 },
  { id: 'T23', location: 'San Jose, CA', equipment: 'Dry Van', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T24', location: 'Austin, TX', equipment: 'Reefer', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T25', location: 'Jacksonville, FL', equipment: 'Dry Van', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T26', location: 'Columbus, OH', equipment: 'Flatbed', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 46000 },
  { id: 'T27', location: 'Charlotte, NC', equipment: 'Reefer', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T28', location: 'Indianapolis, IN', equipment: 'Dry Van', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T29', location: 'Seattle, WA', equipment: 'Reefer', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 45000 },
  { id: 'T30', location: 'Denver, CO', equipment: 'Flatbed', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 48000 },
  
  // Canada
  { id: 'T31', location: 'Toronto, ON, Canada', equipment: 'Reefer', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T32', location: 'Vancouver, BC, Canada', equipment: 'Dry Van', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T33', location: 'Montreal, QC, Canada', equipment: 'Reefer', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T34', location: 'Calgary, AB, Canada', equipment: 'Flatbed', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 47000 },
  { id: 'T35', location: 'Ottawa, ON, Canada', equipment: 'Dry Van', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 41000 },
  
  // Mexico
  { id: 'T36', location: 'Mexico City, Mexico', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T37', location: 'Guadalajara, Mexico', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T38', location: 'Monterrey, Mexico', equipment: 'Flatbed', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 45000 },
  { id: 'T39', location: 'Tijuana, Mexico', equipment: 'Dry Van', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 41000 },
  
  // ==================== EUROPE - TRUCKS ====================
  
  { id: 'T40', location: 'London, UK', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T41', location: 'Paris, France', equipment: 'Reefer', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T42', location: 'Berlin, Germany', equipment: 'Flatbed', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 46000 },
  { id: 'T43', location: 'Madrid, Spain', equipment: 'Dry Van', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T44', location: 'Rome, Italy', equipment: 'Reefer', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T45', location: 'Amsterdam, Netherlands', equipment: 'Dry Van', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T46', location: 'Brussels, Belgium', equipment: 'Flatbed', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 45000 },
  { id: 'T47', location: 'Vienna, Austria', equipment: 'Reefer', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T48', location: 'Warsaw, Poland', equipment: 'Dry Van', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T49', location: 'Budapest, Hungary', equipment: 'Flatbed', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T50', location: 'Prague, Czech Republic', equipment: 'Dry Van', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T51', location: 'Stockholm, Sweden', equipment: 'Reefer', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T52', location: 'Copenhagen, Denmark', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T53', location: 'Oslo, Norway', equipment: 'Flatbed', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 45000 },
  { id: 'T54', location: 'Helsinki, Finland', equipment: 'Reefer', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T55', location: 'Lisbon, Portugal', equipment: 'Dry Van', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T56', location: 'Athens, Greece', equipment: 'Reefer', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T57', location: 'Dublin, Ireland', equipment: 'Dry Van', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T58', location: 'Zurich, Switzerland', equipment: 'Flatbed', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 46000 },
  { id: 'T59', location: 'Munich, Germany', equipment: 'Reefer', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T60', location: 'Barcelona, Spain', equipment: 'Dry Van', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 41000 },
  
  // ==================== ASIA - TRUCKS ====================
  
  { id: 'T61', location: 'Tokyo, Japan', equipment: 'Reefer', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T62', location: 'Shanghai, China', equipment: 'Dry Van', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T63', location: 'Beijing, China', equipment: 'Flatbed', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 45000 },
  { id: 'T64', location: 'Seoul, South Korea', equipment: 'Reefer', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T65', location: 'Mumbai, India', equipment: 'Dry Van', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T66', location: 'Delhi, India', equipment: 'Flatbed', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T67', location: 'Bangkok, Thailand', equipment: 'Reefer', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T68', location: 'Singapore', equipment: 'Dry Van', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T69', location: 'Kuala Lumpur, Malaysia', equipment: 'Reefer', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T70', location: 'Jakarta, Indonesia', equipment: 'Dry Van', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T71', location: 'Manila, Philippines', equipment: 'Flatbed', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T72', location: 'Ho Chi Minh City, Vietnam', equipment: 'Reefer', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T73', location: 'Hong Kong', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T74', location: 'Taipei, Taiwan', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T75', location: 'Guangzhou, China', equipment: 'Flatbed', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T76', location: 'Shenzhen, China', equipment: 'Dry Van', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T77', location: 'Osaka, Japan', equipment: 'Reefer', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T78', location: 'Bangalore, India', equipment: 'Dry Van', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T79', location: 'Kolkata, India', equipment: 'Flatbed', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T80', location: 'Chennai, India', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 41000 },
  
  // ==================== MIDDLE EAST - TRUCKS ====================
  
  { id: 'T81', location: 'Dubai, UAE', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T82', location: 'Abu Dhabi, UAE', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T83', location: 'Riyadh, Saudi Arabia', equipment: 'Flatbed', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 45000 },
  { id: 'T84', location: 'Jeddah, Saudi Arabia', equipment: 'Dry Van', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T85', location: 'Tel Aviv, Israel', equipment: 'Reefer', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T86', location: 'Doha, Qatar', equipment: 'Dry Van', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T87', location: 'Kuwait City, Kuwait', equipment: 'Flatbed', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T88', location: 'Istanbul, Turkey', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T89', location: 'Ankara, Turkey', equipment: 'Dry Van', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 41000 },
  
  // ==================== SOUTH AMERICA - TRUCKS ====================
  
  { id: 'T90', location: 'São Paulo, Brazil', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T91', location: 'Rio de Janeiro, Brazil', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T92', location: 'Buenos Aires, Argentina', equipment: 'Flatbed', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 45000 },
  { id: 'T93', location: 'Santiago, Chile', equipment: 'Dry Van', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T94', location: 'Lima, Peru', equipment: 'Reefer', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T95', location: 'Bogotá, Colombia', equipment: 'Dry Van', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T96', location: 'Caracas, Venezuela', equipment: 'Flatbed', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T97', location: 'Quito, Ecuador', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T98', location: 'Montevideo, Uruguay', equipment: 'Dry Van', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 40000 },
  
  // ==================== AFRICA - TRUCKS ====================
  
  { id: 'T99', location: 'Cairo, Egypt', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T100', location: 'Lagos, Nigeria', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T101', location: 'Johannesburg, South Africa', equipment: 'Flatbed', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T102', location: 'Cape Town, South Africa', equipment: 'Dry Van', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T103', location: 'Nairobi, Kenya', equipment: 'Reefer', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 40000 },
  { id: 'T104', location: 'Casablanca, Morocco', equipment: 'Dry Van', availableDate: '2025-11-11', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T105', location: 'Accra, Ghana', equipment: 'Flatbed', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  
  // ==================== AUSTRALIA & OCEANIA - TRUCKS ====================
  
  { id: 'T106', location: 'Sydney, Australia', equipment: 'Dry Van', availableDate: '2025-11-08', vehicleType: 'Truck', capacity: 42000 },
  { id: 'T107', location: 'Melbourne, Australia', equipment: 'Reefer', availableDate: '2025-11-10', vehicleType: 'Truck', capacity: 43000 },
  { id: 'T108', location: 'Brisbane, Australia', equipment: 'Flatbed', availableDate: '2025-11-06', vehicleType: 'Truck', capacity: 44000 },
  { id: 'T109', location: 'Perth, Australia', equipment: 'Dry Van', availableDate: '2025-11-09', vehicleType: 'Truck', capacity: 41000 },
  { id: 'T110', location: 'Auckland, New Zealand', equipment: 'Reefer', availableDate: '2025-11-07', vehicleType: 'Truck', capacity: 42000 },
  
  // ==================== CARGO PLANES ====================
  
  // North America
  { id: 'P8', location: 'BOS, Boston, MA', equipment: 'Palletized', availableDate: '2025-11-11', vehicleType: 'Plane', capacity: 140000, notes: 'Boeing 757F, East Coast hub' },
  { id: 'P9', location: 'DEN, Denver, CO', equipment: 'Container', availableDate: '2025-11-08', vehicleType: 'Plane', capacity: 145000, notes: 'Central US distribution' },
  { id: 'P10', location: 'SEA, Seattle, WA', equipment: 'Palletized', availableDate: '2025-11-09', vehicleType: 'Plane', capacity: 160000, notes: 'Boeing 777F, Pacific routes' },
  { id: 'P11', location: 'PHX, Phoenix, AZ', equipment: 'Container', availableDate: '2025-11-10', vehicleType: 'Plane', capacity: 130000, notes: 'Southwest regional' },
  { id: 'P12', location: 'IAH, Houston, TX', equipment: 'Palletized', availableDate: '2025-11-06', vehicleType: 'Plane', capacity: 150000, notes: 'Latin America gateway' },
  { id: 'P13', location: 'YYZ, Toronto, Canada', equipment: 'Container', availableDate: '2025-11-11', vehicleType: 'Plane', capacity: 145000, notes: 'Canadian hub, North American routes' },
  { id: 'P14', location: 'YVR, Vancouver, Canada', equipment: 'Palletized', availableDate: '2025-11-08', vehicleType: 'Plane', capacity: 155000, notes: 'Transpacific gateway' },
  { id: 'P15', location: 'MEX, Mexico City', equipment: 'Container', availableDate: '2025-11-09', vehicleType: 'Plane', capacity: 135000, notes: 'Latin America hub' },
  
  // Europe
  { id: 'P16', location: 'LHR, London, UK', equipment: 'Container', availableDate: '2025-11-10', vehicleType: 'Plane', capacity: 180000, notes: 'Airbus A380F, Major intl hub' },
  { id: 'P17', location: 'CDG, Paris, France', equipment: 'Palletized', availableDate: '2025-11-07', vehicleType: 'Plane', capacity: 170000, notes: 'European distribution center' },
  { id: 'P18', location: 'FRA, Frankfurt, Germany', equipment: 'Container', availableDate: '2025-11-11', vehicleType: 'Plane', capacity: 175000, notes: 'Central European hub' },
  { id: 'P19', location: 'AMS, Amsterdam, Netherlands', equipment: 'Palletized', availableDate: '2025-11-08', vehicleType: 'Plane', capacity: 165000, notes: 'European cargo leader' },
  { id: 'P20', location: 'MAD, Madrid, Spain', equipment: 'Container', availableDate: '2025-11-09', vehicleType: 'Plane', capacity: 150000, notes: 'Iberian Peninsula hub' },
  { id: 'P21', location: 'FCO, Rome, Italy', equipment: 'Palletized', availableDate: '2025-11-10', vehicleType: 'Plane', capacity: 145000, notes: 'Mediterranean routes' },
  { id: 'P22', location: 'ARN, Stockholm, Sweden', equipment: 'Container', availableDate: '2025-11-06', vehicleType: 'Plane', capacity: 140000, notes: 'Nordic gateway' },
  { id: 'P23', location: 'ZRH, Zurich, Switzerland', equipment: 'Palletized', availableDate: '2025-11-11', vehicleType: 'Plane', capacity: 155000, notes: 'Alpine logistics hub' },
  
  // Asia
  { id: 'P24', location: 'NRT, Tokyo, Japan', equipment: 'Container', availableDate: '2025-11-08', vehicleType: 'Plane', capacity: 185000, notes: 'Boeing 747-8F, Asia-Pacific leader' },
  { id: 'P25', location: 'PVG, Shanghai, China', equipment: 'Palletized', availableDate: '2025-11-09', vehicleType: 'Plane', capacity: 190000, notes: 'Major Chinese hub' },
  { id: 'P26', location: 'PEK, Beijing, China', equipment: 'Container', availableDate: '2025-11-10', vehicleType: 'Plane', capacity: 180000, notes: 'Northern China gateway' },
  { id: 'P27', location: 'ICN, Seoul, South Korea', equipment: 'Palletized', availableDate: '2025-11-07', vehicleType: 'Plane', capacity: 175000, notes: 'Korean cargo leader' },
  { id: 'P28', location: 'SIN, Singapore', equipment: 'Container', availableDate: '2025-11-11', vehicleType: 'Plane', capacity: 170000, notes: 'Southeast Asian hub' },
  { id: 'P29', location: 'HKG, Hong Kong', equipment: 'Palletized', availableDate: '2025-11-08', vehicleType: 'Plane', capacity: 180000, notes: 'Major Asian cargo center' },
  { id: 'P30', location: 'BKK, Bangkok, Thailand', equipment: 'Container', availableDate: '2025-11-09', vehicleType: 'Plane', capacity: 155000, notes: 'Southeast Asia distribution' },
  { id: 'P31', location: 'KUL, Kuala Lumpur, Malaysia', equipment: 'Palletized', availableDate: '2025-11-10', vehicleType: 'Plane', capacity: 150000, notes: 'Malaysian hub' },
  { id: 'P32', location: 'BOM, Mumbai, India', equipment: 'Container', availableDate: '2025-11-06', vehicleType: 'Plane', capacity: 160000, notes: 'Indian gateway' },
  { id: 'P33', location: 'DEL, Delhi, India', equipment: 'Palletized', availableDate: '2025-11-11', vehicleType: 'Plane', capacity: 165000, notes: 'Northern India hub' },
  
  // Middle East
  { id: 'P34', location: 'DXB, Dubai, UAE', equipment: 'Container', availableDate: '2025-11-08', vehicleType: 'Plane', capacity: 200000, notes: 'Airbus A380F, Global super-hub' },
  { id: 'P35', location: 'DOH, Doha, Qatar', equipment: 'Palletized', availableDate: '2025-11-09', vehicleType: 'Plane', capacity: 175000, notes: 'Middle East connector' },
  { id: 'P36', location: 'IST, Istanbul, Turkey', equipment: 'Container', availableDate: '2025-11-10', vehicleType: 'Plane', capacity: 170000, notes: 'Europe-Asia bridge' },
  
  // South America
  { id: 'P37', location: 'GRU, São Paulo, Brazil', equipment: 'Palletized', availableDate: '2025-11-07', vehicleType: 'Plane', capacity: 155000, notes: 'South American hub' },
  { id: 'P38', location: 'EZE, Buenos Aires, Argentina', equipment: 'Container', availableDate: '2025-11-11', vehicleType: 'Plane', capacity: 145000, notes: 'Southern Cone gateway' },
  { id: 'P39', location: 'SCL, Santiago, Chile', equipment: 'Palletized', availableDate: '2025-11-08', vehicleType: 'Plane', capacity: 140000, notes: 'Pacific South America' },
  
  // Africa
  { id: 'P40', location: 'JNB, Johannesburg, South Africa', equipment: 'Container', availableDate: '2025-11-09', vehicleType: 'Plane', capacity: 150000, notes: 'Southern African hub' },
  { id: 'P41', location: 'CAI, Cairo, Egypt', equipment: 'Palletized', availableDate: '2025-11-10', vehicleType: 'Plane', capacity: 135000, notes: 'North African gateway' },
  { id: 'P42', location: 'NBO, Nairobi, Kenya', equipment: 'Container', availableDate: '2025-11-06', vehicleType: 'Plane', capacity: 130000, notes: 'East African hub' },
  
  // Australia & Oceania
  { id: 'P43', location: 'SYD, Sydney, Australia', equipment: 'Palletized', availableDate: '2025-11-11', vehicleType: 'Plane', capacity: 165000, notes: 'Australian gateway' },
  { id: 'P44', location: 'MEL, Melbourne, Australia', equipment: 'Container', availableDate: '2025-11-08', vehicleType: 'Plane', capacity: 160000, notes: 'Southern Australian hub' },
  { id: 'P45', location: 'AKL, Auckland, New Zealand', equipment: 'Palletized', availableDate: '2025-11-09', vehicleType: 'Plane', capacity: 145000, notes: 'New Zealand gateway' },
  
  // ==================== CARGO SHIPS ====================
  
  // North America Ports
  { id: 'S9', location: 'Port of Oakland, CA', equipment: 'Container', availableDate: '2025-11-13', vehicleType: 'Ship', capacity: 490000, notes: 'Bay Area container hub' },
  { id: 'S10', location: 'Port of Vancouver, BC', equipment: 'Container', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 460000, notes: 'Canadian Pacific gateway' },
  { id: 'S11', location: 'Port of Tacoma, WA', equipment: 'Bulk', availableDate: '2025-11-10', vehicleType: 'Ship', capacity: 520000, notes: 'Northwest bulk carrier' },
  { id: 'S12', location: 'Port of Baltimore, MD', equipment: 'Container', availableDate: '2025-11-15', vehicleType: 'Ship', capacity: 440000, notes: 'East Coast container port' },
  { id: 'S13', location: 'Port of New Orleans, LA', equipment: 'Bulk', availableDate: '2025-11-11', vehicleType: 'Ship', capacity: 580000, notes: 'Mississippi River gateway' },
  { id: 'S14', location: 'Port of Boston, MA', equipment: 'Container', availableDate: '2025-11-16', vehicleType: 'Ship', capacity: 400000, notes: 'New England port' },
  { id: 'S15', location: 'Port of San Diego, CA', equipment: 'Container', availableDate: '2025-11-12', vehicleType: 'Ship', capacity: 420000, notes: 'Southern California port' },
  { id: 'S16', location: 'Port of Montreal, QC', equipment: 'Container', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 430000, notes: 'St. Lawrence Seaway' },
  { id: 'S17', location: 'Port of Veracruz, Mexico', equipment: 'Bulk', availableDate: '2025-11-10', vehicleType: 'Ship', capacity: 450000, notes: 'Gulf of Mexico hub' },
  
  // European Ports
  { id: 'S18', location: 'Port of Rotterdam, Netherlands', equipment: 'Container', availableDate: '2025-11-13', vehicleType: 'Ship', capacity: 600000, notes: 'Europes largest port' },
  { id: 'S19', location: 'Port of Hamburg, Germany', equipment: 'Container', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 560000, notes: 'German gateway' },
  { id: 'S20', location: 'Port of Antwerp, Belgium', equipment: 'Bulk', availableDate: '2025-11-11', vehicleType: 'Ship', capacity: 540000, notes: 'Belgian major port' },
  { id: 'S21', location: 'Port of Le Havre, France', equipment: 'Container', availableDate: '2025-11-15', vehicleType: 'Ship', capacity: 480000, notes: 'French Atlantic port' },
  { id: 'S22', location: 'Port of Barcelona, Spain', equipment: 'Container', availableDate: '2025-11-12', vehicleType: 'Ship', capacity: 470000, notes: 'Mediterranean hub' },
  { id: 'S23', location: 'Port of Genoa, Italy', equipment: 'Bulk', availableDate: '2025-11-16', vehicleType: 'Ship', capacity: 450000, notes: 'Italian maritime capital' },
  { id: 'S24', location: 'Port of Piraeus, Greece', equipment: 'Container', availableDate: '2025-11-13', vehicleType: 'Ship', capacity: 490000, notes: 'Eastern Mediterranean' },
  { id: 'S25', location: 'Port of Felixstowe, UK', equipment: 'Container', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 510000, notes: 'UK largest container port' },
  { id: 'S26', location: 'Port of Gothenburg, Sweden', equipment: 'Bulk', availableDate: '2025-11-10', vehicleType: 'Ship', capacity: 440000, notes: 'Scandinavian gateway' },
  
  // Asian Ports
  { id: 'S27', location: 'Port of Singapore', equipment: 'Container', availableDate: '2025-11-13', vehicleType: 'Ship', capacity: 650000, notes: 'Worlds busiest transshipment hub' },
  { id: 'S28', location: 'Port of Shanghai, China', equipment: 'Container', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 700000, notes: 'Worlds largest container port' },
  { id: 'S29', location: 'Port of Busan, South Korea', equipment: 'Container', availableDate: '2025-11-15', vehicleType: 'Ship', capacity: 580000, notes: 'Northeast Asian hub' },
  { id: 'S30', location: 'Port of Hong Kong', equipment: 'Container', availableDate: '2025-11-12', vehicleType: 'Ship', capacity: 620000, notes: 'Major transshipment center' },
  { id: 'S31', location: 'Port of Shenzhen, China', equipment: 'Container', availableDate: '2025-11-16', vehicleType: 'Ship', capacity: 680000, notes: 'Southern China mega-port' },
  { id: 'S32', location: 'Port of Ningbo-Zhoushan, China', equipment: 'Bulk', availableDate: '2025-11-11', vehicleType: 'Ship', capacity: 750000, notes: 'Largest bulk cargo port' },
  { id: 'S33', location: 'Port of Guangzhou, China', equipment: 'Container', availableDate: '2025-11-13', vehicleType: 'Ship', capacity: 590000, notes: 'Pearl River Delta hub' },
  { id: 'S34', location: 'Port of Qingdao, China', equipment: 'Container', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 560000, notes: 'Northern China port' },
  { id: 'S35', location: 'Port of Tokyo, Japan', equipment: 'Container', availableDate: '2025-11-15', vehicleType: 'Ship', capacity: 520000, notes: 'Japanese capital port' },
  { id: 'S36', location: 'Port of Yokohama, Japan', equipment: 'Bulk', availableDate: '2025-11-10', vehicleType: 'Ship', capacity: 510000, notes: 'Tokyo Bay area' },
  { id: 'S37', location: 'Port of Kaohsiung, Taiwan', equipment: 'Container', availableDate: '2025-11-12', vehicleType: 'Ship', capacity: 540000, notes: 'Taiwan major port' },
  { id: 'S38', location: 'Port of Bangkok, Thailand', equipment: 'Container', availableDate: '2025-11-16', vehicleType: 'Ship', capacity: 480000, notes: 'Southeast Asian gateway' },
  { id: 'S39', location: 'Port of Manila, Philippines', equipment: 'Container', availableDate: '2025-11-13', vehicleType: 'Ship', capacity: 460000, notes: 'Philippine gateway' },
  { id: 'S40', location: 'Port of Mumbai, India', equipment: 'Bulk', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 550000, notes: 'Indian west coast' },
  { id: 'S41', location: 'Port of Chennai, India', equipment: 'Container', availableDate: '2025-11-11', vehicleType: 'Ship', capacity: 520000, notes: 'Indian east coast' },
  
  // Middle Eastern Ports
  { id: 'S42', location: 'Port of Jebel Ali, Dubai', equipment: 'Container', availableDate: '2025-11-15', vehicleType: 'Ship', capacity: 630000, notes: 'Middle East mega-hub' },
  { id: 'S43', location: 'Port of Jeddah, Saudi Arabia', equipment: 'Bulk', availableDate: '2025-11-12', vehicleType: 'Ship', capacity: 500000, notes: 'Red Sea gateway' },
  { id: 'S44', location: 'Port of Haifa, Israel', equipment: 'Container', availableDate: '2025-11-16', vehicleType: 'Ship', capacity: 450000, notes: 'Eastern Mediterranean' },
  
  // South American Ports
  { id: 'S45', location: 'Port of Santos, Brazil', equipment: 'Container', availableDate: '2025-11-13', vehicleType: 'Ship', capacity: 540000, notes: 'Latin Americas busiest port' },
  { id: 'S46', location: 'Port of Buenos Aires, Argentina', equipment: 'Bulk', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 490000, notes: 'River Plate gateway' },
  { id: 'S47', location: 'Port of Valparaiso, Chile', equipment: 'Container', availableDate: '2025-11-10', vehicleType: 'Ship', capacity: 470000, notes: 'Chilean Pacific port' },
  { id: 'S48', location: 'Port of Callao, Peru', equipment: 'Container', availableDate: '2025-11-15', vehicleType: 'Ship', capacity: 450000, notes: 'Peruvian gateway' },
  { id: 'S49', location: 'Port of Cartagena, Colombia', equipment: 'Container', availableDate: '2025-11-11', vehicleType: 'Ship', capacity: 440000, notes: 'Colombian Caribbean' },
  
  // African Ports
  { id: 'S50', location: 'Port of Durban, South Africa', equipment: 'Container', availableDate: '2025-11-12', vehicleType: 'Ship', capacity: 520000, notes: 'Busiest African port' },
  { id: 'S51', location: 'Port of Alexandria, Egypt', equipment: 'Bulk', availableDate: '2025-11-16', vehicleType: 'Ship', capacity: 480000, notes: 'Egyptian Mediterranean' },
  { id: 'S52', location: 'Port of Tangier, Morocco', equipment: 'Container', availableDate: '2025-11-13', vehicleType: 'Ship', capacity: 500000, notes: 'Strait of Gibraltar' },
  { id: 'S53', location: 'Port of Mombasa, Kenya', equipment: 'Container', availableDate: '2025-11-14', vehicleType: 'Ship', capacity: 460000, notes: 'East African hub' },
  { id: 'S54', location: 'Port of Lagos, Nigeria', equipment: 'Bulk', availableDate: '2025-11-10', vehicleType: 'Ship', capacity: 490000, notes: 'West African gateway' },
  
  // Australian & Oceania Ports
  { id: 'S55', location: 'Port of Sydney, Australia', equipment: 'Container', availableDate: '2025-11-15', vehicleType: 'Ship', capacity: 530000, notes: 'Australian gateway' },
  { id: 'S56', location: 'Port of Melbourne, Australia', equipment: 'Container', availableDate: '2025-11-11', vehicleType: 'Ship', capacity: 540000, notes: 'Southern Australian hub' },
  { id: 'S57', location: 'Port of Brisbane, Australia', equipment: 'Bulk', availableDate: '2025-11-12', vehicleType: 'Ship', capacity: 510000, notes: 'Queensland gateway' },
  { id: 'S58', location: 'Port of Auckland, New Zealand', equipment: 'Container', availableDate: '2025-11-16', vehicleType: 'Ship', capacity: 470000, notes: 'New Zealand major port' }
];

