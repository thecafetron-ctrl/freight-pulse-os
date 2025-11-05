import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { Load, Vehicle, Match } from '@/types/loadMatching';

interface InteractiveSVGMapProps {
  vehicles: Vehicle[];
  loads: Load[];
  matches: Match[];
}

// City coordinates mapping (approximate SVG positions)
const cityCoords: Record<string, { x: number; y: number }> = {
  // North America
  'seattle': { x: 120, y: 120 }, 'san francisco': { x: 100, y: 160 }, 'los angeles': { x: 110, y: 180 },
  'phoenix': { x: 150, y: 200 }, 'denver': { x: 220, y: 160 }, 'dallas': { x: 240, y: 210 },
  'houston': { x: 250, y: 230 }, 'chicago': { x: 300, y: 140 }, 'atlanta': { x: 330, y: 210 },
  'miami': { x: 350, y: 250 }, 'new york': { x: 380, y: 130 }, 'boston': { x: 400, y: 120 },
  'toronto': { x: 360, y: 110 }, 'vancouver': { x: 115, y: 100 }, 'montreal': { x: 370, y: 105 },
  'mexico city': { x: 200, y: 270 },
  
  // Europe
  'london': { x: 470, y: 120 }, 'paris': { x: 490, y: 130 }, 'berlin': { x: 510, y: 115 },
  'madrid': { x: 465, y: 155 }, 'rome': { x: 510, y: 150 }, 'amsterdam': { x: 490, y: 115 },
  'dublin': { x: 460, y: 110 }, 'stockholm': { x: 520, y: 90 }, 'munich': { x: 505, y: 125 },
  
  // Asia
  'dubai': { x: 580, y: 180 }, 'mumbai': { x: 600, y: 190 }, 'delhi': { x: 610, y: 175 },
  'singapore': { x: 640, y: 220 }, 'tokyo': { x: 720, y: 150 }, 'shanghai': { x: 700, y: 170 },
  'beijing': { x: 690, y: 155 }, 'hong kong': { x: 685, y: 185 }, 'seoul': { x: 710, y: 155 },
  
  // Others
  'sydney': { x: 730, y: 280 }, 'são paulo': { x: 330, y: 310 },
};

// Get coordinates for a location
function getCoords(location: string): { x: number; y: number } | null {
  const city = location.split(',')[0].toLowerCase().trim();
  
  // Direct match
  if (cityCoords[city]) return cityCoords[city];
  
  // Partial match
  for (const [key, coords] of Object.entries(cityCoords)) {
    if (city.includes(key) || key.includes(city)) {
      return coords;
    }
  }
  
  return null;
}

export function InteractiveSVGMap({ vehicles, loads, matches }: InteractiveSVGMapProps) {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

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
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <>
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
        <button onClick={() => setZoom(Math.min(zoom + 0.3, 3))} className="p-1.5 rounded bg-[hsl(var(--navy-deep))]/70 backdrop-blur border border-white/10 hover:border-[hsl(var(--cyan-glow))]/50 transition">
          <ZoomIn className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
        </button>
        <button onClick={() => setZoom(Math.max(zoom - 0.3, 0.5))} className="p-1.5 rounded bg-[hsl(var(--navy-deep))]/70 backdrop-blur border border-white/10 hover:border-[hsl(var(--cyan-glow))]/50 transition">
          <ZoomOut className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
        </button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 rounded bg-[hsl(var(--navy-deep))]/70 backdrop-blur border border-white/10 hover:border-[hsl(var(--orange-glow))]/50 transition">
          <RotateCcw className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(80)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 + 0.2, animationDelay: `${Math.random() * 3}s` }} />
        ))}
      </div>

      {/* SVG Map */}
      <svg ref={svgRef} viewBox="0 0 800 400" className={`w-full h-full relative z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0a1628" />
          </radialGradient>
          <filter id="mapGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g transform={`translate(${pan.x / 2}, ${pan.y / 2}) scale(${zoom})`}>
          {/* Ocean */}
          <ellipse cx="400" cy="200" rx="350" ry="180" fill="url(#oceanGrad)" opacity="0.3" />
          
          {/* Grid */}
          <g opacity="0.15" stroke="#00E6FF" strokeWidth="0.5">
            <ellipse cx="400" cy="200" rx="350" ry="180" fill="none" />
            <ellipse cx="400" cy="200" rx="350" ry="120" fill="none" />
            <ellipse cx="400" cy="200" rx="280" ry="180" fill="none" />
            <ellipse cx="400" cy="200" rx="210" ry="180" fill="none" />
          </g>

          {/* Match connections */}
          {matches.slice(0, 15).map((m, i) => {
            const load = loads.find(l => l.id === m.loadId);
            const vehicle = vehicles.find(v => v.id === m.truckId);
            if (!load || !vehicle) return null;
            const loadCoords = getCoords(load.origin);
            const vehCoords = getCoords(vehicle.location);
            if (!loadCoords || !vehCoords) return null;
            return (
              <line key={i} x1={loadCoords.x} y1={loadCoords.y} x2={vehCoords.x} y2={vehCoords.y}
                stroke={m.matchScore >= 90 ? 'hsl(var(--cyan-glow))' : 'hsl(var(--orange-glow))'}
                strokeWidth="1.5" opacity="0.6" strokeDasharray="4,4" filter="url(#mapGlow)">
                <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite" />
              </line>
            );
          })}

          {/* Vehicle markers */}
          {Object.entries(vehiclesByLocation).map(([key, vehs]) => {
            const coords = getCoords(vehs[0].location);
            if (!coords) return null;
            const count = vehs.length;
            return (
              <g key={key} filter="url(#mapGlow)">
                <circle cx={coords.x} cy={coords.y} r={Math.min(4 + count * 0.2, 8)} fill="hsl(var(--orange-glow))" opacity="0.8" className="animate-pulse-glow">
                  <animate attributeName="r" values={`${4 + count * 0.2};${6 + count * 0.2};${4 + count * 0.2}`} dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={coords.x} cy={coords.y} r={Math.min(8 + count * 0.3, 14)} fill="none" stroke="hsl(var(--orange-glow))" strokeWidth="1" opacity="0.3" />
                <text x={coords.x} y={coords.y - 10} textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
                  {vehs[0].location.split(',')[0]}
                </text>
                {count > 1 && (
                  <text x={coords.x} y={coords.y + 3} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{count}</text>
                )}
              </g>
            );
          })}

          {/* Load markers */}
          {loads.map(load => {
            const coords = getCoords(load.origin);
            if (!coords) return null;
            return (
              <g key={load.id} filter="url(#mapGlow)">
                <circle cx={coords.x} cy={coords.y} r="5" fill="hsl(var(--cyan-glow))" opacity="0.9" className="animate-pulse-glow">
                  <animate attributeName="r" values="5;7;5" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx={coords.x} cy={coords.y} r="10" fill="none" stroke="hsl(var(--cyan-glow))" strokeWidth="1.5" opacity="0.4" />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Info overlay */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[hsl(var(--navy-deep))]/70 backdrop-blur border border-white/10 text-xs text-[hsl(var(--text-secondary))] z-20">
        Drag to pan • Zoom controls • {Object.keys(vehiclesByLocation).length} locations • {vehicles.length} vehicles
      </div>
    </>
  );
}

