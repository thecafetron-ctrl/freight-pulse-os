import { GlassCard } from "@/components/GlassCard";
import { ArrowUpRight, TrendingUp, Package, DollarSign, Clock } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { label: "Active Shipments", value: "247", change: "+12%", icon: Package, color: "orange" },
    { label: "Quote Requests", value: "89", change: "+8%", icon: DollarSign, color: "cyan" },
    { label: "Match Rate", value: "94%", change: "+3%", icon: TrendingUp, color: "orange" },
    { label: "Avg Response Time", value: "2.3m", change: "-15%", icon: Clock, color: "cyan" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white">Operations Dashboard</h1>
          <p className="text-[hsl(var(--text-secondary))]">Real-time overview of your AI-powered logistics platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {stats.map((stat, index) => (
            <GlassCard 
              key={stat.label} 
              glow={stat.color as "orange" | "cyan"}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-[hsl(var(--text-secondary))]">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowUpRight className={`w-4 h-4 ${stat.change.startsWith('+') ? 'text-green-400' : 'text-green-400'}`} />
                    <span className="text-green-400">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.color === 'orange' ? 'bg-[hsl(var(--orange-glow))]/10' : 'bg-[hsl(var(--cyan-glow))]/10'}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color === 'orange' ? 'text-[hsl(var(--orange-glow))]' : 'text-[hsl(var(--cyan-glow))]'}`} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <GlassCard className="lg:col-span-2" glow="orange">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: "New quote generated", detail: "Chicago → Dallas, 42,000 lbs", time: "2 min ago", status: "success" },
                { action: "Load matched", detail: "Atlanta → Houston, Match: 97%", time: "5 min ago", status: "success" },
                { action: "Document processed", detail: "BOL_Chicago_Dallas.pdf", time: "8 min ago", status: "success" },
                { action: "AI forecast updated", detail: "Southeast corridor demand +18%", time: "12 min ago", status: "info" },
              ].map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="space-y-1">
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-sm text-[hsl(var(--text-secondary))]">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-[hsl(var(--text-secondary))]">{activity.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] text-white font-semibold hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] transition-all duration-300 hover:scale-105">
                Generate Quote
              </button>
              <button className="w-full p-4 rounded-xl border-2 border-[hsl(var(--cyan-glow))] text-[hsl(var(--cyan-glow))] font-semibold hover:bg-[hsl(var(--cyan-glow))] hover:text-[hsl(var(--navy-deep))] transition-all duration-300">
                Find Matches
              </button>
              <button className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300">
                Upload Document
              </button>
              <button className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300">
                View Analytics
              </button>
            </div>
          </GlassCard>
        </div>

        {/* System Status */}
        <GlassCard glow="orange">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">AI Systems Status</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))]">All systems operational</p>
            </div>
            <div className="flex items-center gap-6">
              {["Quote Engine", "Load Matcher", "Document AI", "Forecasting"].map((system) => (
                <div key={system} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-[hsl(var(--text-secondary))]">{system}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
