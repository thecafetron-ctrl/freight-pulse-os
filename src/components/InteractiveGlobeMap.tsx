import { useState, useRef, useEffect } from 'react';
import { MapPin, Truck, Plane, Ship, ZoomIn, ZoomOut } from 'lucide-react';
import type { Vehicle, Load } from '@/types/loadMatching';

interface InteractiveGlobeMapProps {
  vehicles: Vehicle[];
  loads: Load[];
  matches: Array<{ loadId: string; truckId: string; matchScore: number }>;
}

// Rough coordinates for cities (lat, lng) - approximate for visualization
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // North America
  'new york': { lat: 40.7, lng: -74.0 },
  'los angeles': { lat: 34.0, lng: -118.2 },
  'chicago': { lat: 41.9, lng: -87.6 },
  'houston': { lat: 29.8, lng: -95.4 },
  'dallas': { lat: 32.8, lng: -96.8 },
  'fort worth': { lat: 32.8, lng: -97.3 },
  'atlanta': { lat: 33.7, lng: -84.4 },
  'miami': { lat: 25.8, lng: -80.2 },
  'seattle': { lat: 47.6, lng: -122.3 },
  'san francisco': { lat: 37.8, lng: -122.4 },
  'phoenix': { lat: 33.4, lng: -112.1 },
  'boston': { lat: 42.4, lng: -71.1 },
  'denver': { lat: 39.7, lng: -104.9 },
  'toronto': { lat: 43.7, lng: -79.4 },
  'vancouver': { lat: 49.3, lng: -123.1 },
  'mexico city': { lat: 19.4, lng: -99.1 },
  
  // Europe
  'london': { lat: 51.5, lng: -0.1 },
  'paris': { lat: 48.9, lng: 2.4 },
  'berlin': { lat: 52.5, lng: 13.4 },
  'madrid': { lat: 40.4, lng: -3.7 },
  'rome': { lat: 41.9, lng: 12.5 },
  'amsterdam': { lat: 52.4, lng: 4.9 },
  'munich': { lat: 48.1, lng: 11.6 },
  'frankfurt': { lat: 50.1, lng: 8.7 },
  
  // Asia
  'tokyo': { lat: 35.7, lng: 139.7 },
  'shanghai': { lat: 31.2, lng: 121.5 },
  'beijing': { lat: 39.9, lng: 116.4 },
  'dubai': { lat: 25.3, lng: 55.3 },
  'singapore': { lat: 1.3, lng: 103.8 },
  'hong kong': { lat: 22.3, lng: 114.2 },
  'mumbai': { lat: 19.1, lng: 72.9 },
  'delhi': { lat: 28.7, lng: 77.1 },
  'seoul': { lat: 37.6, lng: 127.0 },
  
  // Others
  'sydney': { lat: -33.9, lng: 151.2 },
  'melbourne': { lat: -37.8, lng: 145.0 },
  'são paulo': { lat: -23.5, lng: -46.6 },
};

// Convert lat/lng to SVG coordinates
function projectToMap(lat: number, lng: number, zoom: number, panX: number, panY: number): { x: number; y: number } {
  // Mercator projection
  const x = ((lng + 180) / 360) * 800 * zoom + panX;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = ((0.5 - mercN / (2 * Math.PI)) * 400 * zoom) + panY;
  
  return { x, y };
}

export function InteractiveGlobeMap({ vehicles, loads, matches }: InteractiveGlobeMapProps) {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Get city name from location string
  const getCityName = (location: string): string => {
    return location.split(',')[0].toLowerCase().trim();
  };

  // Get coordinates for a location
  const getCoordinates = (location: string) => {
    const cityName = getCityName(location);
    
    // Try exact match
    if (cityCoordinates[cityName]) {
      return cityCoordinates[cityName];
    }
    
    // Try partial match
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (cityName.includes(city) || city.includes(cityName)) {
        return coords;
      }
    }
    
    return null;
  };

  // Group vehicles by location
  const vehiclesByLocation: Record<string, { vehicles: Vehicle[]; coords: { lat: number; lng: number } }> = {};
  
  vehicles.forEach(vehicle => {
    const coords = getCoordinates(vehicle.location);
    if (coords) {
      const key = `${coords.lat},${coords.lng}`;
      if (!vehiclesByLocation[key]) {
        vehiclesByLocation[key] = { vehicles: [], coords };
      }
      vehiclesByLocation[key].vehicles.push(vehicle);
    }
  });

  // Group loads by location
  const loadsByLocation: Record<string, { loads: Load[]; coords: { lat: number; lng: number } }> = {};
  
  loads.forEach(load => {
    const coords = getCoordinates(load.origin);
    if (coords) {
      const key = `${coords.lat},${coords.lng}`;
      if (!loadsByLocation[key]) {
        loadsByLocation[key] = { loads: [], coords };
      }
      loadsByLocation[key].loads.push(load);
    }
  });

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative h-full rounded-xl overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1a2742] to-[#0f1929]">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
          className="p-2 rounded-lg bg-[hsl(var(--navy-deep))]/70 backdrop-blur-sm border border-white/10 hover:border-[hsl(var(--cyan-glow))]/50 transition-all"
        >
          <ZoomIn className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          className="p-2 rounded-lg bg-[hsl(var(--navy-deep))]/70 backdrop-blur-sm border border-white/10 hover:border-[hsl(var(--cyan-glow))]/50 transition-all"
        >
          <ZoomOut className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-2 rounded-lg bg-[hsl(var(--navy-deep))]/70 backdrop-blur-sm border border-white/10 hover:border-[hsl(var(--orange-glow))]/50 transition-all text-xs text-white"
        >
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 px-3 py-2 rounded-lg bg-[hsl(var(--navy-deep))]/70 backdrop-blur-sm border border-white/10 z-20">
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
            <span className="text-[hsl(var(--text-secondary))]">Loads</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-3 h-3 text-[hsl(var(--orange-glow))]" />
            <span className="text-[hsl(var(--text-secondary))]">Vehicles</span>
          </div>
        </div>
      </div>

      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Interactive SVG Map */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className={`w-full h-full relative z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <radialGradient id="oceanGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0a1628" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g transform={`scale(${zoom}) translate(${pan.x / zoom}, ${pan.y / zoom})`}>
          {/* Ocean/Earth base */}
          <ellipse cx="400" cy="200" rx="350" ry="180" fill="url(#oceanGradient)" opacity="0.3" />
          
          {/* Latitude/longitude grid */}
          <g opacity="0.15" stroke="#00E6FF" strokeWidth="0.5">
            <ellipse cx="400" cy="200" rx="350" ry="180" fill="none" />
            <ellipse cx="400" cy="200" rx="350" ry="120" fill="none" />
            <ellipse cx="400" cy="200" rx="350" ry="60" fill="none" />
            <ellipse cx="400" cy="200" rx="280" ry="180" fill="none" />
            <ellipse cx="400" cy="200" rx="210" ry="180" fill="none" />
            <ellipse cx="400" cy="200" rx="140" ry="180" fill="none" />
          </g>

          {/* Draw connection lines for matches */}
          {matches.slice(0, 10).map((match, idx) => {
            const load = loads.find(l => l.id === match.loadId);
            const vehicle = vehicles.find(v => v.id === match.truckId);
            
            if (!load || !vehicle) return null;
            
            const originCoords = getCoordinates(load.origin);
            const vehicleCoords = getCoordinates(vehicle.location);
            
            if (!originCoords || !vehicleCoords) return null;
            
            const start = projectToMap(originCoords.lat, originCoords.lng, 1, 0, 0);
            const end = projectToMap(vehicleCoords.lat, vehicleCoords.lng, 1, 0, 0);
            
            return (
              <line
                key={idx}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={match.matchScore >= 90 ? "hsl(var(--cyan-glow))" : "hsl(var(--orange-glow))"}
                strokeWidth="1.5"
                opacity="0.5"
                strokeDasharray="4,4"
                filter="url(#glow)"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite" />
              </line>
            );
          })}

          {/* Plot vehicle locations */}
          {Object.entries(vehiclesByLocation).map(([key, data]) => {
            const { x, y } = projectToMap(data.coords.lat, data.coords.lng, 1, 0, 0);
            const vehicleCount = data.vehicles.length;
            const hasTruck = data.vehicles.some(v => v.vehicleType === 'Truck');
            const hasPlane = data.vehicles.some(v => v.vehicleType === 'Plane');
            const hasShip = data.vehicles.some(v => v.vehicleType === 'Ship');
            
            return (
              <g key={key} filter="url(#glow)">
                <circle
                  cx={x}
                  cy={y}
                  r={Math.min(4 + vehicleCount * 0.3, 10)}
                  fill="hsl(var(--orange-glow))"
                  opacity="0.8"
                  className="animate-pulse-glow"
                >
                  <animate attributeName="r" values={`${4 + vehicleCount * 0.3};${6 + vehicleCount * 0.3};${4 + vehicleCount * 0.3}`} dur="2s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={x}
                  cy={y}
                  r={Math.min(8 + vehicleCount * 0.5, 16)}
                  fill="none"
                  stroke="hsl(var(--orange-glow))"
                  strokeWidth="1"
                  opacity="0.3"
                />
                {/* City label */}
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                  fontWeight="500"
                  className="pointer-events-none"
                >
                  {data.vehicles[0].location.split(',')[0]}
                </text>
                {/* Vehicle count */}
                {vehicleCount > 1 && (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {vehicleCount}
                  </text>
                )}
              </g>
            );
          })}

          {/* Plot load locations */}
          {Object.entries(loadsByLocation).map(([key, data]) => {
            const { x, y } = projectToMap(data.coords.lat, data.coords.lng, 1, 0, 0);
            const loadCount = data.loads.length;
            
            return (
              <g key={`load-${key}`} filter="url(#glow)">
                <circle
                  cx={x}
                  cy={y}
                  r={Math.min(5 + loadCount * 0.5, 10)}
                  fill="hsl(var(--cyan-glow))"
                  opacity="0.9"
                  className="animate-pulse-glow"
                >
                  <animate attributeName="r" values={`${5 + loadCount * 0.5};${7 + loadCount * 0.5};${5 + loadCount * 0.5}`} dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={x}
                  cy={y}
                  r={Math.min(10 + loadCount * 0.7, 18)}
                  fill="none"
                  stroke="hsl(var(--cyan-glow))"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Map info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-[hsl(var(--navy-deep))]/70 backdrop-blur-sm border border-white/10 text-xs text-[hsl(var(--text-secondary))] z-20">
        <div className="flex items-center gap-4">
          <span>🌍 Interactive Global Fleet Map</span>
          <span>•</span>
          <span>{Object.keys(vehiclesByLocation).length} locations</span>
          <span>•</span>
          <span>{vehicles.length} vehicles</span>
          <span>•</span>
          <span className="text-[hsl(var(--cyan-glow))]">Drag to pan • Scroll to zoom</span>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 right-4 px-3 py-2 rounded-lg bg-[hsl(var(--navy-deep))]/70 backdrop-blur-sm border border-white/10 text-xs z-20">
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <Truck className="w-3 h-3 text-[hsl(var(--orange-glow))]" />
            <span className="text-white font-semibold">{vehicles.filter(v => v.vehicleType === 'Truck').length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Plane className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
            <span className="text-white font-semibold">{vehicles.filter(v => v.vehicleType === 'Plane').length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Ship className="w-3 h-3 text-[hsl(var(--orange-glow))]" />
            <span className="text-white font-semibold">{vehicles.filter(v => v.vehicleType === 'Ship').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

