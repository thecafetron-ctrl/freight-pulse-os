import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { MapPin, Navigation, TrendingUp, Fuel, Clock, Leaf, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const RoutePlanning = () => {
  const [waypoints, setWaypoints] = useState([
    { id: 1, city: "Chicago, IL" },
    { id: 2, city: "Indianapolis, IN" },
    { id: 3, city: "Columbus, OH" },
  ]);

  const routes = [
    { name: "Route A - Shortest", distance: "487 mi", eta: "7h 24m", cost: "$342", efficiency: 89 },
    { name: "Route B - Cheapest", distance: "512 mi", eta: "8h 12m", cost: "$298", efficiency: 94 },
    { name: "Route C - AI Optimized", distance: "495 mi", eta: "7h 45m", cost: "$315", efficiency: 97 },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white relative inline-block">
            AI Route Planning
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--cyan-glow))] rounded-full shadow-[0_0_15px_rgba(255,122,0,0.6)]" />
          </h1>
          <p className="text-[hsl(var(--text-secondary))]">Plan, optimize, and visualize delivery routes with real-time AI intelligence</p>
          
          {/* KPI Badges */}
          <div className="flex gap-4 pt-4">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-[hsl(var(--orange-glow))]/30">
              <span className="text-xs text-[hsl(var(--text-secondary))]">Avg Optimization Time: </span>
              <span className="text-sm font-bold text-[hsl(var(--orange-glow))]">3.2s</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-[hsl(var(--cyan-glow))]/30">
              <span className="text-xs text-[hsl(var(--text-secondary))]">Fuel Saved This Week: </span>
              <span className="text-sm font-bold text-[hsl(var(--cyan-glow))]">14%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Route Inputs */}
          <GlassCard className="lg:col-span-1 space-y-4" glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">Route Inputs</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Origin</label>
                <Input 
                  placeholder="Enter pickup location"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  defaultValue="Chicago, IL"
                />
              </div>

              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Waypoints</label>
                <div className="space-y-2">
                  {waypoints.map((waypoint, index) => (
                    <div key={waypoint.id} className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
                      <Input 
                        placeholder={`Stop ${index + 1}`}
                        className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/30"
                        defaultValue={waypoint.city}
                      />
                    </div>
                  ))}
                </div>
                <button className="mt-2 flex items-center gap-2 text-sm text-[hsl(var(--cyan-glow))] hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Waypoint
                </button>
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
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Optimize For</label>
                <Select defaultValue="balanced">
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Fastest Time</SelectItem>
                    <SelectItem value="cost">Lowest Cost</SelectItem>
                    <SelectItem value="fuel">Fuel Efficiency</SelectItem>
                    <SelectItem value="balanced">AI Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <GlowButton variant="primary" className="w-full mt-6">
                Generate Optimal Route
              </GlowButton>
            </div>
          </GlassCard>

          {/* Center Panel - Interactive Map */}
          <GlassCard className="lg:col-span-2 h-[600px] relative" glow="orange">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Route Visualization</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                  Traffic View
                </button>
                <button className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                  Weather Overlay
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative h-full rounded-xl bg-gradient-to-br from-[hsl(var(--navy-panel))] to-[hsl(var(--navy-medium))] overflow-hidden">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                {/* Route paths with different colors */}
                <g opacity="0.6">
                  {/* Orange - Fastest */}
                  <path 
                    d="M 150 250 Q 250 200, 350 240 T 550 260 L 650 240" 
                    fill="none" 
                    stroke="hsl(var(--orange-glow))" 
                    strokeWidth="3"
                    className="animate-pulse"
                    strokeDasharray="5,5"
                  />
                  {/* Blue - Most Efficient */}
                  <path 
                    d="M 150 250 Q 250 280, 350 270 T 550 290 L 650 280" 
                    fill="none" 
                    stroke="hsl(var(--cyan-glow))" 
                    strokeWidth="3"
                    opacity="0.5"
                  />
                  {/* Teal - AI Optimized (main route) */}
                  <path 
                    d="M 150 250 Q 250 240, 350 255 T 550 275 L 650 260" 
                    fill="none" 
                    stroke="#00FFB3" 
                    strokeWidth="4"
                    className="animate-pulse-glow"
                  />
                </g>
                
                {/* Location markers */}
                <g>
                  {/* Origin - Chicago */}
                  <circle cx="150" cy="250" r="10" fill="hsl(var(--orange-glow))" className="animate-pulse-glow" />
                  <circle cx="150" cy="250" r="16" fill="none" stroke="hsl(var(--orange-glow))" strokeWidth="2" opacity="0.4" />
                  <text x="150" y="230" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Chicago</text>
                  
                  {/* Waypoint 1 - Indianapolis */}
                  <circle cx="350" cy="255" r="8" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow" />
                  <circle cx="350" cy="255" r="14" fill="none" stroke="hsl(var(--cyan-glow))" strokeWidth="2" opacity="0.3" />
                  <text x="350" y="235" textAnchor="middle" fill="white" fontSize="12">Indianapolis</text>
                  
                  {/* Waypoint 2 - Columbus */}
                  <circle cx="550" cy="275" r="8" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow" />
                  <circle cx="550" cy="275" r="14" fill="none" stroke="hsl(var(--cyan-glow))" strokeWidth="2" opacity="0.3" />
                  <text x="550" y="255" textAnchor="middle" fill="white" fontSize="12">Columbus</text>
                  
                  {/* Destination */}
                  <circle cx="650" cy="260" r="10" fill="#00FFB3" className="animate-pulse-glow" />
                  <circle cx="650" cy="260" r="16" fill="none" stroke="#00FFB3" strokeWidth="2" opacity="0.4" />
                  <text x="650" y="240" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Cleveland</text>
                </g>

                {/* Animated truck icon */}
                <g className="animate-pulse">
                  <circle cx="350" cy="255" r="6" fill="white" opacity="0.9" />
                </g>
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-[hsl(var(--navy-deep))]/80 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--orange-glow))]" />
                    <span className="text-white">Fastest Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--cyan-glow))]" />
                    <span className="text-white">Fuel Efficient</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00FFB3]" />
                    <span className="text-white">AI Optimized</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Right Panel - AI Insights */}
          <GlassCard className="lg:col-span-1 space-y-4" glow="orange">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">AI Route Insights</h3>
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--orange-glow))] animate-pulse-glow" />
            </div>

            {/* AI Summary Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-[hsl(var(--orange-glow))]/30 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-5 h-5 text-[hsl(var(--orange-glow))]" />
                <span className="font-semibold text-white">AI Route Summary</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">Total Distance</p>
                  <p className="text-lg font-bold text-white">495 mi</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">ETA</p>
                  <p className="text-lg font-bold text-white">7h 45m</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">Fuel Cost</p>
                  <p className="text-lg font-bold text-[hsl(var(--orange-glow))]">$315</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">CO₂ Savings</p>
                  <p className="text-lg font-bold text-[hsl(var(--cyan-glow))]">12%</p>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
                <span className="text-sm font-semibold text-white">AI Suggestions</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--cyan-glow))] mt-1.5" />
                  <p className="text-[hsl(var(--text-secondary))]">Alternative route via I-80 saves 15 minutes during peak hours</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                  <p className="text-[hsl(var(--text-secondary))]">Light traffic expected on I-70 through Columbus</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--orange-glow))] mt-1.5" />
                  <p className="text-[hsl(var(--text-secondary))]">Weather alert: Light rain forecast near Indianapolis</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--orange-glow))]" />
                <p className="text-xs text-[hsl(var(--text-secondary))]">Time</p>
                <p className="text-sm font-bold text-white">97%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Fuel className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--cyan-glow))]" />
                <p className="text-xs text-[hsl(var(--text-secondary))]">Fuel</p>
                <p className="text-sm font-bold text-white">94%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Leaf className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-[hsl(var(--text-secondary))]">Eco</p>
                <p className="text-sm font-bold text-white">96%</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <GlowButton variant="primary" className="w-full">
                Save Route
              </GlowButton>
              <GlowButton variant="outline" className="w-full">
                Send to Dispatcher
              </GlowButton>
              <button className="w-full px-4 py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors">
                Export to TMS
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Bottom Panel - Route Comparison */}
        <GlassCard glow="cyan">
          <h3 className="text-lg font-bold text-white mb-4">Route Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routes.map((route, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                  index === 2 
                    ? 'bg-gradient-to-br from-[hsl(var(--orange-glow))]/10 to-[hsl(var(--cyan-glow))]/10 border-[hsl(var(--orange-glow))]/50' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">{route.name}</span>
                  {index === 2 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-[hsl(var(--orange-glow))] text-white">
                      Recommended
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">Distance</p>
                    <p className="font-semibold text-white">{route.distance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">ETA</p>
                    <p className="font-semibold text-white">{route.eta}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">Cost</p>
                    <p className="font-semibold text-[hsl(var(--orange-glow))]">{route.cost}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">Efficiency</p>
                    <p className="font-semibold text-[hsl(var(--cyan-glow))]">{route.efficiency}%</p>
                  </div>
                </div>

                <button className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                  index === 2
                    ? 'bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] text-white hover:shadow-[0_0_20px_rgba(255,122,0,0.4)]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                  Select Route
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RoutePlanning;
