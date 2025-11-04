import { GlassCard } from "@/components/GlassCard";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Forecasting = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white">AI Demand Forecasting</h1>
          <p className="text-[hsl(var(--text-secondary))]">Predictive analytics for shipment volumes and lane rates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <GlassCard className="space-y-4" glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">Forecast Filters</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Region</label>
                <Select>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="southeast">Southeast</SelectItem>
                    <SelectItem value="midwest">Midwest</SelectItem>
                    <SelectItem value="west">West Coast</SelectItem>
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
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Time Range</label>
                <Select>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Next Week</SelectItem>
                    <SelectItem value="month">Next Month</SelectItem>
                    <SelectItem value="quarter">Next Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-[hsl(var(--text-secondary))] mb-2 block">Lane</label>
                <Select>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select lane" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chi-dal">Chicago → Dallas</SelectItem>
                    <SelectItem value="atl-hou">Atlanta → Houston</SelectItem>
                    <SelectItem value="la-phx">LA → Phoenix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--orange-glow))]/10 to-[hsl(var(--cyan-glow))]/10 border border-[hsl(var(--orange-glow))]/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[hsl(var(--orange-glow))]" />
                <span className="text-sm text-white font-medium">AI Confidence</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-white">94.2%</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[hsl(var(--orange-glow))] to-green-400 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
          </GlassCard>

          {/* Main Chart */}
          <GlassCard className="lg:col-span-2 space-y-4" glow="orange">
            <h3 className="text-xl font-bold text-white mb-4">Demand & Rate Trends</h3>
            
            {/* Chart placeholder */}
            <div className="h-[400px] rounded-xl bg-gradient-to-br from-[hsl(var(--navy-panel))] to-[hsl(var(--navy-medium))] p-6 relative overflow-hidden">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full" opacity="0.1">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Chart */}
              <svg viewBox="0 0 600 300" className="w-full h-full relative z-10">
                {/* Volume bars */}
                <g opacity="0.6">
                  <rect x="50" y="180" width="40" height="80" fill="hsl(var(--cyan-glow))" rx="4" />
                  <rect x="120" y="150" width="40" height="110" fill="hsl(var(--cyan-glow))" rx="4" />
                  <rect x="190" y="130" width="40" height="130" fill="hsl(var(--cyan-glow))" rx="4" />
                  <rect x="260" y="110" width="40" height="150" fill="hsl(var(--cyan-glow))" rx="4" className="animate-pulse" />
                  <rect x="330" y="140" width="40" height="120" fill="hsl(var(--cyan-glow))" opacity="0.5" rx="4" />
                  <rect x="400" y="160" width="40" height="100" fill="hsl(var(--cyan-glow))" opacity="0.5" rx="4" />
                </g>

                {/* Rate trend line */}
                <path
                  d="M 70 200 L 140 180 L 210 150 L 280 120 L 350 140 L 420 165"
                  fill="none"
                  stroke="hsl(var(--orange-glow))"
                  strokeWidth="3"
                  className="animate-pulse"
                />
                
                {/* Data points */}
                <circle cx="70" cy="200" r="5" fill="hsl(var(--orange-glow))" />
                <circle cx="140" cy="180" r="5" fill="hsl(var(--orange-glow))" />
                <circle cx="210" cy="150" r="5" fill="hsl(var(--orange-glow))" />
                <circle cx="280" cy="120" r="5" fill="hsl(var(--orange-glow))" className="animate-pulse-glow" />
                <circle cx="350" cy="140" r="5" fill="hsl(var(--orange-glow))" opacity="0.5" />
                <circle cx="420" cy="165" r="5" fill="hsl(var(--orange-glow))" opacity="0.5" />

                {/* Labels */}
                <text x="70" y="280" textAnchor="middle" fill="white" fontSize="10">Week 1</text>
                <text x="140" y="280" textAnchor="middle" fill="white" fontSize="10">Week 2</text>
                <text x="210" y="280" textAnchor="middle" fill="white" fontSize="10">Week 3</text>
                <text x="280" y="280" textAnchor="middle" fill="white" fontSize="10">Week 4</text>
                <text x="350" y="280" textAnchor="middle" fill="white" fontSize="10" opacity="0.5">Week 5</text>
                <text x="420" y="280" textAnchor="middle" fill="white" fontSize="10" opacity="0.5">Week 6</text>
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[hsl(var(--cyan-glow))]" />
                  <span className="text-white">Volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--orange-glow))]" />
                  <span className="text-white">Rate</span>
                </div>
              </div>
            </div>

            {/* Historical Accuracy */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">Last Week</p>
                <p className="text-lg font-bold text-white">96.2%</p>
                <p className="text-xs text-green-400">Accurate</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">Last Month</p>
                <p className="text-lg font-bold text-white">94.8%</p>
                <p className="text-xs text-green-400">Accurate</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">Last Quarter</p>
                <p className="text-lg font-bold text-white">93.1%</p>
                <p className="text-xs text-green-400">Accurate</p>
              </div>
            </div>
          </GlassCard>

          {/* Insights Panel */}
          <GlassCard className="space-y-4" glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">AI Insights</h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-400/10 to-green-400/5 border border-green-400/20">
                <div className="flex items-start gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm mb-1">Volume Increase</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">Predicted +18% demand in Southeast corridors next week</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-xs text-green-400">High confidence</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--orange-glow))]/10 to-[hsl(var(--orange-glow))]/5 border border-[hsl(var(--orange-glow))]/20">
                <div className="flex items-start gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-[hsl(var(--orange-glow))] mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm mb-1">Rate Adjustment</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">Chicago-Dallas rates expected to rise 8-12% due to capacity constraints</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(var(--orange-glow))] rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-xs text-[hsl(var(--orange-glow))]">High confidence</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--cyan-glow))]/10 to-[hsl(var(--cyan-glow))]/5 border border-[hsl(var(--cyan-glow))]/20">
                <div className="flex items-start gap-3 mb-2">
                  <Activity className="w-5 h-5 text-[hsl(var(--cyan-glow))] mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm mb-1">Seasonal Pattern</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">West Coast lanes showing typical Q4 volume spike patterns</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(var(--cyan-glow))] rounded-full" style={{ width: '92%' }} />
                  </div>
                  <span className="text-xs text-[hsl(var(--cyan-glow))]">Very high</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20">
                <div className="flex items-start gap-3 mb-2">
                  <TrendingDown className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm mb-1">Opportunity Alert</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">Flatbed capacity expected to exceed demand in Midwest - favorable rates</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <span className="text-xs text-yellow-400">Medium</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;
