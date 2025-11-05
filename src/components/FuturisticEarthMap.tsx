import { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { LocationPopup } from './LocationPopup';
import type { Load, Vehicle, Match } from '@/types/loadMatching';
import worldWireframe from '@/assets/world-wireframe.png';

interface FuturisticEarthMapProps {
  vehicles: Vehicle[];
  loads: Load[];
  matches: Match[];
}

// ACCURATE GEOGRAPHIC PROJECTION matched to wireframe PNG (1536x1024 scaled to 2000x1000)
const project = (lat: number, lon: number) => {
  // Equirectangular projection with proper aspect ratio
  const x = (lon + 180) * (2000 / 360);
  const y = (90 - lat) * (1000 / 180);
  return { x, y };
};

// COMPREHENSIVE CITY COORDINATES (All major global cities)
const cityCoords: Record<string, { lat: number; lon: number }> = {
  // North America - USA
  'new york': { lat: 40.7128, lon: -74.0060 },
  'los angeles': { lat: 34.0522, lon: -118.2437 },
  'chicago': { lat: 41.8781, lon: -87.6298 },
  'houston': { lat: 29.7604, lon: -95.3698 },
  'dallas': { lat: 32.7767, lon: -96.7970 },
  'fort worth': { lat: 32.7555, lon: -97.3308 },
  'miami': { lat: 25.7617, lon: -80.1918 },
  'atlanta': { lat: 33.7490, lon: -84.3880 },
  'seattle': { lat: 47.6062, lon: -122.3321 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
  'phoenix': { lat: 33.4484, lon: -112.0740 },
  'boston': { lat: 42.3601, lon: -71.0589 },
  'denver': { lat: 39.7392, lon: -104.9903 },
  'philadelphia': { lat: 39.9526, lon: -75.1652 },
  'san antonio': { lat: 29.4241, lon: -98.4936 },
  'las vegas': { lat: 36.1699, lon: -115.1398 },
  'detroit': { lat: 42.3314, lon: -83.0458 },
  'portland': { lat: 45.5152, lon: -122.6784 },
  'austin': { lat: 30.2672, lon: -97.7431 },
  'columbus': { lat: 39.9612, lon: -82.9988 },
  
  // North America - Canada
  'toronto': { lat: 43.6532, lon: -79.3832 },
  'vancouver': { lat: 49.2827, lon: -123.1207 },
  'montreal': { lat: 45.5017, lon: -73.5673 },
  'ottawa': { lat: 45.4215, lon: -75.6972 },
  'calgary': { lat: 51.0447, lon: -114.0719 },
  'edmonton': { lat: 53.5461, lon: -113.4938 },
  
  // North America - Mexico
  'mexico city': { lat: 19.4326, lon: -99.1332 },
  'guadalajara': { lat: 20.6597, lon: -103.3496 },
  'monterrey': { lat: 25.6866, lon: -100.3161 },
  'cancun': { lat: 21.1619, lon: -86.8515 },
  
  // Europe - Western
  'london': { lat: 51.5072, lon: -0.1276 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'madrid': { lat: 40.4168, lon: -3.7038 },
  'lisbon': { lat: 38.7223, lon: -9.1393 },
  'dublin': { lat: 53.3498, lon: -6.2603 },
  'amsterdam': { lat: 52.3676, lon: 4.9041 },
  'brussels': { lat: 50.8503, lon: 4.3517 },
  
  // Europe - Central
  'berlin': { lat: 52.5200, lon: 13.4050 },
  'vienna': { lat: 48.2082, lon: 16.3738 },
  'munich': { lat: 48.1351, lon: 11.5820 },
  'frankfurt': { lat: 50.1109, lon: 8.6821 },
  'zurich': { lat: 47.3769, lon: 8.5417 },
  'prague': { lat: 50.0755, lon: 14.4378 },
  'budapest': { lat: 47.4979, lon: 19.0402 },
  
  // Europe - Southern
  'rome': { lat: 41.9028, lon: 12.4964 },
  'athens': { lat: 37.9838, lon: 23.7275 },
  'barcelona': { lat: 41.3851, lon: 2.1734 },
  'milan': { lat: 45.4642, lon: 9.1900 },
  
  // Europe - Northern
  'stockholm': { lat: 59.3293, lon: 18.0686 },
  'copenhagen': { lat: 55.6761, lon: 12.5683 },
  'oslo': { lat: 59.9139, lon: 10.7522 },
  'helsinki': { lat: 60.1699, lon: 24.9384 },
  
  // Europe - Eastern
  'moscow': { lat: 55.7558, lon: 37.6173 },
  'warsaw': { lat: 52.2297, lon: 21.0122 },
  'kiev': { lat: 50.4501, lon: 30.5234 },
  
  // Middle East
  'dubai': { lat: 25.2048, lon: 55.2708 },
  'abu dhabi': { lat: 24.4539, lon: 54.3773 },
  'riyadh': { lat: 24.7136, lon: 46.6753 },
  'doha': { lat: 25.2854, lon: 51.5310 },
  'tel aviv': { lat: 32.0853, lon: 34.7818 },
  'istanbul': { lat: 41.0082, lon: 28.9784 },
  'cairo': { lat: 30.0444, lon: 31.2357 },
  
  // Asia - East
  'tokyo': { lat: 35.6895, lon: 139.6917 },
  'shanghai': { lat: 31.2304, lon: 121.4737 },
  'beijing': { lat: 39.9042, lon: 116.4074 },
  'hong kong': { lat: 22.3193, lon: 114.1694 },
  'seoul': { lat: 37.5665, lon: 126.9780 },
  'taipei': { lat: 25.0330, lon: 121.5654 },
  
  // Asia - South
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'delhi': { lat: 28.7041, lon: 77.1025 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  
  // Asia - Southeast
  'singapore': { lat: 1.3521, lon: 103.8198 },
  'bangkok': { lat: 13.7563, lon: 100.5018 },
  'kuala lumpur': { lat: 3.1390, lon: 101.6869 },
  'jakarta': { lat: -6.2088, lon: 106.8456 },
  'manila': { lat: 14.5995, lon: 120.9842 },
  'hanoi': { lat: 21.0285, lon: 105.8542 },
  'ho chi minh': { lat: 10.8231, lon: 106.6297 },
  
  // Oceania
  'sydney': { lat: -33.8688, lon: 151.2093 },
  'melbourne': { lat: -37.8136, lon: 144.9631 },
  'brisbane': { lat: -27.4698, lon: 153.0251 },
  'perth': { lat: -31.9505, lon: 115.8605 },
  'auckland': { lat: -36.8485, lon: 174.7633 },
  'wellington': { lat: -41.2865, lon: 174.7762 },
  
  // South America
  'são paulo': { lat: -23.5505, lon: -46.6333 },
  'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
  'brasília': { lat: -15.7939, lon: -47.8828 },
  'buenos aires': { lat: -34.6037, lon: -58.3816 },
  'santiago': { lat: -33.4489, lon: -70.6693 },
  'lima': { lat: -12.0464, lon: -77.0428 },
  'bogota': { lat: 4.7110, lon: -74.0721 },
  'caracas': { lat: 10.4806, lon: -66.9036 },
  
  // Africa
  'johannesburg': { lat: -26.2041, lon: 28.0473 },
  'cape town': { lat: -33.9249, lon: 18.4241 },
  'lagos': { lat: 6.5244, lon: 3.3792 },
  'nairobi': { lat: -1.2921, lon: 36.8219 },
  'casablanca': { lat: 33.5731, lon: -7.5898 },
};

const getCoords = (location: string) => {
  const city = location.split(',')[0].toLowerCase().trim();
  if (cityCoords[city]) return project(cityCoords[city].lat, cityCoords[city].lon);
  for (const [key, coords] of Object.entries(cityCoords)) {
    if (city.includes(key) || key.includes(city)) return project(coords.lat, coords.lon);
  }
  // Fallback estimates
  const lower = location.toLowerCase();
  if (lower.includes('tx') || lower.includes('texas')) return project(31.0, -100.0);
  if (lower.includes('ca') || lower.includes('california')) return project(37.0, -120.0);
  if (lower.includes('fl') || lower.includes('florida')) return project(28.0, -82.0);
  return null;
};

export const FuturisticEarthMap: React.FC<FuturisticEarthMapProps> = ({ vehicles, loads, matches }) => {
  const [zoom, setZoom] = useState(1);
  const [hoveredLocation, setHoveredLocation] = useState<{ vehicles: Vehicle[]; loads: Load[]; position: { x: number; y: number } } | null>(null);

  // Group locations
  const vehiclesByLocation: Record<string, Vehicle[]> = {};
  const loadsByLocation: Record<string, Load[]> = {};
  
  vehicles.forEach(v => {
    const coords = getCoords(v.location);
    if (coords) {
      const key = `${coords.x},${coords.y}`;
      if (!vehiclesByLocation[key]) vehiclesByLocation[key] = [];
      vehiclesByLocation[key].push(v);
    }
  });
  
  loads.forEach(l => {
    const coords = getCoords(l.origin);
    if (coords) {
      const key = `${coords.x},${coords.y}`;
      if (!loadsByLocation[key]) loadsByLocation[key] = [];
      loadsByLocation[key].push(l);
    }
  });

  // Matched locations
  const matchedKeys = new Set<string>();
  matches.forEach(m => {
    const load = loads.find(l => l.id === m.loadId);
    const vehicle = vehicles.find(v => v.id === m.truckId);
    if (load) {
      const coords = getCoords(load.origin);
      if (coords) matchedKeys.add(`${coords.x},${coords.y}`);
    }
    if (vehicle) {
      const coords = getCoords(vehicle.location);
      if (coords) matchedKeys.add(`${coords.x},${coords.y}`);
    }
  });

  // Arc path
  const arcPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - Math.min(dx * 0.15, 150);
    return `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#020817', position: 'relative', overflow: 'hidden' }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={10}
        centerOnInit={true}
        centerZoomedOut={true}
        limitToBounds={false}
        wheel={{ step: 0.15 }}
        pinch={{ step: 0.15 }}
        doubleClick={{ disabled: false }}
        alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
        onZoom={(e) => setZoom(parseFloat(e.state.scale.toFixed(1)))}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 30 }}>
              <div style={{ background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,191,255,0.4)', borderRadius: '8px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 0 25px rgba(0,191,255,0.3)' }}>
                <button onClick={() => zoomIn()} style={{ padding: '8px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,191,255,0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <ZoomIn style={{ width: '16px', height: '16px', color: '#00BFFF' }} />
                </button>
                <button onClick={() => zoomOut()} style={{ padding: '8px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,191,255,0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <ZoomOut style={{ width: '16px', height: '16px', color: '#00BFFF' }} />
                </button>
                <button onClick={() => resetTransform()} style={{ padding: '8px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,122,0,0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <RotateCcw style={{ width: '16px', height: '16px', color: '#FF7A00' }} />
                </button>
              </div>
            </div>

            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg viewBox="0 0 2000 1000" width="2000" height="1000" style={{ background: '#020817', display: 'block', imageRendering: 'crisp-edges' }}>
                {/* === WIREFRAME MAP IMAGE (HIGH QUALITY) === */}
                <image
                  href={worldWireframe}
                  x="0"
                  y="0"
                  width="2000"
                  height="1000"
                  preserveAspectRatio="xMidYMid meet"
                  opacity="0.9"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />

                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id="cyanGlow">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="1" />
                    <stop offset="50%" stopColor="#00BFFF" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#00BFFF" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="orangeGlow">
                    <stop offset="0%" stopColor="#FF7A00" stopOpacity="1" />
                    <stop offset="50%" stopColor="#FF6B35" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* ARCS */}
                {matches.map((m, i) => {
                  const load = loads.find(l => l.id === m.loadId);
                  const vehicle = vehicles.find(v => v.id === m.truckId);
                  if (!load || !vehicle) return null;
                  const lCoords = getCoords(load.origin);
                  const vCoords = getCoords(vehicle.location);
                  if (!lCoords || !vCoords) return null;
                  const color = m.matchScore >= 90 ? '#00E5FF' : m.matchScore >= 70 ? '#FF7A00' : '#FFD700';
                  const pathData = arcPath(lCoords.x, lCoords.y, vCoords.x, vCoords.y);
                  return (
                    <g key={i}>
                      <path d={pathData} stroke={color} strokeWidth="2.5" fill="none" opacity="0.7" strokeDasharray="8 6" filter="url(#glow)">
                        <animate attributeName="stroke-dashoffset" from="0" to="-140" dur="4s" repeatCount="indefinite" />
                      </path>
                      <circle r="6" fill={color} opacity="1" filter="url(#strongGlow)">
                        <animateMotion dur="3.5s" repeatCount="indefinite">
                          <mpath xlinkHref={`#arc-${i}`} />
                        </animateMotion>
                      </circle>
                      <path id={`arc-${i}`} d={pathData} fill="none" opacity="0" />
                    </g>
                  );
                })}

                {/* VEHICLE NODES */}
                {Object.entries(vehiclesByLocation).map(([key, vehs]) => {
                  const coords = getCoords(vehs[0].location);
                  if (!coords) return null;
                  const count = vehs.length;
                  const cityName = vehs[0].location.split(',')[0];
                  const isMatched = matchedKeys.has(key);
                  return (
                    <g 
                      key={key} 
                      style={{ cursor: 'pointer' }}
                      onMouseMove={(e) => {
                        setHoveredLocation({ vehicles: vehs, loads: loadsByLocation[key] || [], position: { x: e.clientX, y: e.clientY - 40 } });
                      }}
                      onMouseLeave={() => setHoveredLocation(null)}
                    >
                      <circle cx={coords.x} cy={coords.y} r="24" fill="none" stroke="#FF7A00" strokeWidth="2" opacity="0.3">
                        <animate attributeName="r" values="16;35;16" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={coords.x} cy={coords.y} r="18" fill="url(#orangeGlow)" opacity="0.6" />
                      <circle cx={coords.x} cy={coords.y} r="9" fill="#FF7A00" opacity="1" filter="url(#glow)">
                        {isMatched && <animate attributeName="r" values="9;14;9" dur="1.5s" repeatCount="indefinite" />}
                      </circle>
                      <circle cx={coords.x} cy={coords.y} r="5" fill="#FFB380" />
                      {count > 1 && (
                        <>
                          <circle cx={coords.x} cy={coords.y} r="20" fill="#FF7A00" opacity="0.9" />
                          <text x={coords.x} y={coords.y + 7} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">{count}</text>
                        </>
                      )}
                      {zoom >= 2 && (
                        <text x={coords.x} y={coords.y + 35} textAnchor="middle" fill="#FFB380" fontSize="14" fontWeight="600" filter="url(#glow)">
                          {cityName}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* LOAD NODES */}
                {Object.entries(loadsByLocation).map(([key, lods]) => {
                  const coords = getCoords(lods[0].origin);
                  if (!coords) return null;
                  const cityName = lods[0].origin.split(',')[0];
                  const isMatched = matchedKeys.has(key);
                  return (
                    <g 
                      key={key} 
                      style={{ cursor: 'pointer' }}
                      onMouseMove={(e) => {
                        setHoveredLocation({ vehicles: vehiclesByLocation[key] || [], loads: lods, position: { x: e.clientX, y: e.clientY - 40 } });
                      }}
                      onMouseLeave={() => setHoveredLocation(null)}
                    >
                      <circle cx={coords.x} cy={coords.y} r="24" fill="none" stroke="#00E5FF" strokeWidth="2" opacity="0.3">
                        <animate attributeName="r" values="16;35;16" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={coords.x} cy={coords.y} r="18" fill="url(#cyanGlow)" opacity="0.6" />
                      <circle cx={coords.x} cy={coords.y} r="9" fill="#00E5FF" opacity="1" filter="url(#glow)">
                        {isMatched && <animate attributeName="r" values="9;14;9" dur="1.5s" repeatCount="indefinite" />}
                      </circle>
                      <circle cx={coords.x} cy={coords.y} r="5" fill="#66F0FF" />
                      {zoom >= 2 && (
                        <text x={coords.x} y={coords.y + 35} textAnchor="middle" fill="#66F0FF" fontSize="14" fontWeight="600" filter="url(#glow)">
                          {cityName}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              </div>
            </TransformComponent>

            {/* Info bar */}
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', padding: '12px 20px', background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,191,255,0.4)', borderRadius: '8px', zIndex: 20, boxShadow: '0 0 30px rgba(0,191,255,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'white' }}>
                <span style={{ color: '#00E5FF', fontWeight: 500 }}>{Object.keys(loadsByLocation).length} loads</span>
                <div style={{ width: '1px', height: '16px', background: 'rgba(0,191,255,0.3)' }} />
                <span style={{ color: '#FF7A00', fontWeight: 500 }}>{Object.keys(vehiclesByLocation).length} locations</span>
                {matches.length > 0 && (
                  <>
                    <div style={{ width: '1px', height: '16px', background: 'rgba(0,191,255,0.3)' }} />
                    <span style={{ color: 'white', fontWeight: 600 }}>{matches.length} connections</span>
                  </>
                )}
                <div style={{ width: '1px', height: '16px', background: 'rgba(0,191,255,0.3)' }} />
                <span style={{ color: 'rgba(0,191,255,0.7)' }}>Zoom: {zoom.toFixed(1)}x</span>
              </div>
            </div>
          </>
        )}
      </TransformWrapper>

      {/* Hover Popup */}
      {hoveredLocation && (
        <LocationPopup
          vehicles={hoveredLocation.vehicles}
          loads={hoveredLocation.loads}
          position={hoveredLocation.position}
          onClose={() => setHoveredLocation(null)}
        />
      )}
    </div>
  );
};
