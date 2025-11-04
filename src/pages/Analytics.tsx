import { GlassCard } from "@/components/GlassCard";
import { BarChart3, TrendingUp, DollarSign, Zap } from "lucide-react";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white">AI Analytics Hub</h1>
          <p className="text-[hsl(var(--text-secondary))]">Comprehensive performance metrics and AI system insights</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard glow="orange" className="animate-slide-in">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[hsl(var(--text-secondary))]">Avg Freight Cost</p>
                <p className="text-3xl font-bold text-white">$1,847</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">-8.2%</span>
                  <span className="text-[hsl(var(--text-secondary))]">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[hsl(var(--orange-glow))]/10">
                <DollarSign className="w-6 h-6 text-[hsl(var(--orange-glow))]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard glow="cyan" className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[hsl(var(--text-secondary))]">Match Accuracy</p>
                <p className="text-3xl font-bold text-white">96.4%</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+2.1%</span>
                  <span className="text-[hsl(var(--text-secondary))]">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[hsl(var(--cyan-glow))]/10">
                <BarChart3 className="w-6 h-6 text-[hsl(var(--cyan-glow))]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard glow="orange" className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[hsl(var(--text-secondary))]">Processing Time</p>
                <p className="text-3xl font-bold text-white">2.4m</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">-22%</span>
                  <span className="text-[hsl(var(--text-secondary))]">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[hsl(var(--orange-glow))]/10">
                <Zap className="w-6 h-6 text-[hsl(var(--orange-glow))]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard glow="cyan" className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[hsl(var(--text-secondary))]">AI ROI</p>
                <p className="text-3xl font-bold text-white">342%</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+18%</span>
                  <span className="text-[hsl(var(--text-secondary))]">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[hsl(var(--cyan-glow))]/10">
                <TrendingUp className="w-6 h-6 text-[hsl(var(--cyan-glow))]" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Trends */}
          <GlassCard glow="orange">
            <h3 className="text-xl font-bold text-white mb-4">Shipment Volume Trends</h3>
            <div className="h-[300px] rounded-xl bg-gradient-to-br from-[hsl(var(--navy-panel))] to-[hsl(var(--navy-medium))] p-4 relative overflow-hidden">
              <svg viewBox="0 0 500 250" className="w-full h-full">
                {/* Area chart */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--orange-glow))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--orange-glow))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                <path
                  d="M 0 200 L 50 180 L 100 150 L 150 160 L 200 130 L 250 140 L 300 110 L 350 120 L 400 90 L 450 100 L 500 80 L 500 250 L 0 250 Z"
                  fill="url(#areaGradient)"
                />
                
                <path
                  d="M 0 200 L 50 180 L 100 150 L 150 160 L 200 130 L 250 140 L 300 110 L 350 120 L 400 90 L 450 100 L 500 80"
                  fill="none"
                  stroke="hsl(var(--orange-glow))"
                  strokeWidth="2"
                />

                {/* Grid */}
                <g opacity="0.1">
                  <line x1="0" y1="50" x2="500" y2="50" stroke="white" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="white" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="white" strokeWidth="1" />
                  <line x1="0" y1="200" x2="500" y2="200" stroke="white" strokeWidth="1" />
                </g>
              </svg>
            </div>
          </GlassCard>

          {/* System Performance */}
          <GlassCard glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">AI System Performance</h3>
            <div className="h-[300px] rounded-xl bg-gradient-to-br from-[hsl(var(--navy-panel))] to-[hsl(var(--navy-medium))] p-4 relative">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Donut chart */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                
                {/* Quote Engine - 25% */}
                <circle 
                  cx="100" cy="100" r="70" 
                  fill="none" 
                  stroke="hsl(var(--orange-glow))" 
                  strokeWidth="20"
                  strokeDasharray="110 440"
                  transform="rotate(-90 100 100)"
                />
                
                {/* Load Matcher - 30% */}
                <circle 
                  cx="100" cy="100" r="70" 
                  fill="none" 
                  stroke="hsl(var(--cyan-glow))" 
                  strokeWidth="20"
                  strokeDasharray="132 440"
                  strokeDashoffset="-110"
                  transform="rotate(-90 100 100)"
                />
                
                {/* Document AI - 25% */}
                <circle 
                  cx="100" cy="100" r="70" 
                  fill="none" 
                  stroke="rgb(34, 197, 94)" 
                  strokeWidth="20"
                  strokeDasharray="110 440"
                  strokeDashoffset="-242"
                  transform="rotate(-90 100 100)"
                />
                
                {/* Forecasting - 20% */}
                <circle 
                  cx="100" cy="100" r="70" 
                  fill="none" 
                  stroke="rgb(250, 204, 21)" 
                  strokeWidth="20"
                  strokeDasharray="88 440"
                  strokeDashoffset="-352"
                  transform="rotate(-90 100 100)"
                />

                {/* Center text */}
                <text x="100" y="95" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">98.2%</text>
                <text x="100" y="115" textAnchor="middle" fill="hsl(var(--text-secondary))" fontSize="10">Uptime</text>
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--orange-glow))]" />
                  <span className="text-white">Quote Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--cyan-glow))]" />
                  <span className="text-white">Load Matcher</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-white">Document AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-white">Forecasting</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* AI Insights */}
        <GlassCard glow="orange">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">AI System Insights</h3>
            <div className="px-4 py-2 rounded-lg bg-green-400/10 border border-green-400/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-green-400 font-medium">All Systems Operational</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-white font-medium">Quote Accuracy</span>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))]">+12% improvement this week</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-white font-medium">Processing Speed</span>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Documents 40% faster</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-white font-medium">Learning Mode</span>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Continuous optimization active</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;
