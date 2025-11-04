import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { MapPin, Truck, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LoadMatching = () => {
  const matches = [
    { origin: "Chicago", destination: "Dallas", originWeight: "42,000 lbs", destWeight: "42,000 lbs", type: "Dry Van", score: 97 },
    { origin: "Atlanta", destination: "Houston", originWeight: "38,000 lbs", destWeight: "44,000 lbs", type: "Reefer", score: 93 },
    { origin: "Newark", destination: "Columbus", originWeight: "44,000 lbs", destWeight: "34,000 lbs", type: "Flatbed", score: 90 },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white">AI Load Matching</h1>
          <p className="text-[hsl(var(--text-secondary))]">Intelligent load-to-truck matching with AI scoring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <GlassCard className="lg:col-span-1 space-y-4" glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">AI Match Filters</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Origin City</label>
                <Select>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="atlanta">Atlanta</SelectItem>
                    <SelectItem value="seattle">Seattle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Destination City</label>
                <Select>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dallas">Dallas</SelectItem>
                    <SelectItem value="houston">Houston</SelectItem>
                    <SelectItem value="phoenix">Phoenix</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Equipment Type</label>
                <Select>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dryvan">Dry Van</SelectItem>
                    <SelectItem value="reefer">Reefer</SelectItem>
                    <SelectItem value="flatbed">Flatbed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Weight Range</label>
                <Select>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Under 20,000 lbs</SelectItem>
                    <SelectItem value="medium">20,000 - 40,000 lbs</SelectItem>
                    <SelectItem value="heavy">Over 40,000 lbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Distance Radius</label>
                <Select>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 miles</SelectItem>
                    <SelectItem value="100">100 miles</SelectItem>
                    <SelectItem value="200">200 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <GlowButton variant="primary" className="w-full mt-4">
                Find Matches
              </GlowButton>
            </div>
          </GlassCard>

          {/* Map & Matches */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Map */}
            <GlassCard glow="orange" className="h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">AI Auto Matching</h3>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
                    <span className="text-[hsl(var(--text-secondary))]">Available Loads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[hsl(var(--orange-glow))]" />
                    <span className="text-[hsl(var(--text-secondary))]">Available Trucks</span>
                  </div>
                </div>
              </div>

              {/* Interactive Globe Map */}
              <div className="relative h-full rounded-xl overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1a2742] to-[#0f1929]">
                {/* Stars background */}
                <div className="absolute inset-0">
                  {[...Array(50)].map((_, i) => (
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

                {/* Globe/Earth simulation */}
                <svg viewBox="0 0 800 400" className="w-full h-full relative z-10">
                  <defs>
                    {/* Gradient for ocean */}
                    <radialGradient id="oceanGradient" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#1e3a5f" />
                      <stop offset="100%" stopColor="#0a1628" />
                    </radialGradient>
                    {/* Glow effect */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Ocean/Earth base */}
                  <ellipse cx="400" cy="200" rx="350" ry="180" fill="url(#oceanGradient)" opacity="0.3" />
                  
                  {/* Latitude/longitude grid lines */}
                  <g opacity="0.15" stroke="#00E6FF" strokeWidth="0.5">
                    <ellipse cx="400" cy="200" rx="350" ry="180" fill="none" />
                    <ellipse cx="400" cy="200" rx="350" ry="120" fill="none" />
                    <ellipse cx="400" cy="200" rx="350" ry="60" fill="none" />
                    <ellipse cx="400" cy="200" rx="280" ry="180" fill="none" />
                    <ellipse cx="400" cy="200" rx="210" ry="180" fill="none" />
                    <ellipse cx="400" cy="200" rx="140" ry="180" fill="none" />
                    <ellipse cx="400" cy="200" rx="70" ry="180" fill="none" />
                  </g>

                  {/* Animated network connections across globe */}
                  <g opacity="0.6" filter="url(#glow)">
                    <line x1="200" y1="180" x2="380" y2="220" stroke="hsl(var(--cyan-glow))" strokeWidth="1.5" className="animate-pulse" strokeDasharray="4,4">
                      <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite" />
                    </line>
                    <line x1="200" y1="180" x2="300" y2="240" stroke="hsl(var(--cyan-glow))" strokeWidth="1.5" className="animate-pulse" strokeDasharray="4,4">
                      <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1.2s" repeatCount="indefinite" />
                    </line>
                    <line x1="300" y1="240" x2="520" y2="160" stroke="hsl(var(--cyan-glow))" strokeWidth="1.5" className="animate-pulse" strokeDasharray="4,4">
                      <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1.1s" repeatCount="indefinite" />
                    </line>
                    <line x1="380" y1="220" x2="580" y2="190" stroke="hsl(var(--orange-glow))" strokeWidth="2" className="animate-pulse" strokeDasharray="4,4">
                      <animate attributeName="stroke-dashoffset" from="0" to="8" dur="0.9s" repeatCount="indefinite" />
                    </line>
                    <line x1="520" y1="160" x2="600" y2="200" stroke="hsl(var(--orange-glow))" strokeWidth="2" className="animate-pulse" strokeDasharray="4,4">
                      <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite" />
                    </line>
                  </g>
                  
                  {/* Major cities/nodes on map */}
                  <g filter="url(#glow)">
                    {/* West Coast - Seattle/San Francisco */}
                    <circle cx="200" cy="180" r="6" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow">
                      <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="200" cy="180" r="12" fill="none" stroke="hsl(var(--cyan-glow))" strokeWidth="1" opacity="0.3" />
                    <text x="200" y="170" textAnchor="middle" fill="white" fontSize="11" fontWeight="500">Seattle</text>
                    
                    {/* Midwest - Chicago */}
                    <circle cx="380" cy="220" r="6" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow">
                      <animate attributeName="r" values="6;8;6" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="380" cy="220" r="12" fill="none" stroke="hsl(var(--cyan-glow))" strokeWidth="1" opacity="0.3" />
                    <text x="380" y="240" textAnchor="middle" fill="white" fontSize="11" fontWeight="500">Chicago</text>
                    
                    {/* East Coast - New York */}
                    <circle cx="520" cy="160" r="7" fill="hsl(var(--orange-glow))" className="animate-pulse-glow">
                      <animate attributeName="r" values="7;9;7" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="520" cy="160" r="14" fill="none" stroke="hsl(var(--orange-glow))" strokeWidth="1.5" opacity="0.4" />
                    <text x="520" y="145" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">New York</text>
                    
                    {/* Southwest */}
                    <circle cx="300" cy="240" r="6" fill="hsl(var(--orange-glow))" className="animate-pulse-glow">
                      <animate attributeName="r" values="6;8;6" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <text x="300" y="260" textAnchor="middle" fill="white" fontSize="10">Phoenix</text>
                    
                    {/* South - Houston */}
                    <circle cx="380" cy="280" r="6" fill="hsl(var(--orange-glow))" className="animate-pulse-glow">
                      <animate attributeName="r" values="6;8;6" dur="2.1s" repeatCount="indefinite" />
                    </circle>
                    <text x="380" y="300" textAnchor="middle" fill="white" fontSize="10">Houston</text>
                    
                    {/* Southeast - Atlanta */}
                    <circle cx="460" cy="250" r="6" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow">
                      <animate attributeName="r" values="6;8;6" dur="1.9s" repeatCount="indefinite" />
                    </circle>
                    <text x="460" y="270" textAnchor="middle" fill="white" fontSize="10">Atlanta</text>

                    {/* Northeast - Boston */}
                    <circle cx="580" cy="190" r="5" fill="hsl(var(--orange-glow))" className="animate-pulse-glow">
                      <animate attributeName="r" values="5;7;5" dur="2.3s" repeatCount="indefinite" />
                    </circle>
                    <text x="580" y="180" textAnchor="middle" fill="white" fontSize="10">Boston</text>
                  </g>

                  {/* Traveling data packets/trucks */}
                  <g>
                    <circle r="3" fill="white" opacity="0.9">
                      <animateMotion dur="8s" repeatCount="indefinite" path="M 200 180 Q 290 200, 380 220" />
                    </circle>
                    <circle r="3" fill="white" opacity="0.9">
                      <animateMotion dur="6s" repeatCount="indefinite" path="M 520 160 Q 450 205, 380 220" />
                    </circle>
                  </g>
                </svg>

                {/* Control hint */}
                <div className="absolute bottom-4 right-4 px-3 py-2 rounded-lg bg-[hsl(var(--navy-deep))]/70 backdrop-blur-sm border border-white/10 text-xs text-[hsl(var(--text-secondary))]">
                  <p>Interactive map view • AI real-time matching</p>
                </div>
              </div>
            </GlassCard>

            {/* Selected Match Details */}
            <GlassCard glow="orange">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-[hsl(var(--cyan-glow))]" />
                  <span className="text-white font-medium">Available Loads</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[hsl(var(--orange-glow))]" />
                  <span className="text-white font-medium">Available Trucks</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 rounded-xl bg-white/5 border border-[hsl(var(--orange-glow))]/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(var(--text-secondary))]">Chicago</span>
                    <span className="text-white">→</span>
                    <span className="text-white font-semibold">Dallas</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">42,000 lbs • Dry Van</p>
                </div>
                <div className="space-y-3 text-right">
                  <p className="text-2xl font-bold text-white">42,000 lbs</p>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">DryFer</p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[hsl(var(--text-secondary))]">Match Score</span>
                    <span className="text-lg font-bold text-[hsl(var(--orange-glow))]">97%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] rounded-full" style={{ width: '97%' }} />
                  </div>
                </div>
                <GlowButton variant="primary" className="col-span-2">
                  Book Load
                </GlowButton>
              </div>
            </GlassCard>
          </div>

          {/* Suggested Matches */}
          <GlassCard className="lg:col-span-1 space-y-4" glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">Suggested Matches</h3>
            
            <div className="space-y-3">
              {matches.map((match, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[hsl(var(--orange-glow))]/30 transition-all cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white">{match.origin}</span>
                      <span className="text-[hsl(var(--text-secondary))]">→</span>
                      <span className="text-white font-medium">{match.destination}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[hsl(var(--text-secondary))]">
                      <span>{match.originWeight}</span>
                      <span>{match.destWeight}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[hsl(var(--text-secondary))]">{match.type}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[hsl(var(--text-secondary))]">Match score</span>
                        <span className="text-sm font-bold text-[hsl(var(--orange-glow))]">{match.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <GlowButton variant="outline" className="w-full">
              View Details
            </GlowButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LoadMatching;
