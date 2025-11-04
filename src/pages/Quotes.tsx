import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Bot, MapPin, TrendingUp } from "lucide-react";
import { useState } from "react";

const Quotes = () => {
  const [userQuery, setUserQuery] = useState("Need a quote for 3 pallets from Chicago to Dallas, pickup tomorrow.");

  const recentQuotes = [
    { route: "Atlanta to New York", price: "$360" },
    { route: "Los Angeles to Denver", price: "$1,530" },
    { route: "Memphis to Seattle", price: "$2,210" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white">AI Quote Generator</h1>
          <p className="text-[hsl(var(--text-secondary))]">Instant freight quotes powered by AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Quote Assistant */}
          <GlassCard className="lg:col-span-2 space-y-6" glow="orange">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-[hsl(var(--orange-glow))]/10">
                <Bot className="w-6 h-6 text-[hsl(var(--orange-glow))]" />
              </div>
              <h2 className="text-2xl font-bold text-white">AI Quote Assistant</h2>
            </div>

            {/* Chat Interface */}
            <div className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] p-4 rounded-2xl bg-[hsl(var(--navy-deep))] border border-white/10">
                  <p className="text-white">{userQuery}</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-[hsl(var(--orange-glow))]/30 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-[hsl(var(--text-secondary))]">Freight Cost</p>
                      <p className="text-2xl font-bold text-white">$1,240</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[hsl(var(--text-secondary))]">Transit Time</p>
                      <p className="text-2xl font-bold text-white">2 days</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[hsl(var(--text-secondary))]">Carrier</p>
                      <p className="text-lg font-medium text-white">FastLine Logistics</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[hsl(var(--text-secondary))]">ETA</p>
                      <p className="text-lg font-medium text-white">Nov 5, 2025</p>
                    </div>
                  </div>

                  <GlowButton className="w-full" variant="primary">
                    Book Shipment
                  </GlowButton>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ask for a quote..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--orange-glow))] focus:ring-2 focus:ring-[hsl(var(--orange-glow))]/20 transition-all"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
              <GlowButton variant="primary">
                Generate
              </GlowButton>
            </div>
          </GlassCard>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Quotes */}
            <GlassCard glow="cyan">
              <h3 className="text-xl font-bold text-white mb-4">Recent Quotes</h3>
              <div className="space-y-3">
                {recentQuotes.map((quote, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm">{quote.route}</p>
                      <p className="text-[hsl(var(--orange-glow))] font-semibold">{quote.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Mini Map */}
            <GlassCard glow="orange">
              <h3 className="text-xl font-bold text-white mb-4">Route Visualization</h3>
              <div className="relative aspect-square rounded-xl bg-gradient-to-br from-[hsl(var(--navy-panel))] to-[hsl(var(--navy-medium))] overflow-hidden">
                {/* Simplified map visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 300 200" className="w-full h-full opacity-60">
                    {/* Route line */}
                    <path
                      d="M 50 100 Q 150 50 250 120"
                      fill="none"
                      stroke="hsl(var(--orange-glow))"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    {/* Start point */}
                    <circle cx="50" cy="100" r="6" fill="hsl(var(--cyan-glow))" />
                    {/* End point */}
                    <circle cx="250" cy="120" r="6" fill="hsl(var(--orange-glow))" />
                  </svg>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white">
                  <MapPin className="w-3 h-3" />
                  <span>Chicago → Dallas</span>
                </div>
              </div>
            </GlassCard>

            {/* Stats */}
            <GlassCard>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Quote Accuracy</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-1">96.8%</p>
              <p className="text-sm text-[hsl(var(--text-secondary))]">AI confidence score</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quotes;
