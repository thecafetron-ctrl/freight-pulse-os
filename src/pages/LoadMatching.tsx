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

              {/* Simplified Network Map */}
              <div className="relative h-full rounded-xl bg-gradient-to-br from-[hsl(var(--navy-panel))] to-[hsl(var(--navy-medium))] overflow-hidden">
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  {/* Network connections */}
                  <g opacity="0.4">
                    <line x1="150" y1="120" x2="450" y2="250" stroke="hsl(var(--cyan-glow))" strokeWidth="1" className="animate-pulse" />
                    <line x1="150" y1="120" x2="300" y2="200" stroke="hsl(var(--cyan-glow))" strokeWidth="1" className="animate-pulse" />
                    <line x1="300" y1="200" x2="550" y2="150" stroke="hsl(var(--cyan-glow))" strokeWidth="1" className="animate-pulse" />
                    <line x1="450" y1="250" x2="650" y2="180" stroke="hsl(var(--cyan-glow))" strokeWidth="1" className="animate-pulse" />
                  </g>
                  
                  {/* Cities */}
                  <g>
                    <circle cx="150" cy="120" r="8" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow" />
                    <text x="150" y="105" textAnchor="middle" fill="white" fontSize="12">Seattle</text>
                    
                    <circle cx="450" cy="250" r="8" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow" />
                    <text x="450" y="270" textAnchor="middle" fill="white" fontSize="12">Chicago</text>
                    
                    <circle cx="550" cy="150" r="8" fill="hsl(var(--orange-glow))" className="animate-pulse-glow" />
                    <text x="550" y="135" textAnchor="middle" fill="white" fontSize="12">New York</text>
                    
                    <circle cx="300" cy="200" r="8" fill="hsl(var(--orange-glow))" className="animate-pulse-glow" />
                    <text x="300" y="220" textAnchor="middle" fill="white" fontSize="12">San Francisco</text>
                    
                    <circle cx="450" cy="320" r="8" fill="hsl(var(--orange-glow))" className="animate-pulse-glow" />
                    <text x="450" y="340" textAnchor="middle" fill="white" fontSize="12">Houston</text>
                    
                    <circle cx="500" cy="280" r="8" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow" />
                    <text x="500" y="300" textAnchor="middle" fill="white" fontSize="12">Atlanta</text>
                  </g>
                </svg>
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
