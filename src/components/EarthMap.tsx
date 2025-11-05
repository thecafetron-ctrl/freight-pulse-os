import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { Load, Vehicle, Match } from '@/types/loadMatching';

interface EarthMapProps {
  vehicles: Vehicle[];
  loads: Load[];
  matches: Match[];
}

// Realistic city coordinates (approximate lat/lng converted to SVG Mercator projection)
const cityCoords: Record<string, { x: number; y: number }> = {
  // North America
  'new york': { x: 380, y: 135 }, 'los angeles': { x: 105, y: 180 }, 'chicago': { x: 300, y: 145 },
  'houston': { x: 250, y: 225 }, 'dallas': { x: 235, y: 210 }, 'fort worth': { x: 237, y: 210 },
  'miami': { x: 350, y: 250 }, 'atlanta': { x: 330, y: 205 }, 'seattle': { x: 115, y: 115 },
  'san francisco': { x: 100, y: 165 }, 'phoenix': { x: 145, y: 200 }, 'boston': { x: 395, y: 125 },
  'denver': { x: 210, y: 160 }, 'philadelphia': { x: 375, y: 138 }, 'toronto': { x: 360, y: 118 },
  'vancouver': { x: 110, y: 105 }, 'montreal': { x: 370, y: 112 }, 'mexico city': { x: 220, y: 270 },
  
  // Europe
  'london': { x: 470, y: 125 }, 'paris': { x: 488, y: 130 }, 'berlin': { x: 508, y: 118 },
  'madrid': { x: 468, y: 155 }, 'rome': { x: 505, y: 148 }, 'amsterdam': { x: 488, y: 118 },
  'brussels': { x: 485, y: 122 }, 'vienna': { x: 515, y: 128 }, 'warsaw': { x: 525, y: 115 },
  'munich': { x: 502, y: 128 }, 'frankfurt': { x: 495, y: 122 }, 'stockholm': { x: 520, y: 95 },
  
  // Asia
  'dubai': { x: 580, y: 185 }, 'mumbai': { x: 605, y: 195 }, 'delhi': { x: 615, y: 175 },
  'singapore': { x: 640, y: 218 }, 'tokyo': { x: 715, y: 152 }, 'shanghai': { x: 695, y: 172 },
  'beijing': { x: 688, y: 158 }, 'hong kong': { x: 683, y: 188 }, 'seoul': { x: 705, y: 157 },
  'bangkok': { x: 635, y: 200 }, 'jakarta': { x: 645, y: 225 }, 'manila': { x: 670, y: 200 },
  
  // Others
  'sydney': { x: 735, y: 285 }, 'melbourne': { x: 730, y: 295 }, 'são paulo': { x: 325, y: 310 },
  'buenos aires': { x: 315, y: 320 }, 'cairo': { x: 530, y: 172 }, 'johannesburg': { x: 535, y: 305 },
};

// Get coordinates for location
function getCoords(location: string): { x: number; y: number } | null {
  const city = location.split(',')[0].toLowerCase().trim();
  for (const [key, coords] of Object.entries(cityCoords)) {
    if (city.includes(key) || key.includes(city)) return coords;
  }
  return null;
}

export function EarthMap({ vehicles, loads, matches }: EarthMapProps) {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Group vehicles by location
  const vehiclesByLocation: Record<string, Vehicle[]> = {};
  vehicles.forEach(v => {
    const coords = getCoords(v.location);
    if (coords) {
      const key = `${coords.x},${coords.y}`;
      if (!vehiclesByLocation[key]) vehiclesByLocation[key] = [];
      vehiclesByLocation[key].push(v);
    }
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <>
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
        <button onClick={() => setZoom(Math.min(zoom + 0.3, 3))} className="p-1.5 rounded bg-[hsl(var(--navy-deep))]/80 backdrop-blur border border-white/10 hover:border-[hsl(var(--cyan-glow))]/50 transition">
          <ZoomIn className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
        </button>
        <button onClick={() => setZoom(Math.max(zoom - 0.3, 0.5))} className="p-1.5 rounded bg-[hsl(var(--navy-deep))]/80 backdrop-blur border border-white/10 hover:border-[hsl(var(--cyan-glow))]/50 transition">
          <ZoomOut className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
        </button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 rounded bg-[hsl(var(--navy-deep))]/80 backdrop-blur border border-white/10 hover:border-[hsl(var(--orange-glow))]/50 transition">
          <RotateCcw className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.4 + 0.1, animationDelay: `${Math.random() * 3}s` }} />
        ))}
      </div>

      {/* SVG Earth Map */}
      <svg viewBox="0 0 800 400" className={`w-full h-full relative z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <defs>
          <radialGradient id="earth" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#2a4d6e" />
            <stop offset="100%" stopColor="#0a1628" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g transform={`translate(${pan.x / 2}, ${pan.y / 2}) scale(${zoom})`}>
          {/* Earth sphere */}
          <ellipse cx="400" cy="200" rx="360" ry="185" fill="url(#earth)" opacity="0.4" />
          
          {/* Latitude/longitude grid */}
          <g opacity="0.12" stroke="#00E6FF" strokeWidth="0.5">
            {[180, 120, 60].map(ry => <ellipse key={ry} cx="400" cy="200" rx="360" ry={ry} fill="none" />)}
            {[280, 210, 140, 70].map(rx => <ellipse key={rx} cx="400" cy="200" rx={rx} ry="185" fill="none" />)}
          </g>

          {/* Continents (simplified outlines) */}
          <g opacity="0.15" fill="#4a7c9e" stroke="#5a9fc5" strokeWidth="1">
            {/* North America */}
            <path d="M 80 100 Q 150 90, 250 110 Q 320 120, 360 140 Q 380 180, 350 240 Q 300 260, 200 270 Q 120 250, 90 200 Q 70 150, 80 100 Z" />
            {/* Europe */}
            <path d="M 460 100 Q 500 95, 530 110 Q 540 130, 525 150 Q 510 160, 475 155 Q 455 140, 460 100 Z" />
            {/* Asia */}
            <path d="M 560 120 Q 650 100, 720 140 Q 740 180, 710 220 Q 660 240, 590 225 Q 550 190, 560 120 Z" />
            {/* Australia */}
            <ellipse cx="730" cy="290" rx="35" ry="25" />
          </g>

          {/* Match connections (animated) */}
          {matches.slice(0, 20).map((m, i) => {
            const load = loads.find(l => l.id === m.loadId);
            const vehicle = vehicles.find(v => v.id === m.truckId);
            if (!load || !vehicle) return null;
            const lCoords = getCoords(load.origin);
            const vCoords = getCoords(vehicle.location);
            if (!lCoords || !vCoords) return null;
            return (
              <line key={i} x1={lCoords.x} y1={lCoords.y} x2={vCoords.x} y2={vCoords.y}
                stroke={m.matchScore >= 90 ? 'hsl(var(--cyan-glow))' : 'hsl(var(--orange-glow))'}
                strokeWidth="1.5" opacity="0.6" strokeDasharray="5,3" filter="url(#glow)">
                <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1.2s" repeatCount="indefinite" />
              </line>
            );
          })}

          {/* Vehicle markers (orange) */}
          {Object.entries(vehiclesByLocation).map(([key, vehs]) => {
            const coords = getCoords(vehs[0].location);
            if (!coords) return null;
            const count = vehs.length;
            const radius = Math.min(3.5 + count * 0.25, 9);
            return (
              <g key={key} filter="url(#glow)">
                <circle cx={coords.x} cy={coords.y} r={radius} fill="hsl(var(--orange-glow))" opacity="0.85" className="animate-pulse-glow">
                  <animate attributeName="r" values={`${radius};${radius + 2};${radius}`} dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={coords.x} cy={coords.y} r={radius + 4} fill="none" stroke="hsl(var(--orange-glow))" strokeWidth="0.8" opacity="0.3" />
                <text x={coords.x} y={coords.y - 11} textAnchor="middle" fill="white" fontSize="7.5" fontWeight="600" opacity="0.9">
                  {vehs[0].location.split(',')[0]}
                </text>
                {count > 1 && (
                  <text x={coords.x} y={coords.y + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{count}</text>
                )}
              </g>
            );
          })}

          {/* Load markers (cyan) */}
          {loads.map(load => {
            const coords = getCoords(load.origin);
            if (!coords) return null;
            return (
              <g key={load.id} filter="url(#glow)">
                <circle cx={coords.x} cy={coords.y} r="5.5" fill="hsl(var(--cyan-glow))" opacity="0.95" className="animate-pulse-glow">
                  <animate attributeName="r" values="5.5;7.5;5.5" dur="1.9s" repeatCount="indefinite" />
                </circle>
                <circle cx={coords.x} cy={coords.y} r="11" fill="none" stroke="hsl(var(--cyan-glow))" strokeWidth="1.5" opacity="0.5" />
              </g>
            );
          })}

          {/* Traveling data points */}
          {matches.length > 0 && (
            <g>
              <circle r="2.5" fill="white" opacity="0.9">
                <animateMotion dur="10s" repeatCount="indefinite" path="M 105 180 Q 250 150, 380 135" />
              </circle>
              <circle r="2.5" fill="white" opacity="0.9">
                <animateMotion dur="12s" repeatCount="indefinite" path="M 380 135 Q 550 140, 715 152" />
              </circle>
            </g>
          )}
        </g>
      </svg>

      {/* Info overlay */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[hsl(var(--navy-deep))]/80 backdrop-blur-sm border border-white/10 text-xs text-[hsl(var(--text-secondary))] z-20">
        <div className="flex items-center gap-3">
          <span>🌍 Interactive Earth Map</span>
          <span>•</span>
          <span>{Object.keys(vehiclesByLocation).length} locations</span>
          <span>•</span>
          <span>{vehicles.length} vehicles</span>
          {matches.length > 0 && <><span>•</span><span className="text-[hsl(var(--cyan-glow))]">{matches.length} matches</span></>}
        </div>
      </div>
    </>
  );
}

