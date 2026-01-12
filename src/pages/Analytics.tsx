import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GlassCard } from "@/components/GlassCard";
import { getJson } from "@/lib/api";
import type { AnalyticsSnapshot, AnalyticsKPI } from "@/types/analytics";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getFallbackAnalyticsSnapshot } from "@/data/insightsFallback";

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsSnapshot;
}

const subsystemColors = ["#38bdf8", "#f97316", "#22c55e", "#facc15"];

const formatValue = (kpi: AnalyticsKPI): string => {
  if (kpi.unit === "usd") {
    return `$${kpi.value.toLocaleString()}`;
  }
  if (kpi.unit === "minutes") {
    return `${kpi.value.toFixed(1)}m`;
  }
  return `${kpi.value.toFixed(1)}%`;
};

const Analytics = () => {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const dataRef = useRef<AnalyticsSnapshot | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await getJson<AnalyticsResponse>("/api/insights/analytics");
      if (!payload.success) {
        throw new Error("Failed to load analytics");
      }
      setData(payload.data);
       dataRef.current = payload.data;
      setError(null);
      setUsingFallback(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error loading analytics";
      setError(message);
      if (!dataRef.current) {
        const fallback = getFallbackAnalyticsSnapshot();
        dataRef.current = fallback;
        setData(fallback);
        setUsingFallback(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const kpis = useMemo(() => {
    if (!data) {
      return [];
    }
    return [
      {
        label: "Avg Freight Cost",
        glow: "orange" as const,
        iconColor: "bg-[hsl(var(--orange-glow))]/10",
        iconTheme: "text-[hsl(var(--orange-glow))]",
        kpi: data.kpis.avgFreightCost,
      },
      {
        label: "Match Accuracy",
        glow: "cyan" as const,
        iconColor: "bg-[hsl(var(--cyan-glow))]/10",
        iconTheme: "text-[hsl(var(--cyan-glow))]",
        kpi: data.kpis.matchAccuracy,
      },
      {
        label: "Processing Time",
        glow: "orange" as const,
        iconColor: "bg-[hsl(var(--orange-glow))]/10",
        iconTheme: "text-[hsl(var(--orange-glow))]",
        kpi: data.kpis.processingTime,
      },
      {
        label: "AI ROI",
        glow: "cyan" as const,
        iconColor: "bg-[hsl(var(--cyan-glow))]/10",
        iconTheme: "text-[hsl(var(--cyan-glow))]",
        kpi: data.kpis.aiRoi,
      },
    ];
  }, [data]);

  const volumeChartData = useMemo(() => {
    if (!data) return [];
    return data.volumeTrends.map((point) => ({
      week: format(new Date(point.week), "MMM d"),
      totalLoads: point.totalLoads,
      movingAverage: point.movingAverage,
    }));
  }, [data]);

  const subsystemChartData = useMemo(() => {
    if (!data) return [];
    return data.systemPerformance.subsystems.map((subsystem, index) => ({
      name: subsystem.name,
      utilization: subsystem.utilization,
      fill: subsystemColors[index % subsystemColors.length],
    }));
  }, [data]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <GlassCard glow="orange" className="max-w-md w-full text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Analytics unavailable</h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchAnalytics()}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--orange-glow))] text-white font-medium hover:opacity-90 transition"
            >
              Retry
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">AI Analytics Hub</h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Live performance metrics across forecasting, matching, and automation
          </p>
        </div>

        {usingFallback && (
          <div className="rounded-xl border border-yellow-400/40 bg-yellow-300/10 px-4 py-3 text-xs text-yellow-100 sm:text-sm">
            Analytics API is currently unavailable
            {error ? (
              <>
                {" "}
                ({error}).
              </>
            ) : (
              "."
            )}{" "}
            Showing Structure AI's curated demo insights to keep the walkthrough seamless.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((item, index) => {
            const Icon = item.kpi.trend === "up" ? TrendingUp : TrendingDown;
            const isPositive =
              (item.kpi.trend === "up" && item.kpi.changePercent >= 0) ||
              (item.kpi.trend === "down" && item.kpi.changePercent < 0);

            return (
              <GlassCard
                key={item.label}
                glow={item.glow}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                    <p className="text-sm text-[hsl(var(--text-secondary))]">{item.label}</p>
                    <p className="text-3xl font-semibold text-white">{formatValue(item.kpi)}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Icon className={`w-4 h-4 ${isPositive ? "text-green-400" : "text-red-400"}`} />
                      <span className={isPositive ? "text-green-400" : "text-red-400"}>
                        {item.kpi.changePercent >= 0 ? "+" : ""}
                        {item.kpi.changePercent.toFixed(1)}%
                      </span>
                      <span className="text-[hsl(var(--text-secondary))]">vs baseline</span>
                </div>
              </div>
                  <div className={`p-3 rounded-xl ${item.iconColor}`}>
                    <CheckCircle2 className={`w-6 h-6 ${item.iconTheme}`} />
              </div>
            </div>
          </GlassCard>
            );
          })}
                </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GlassCard glow="orange">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Shipment Volume Trends</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Aggregated weekly demand across monitored lanes
                </p>
              </div>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--orange-glow))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--orange-glow))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.45)" tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} width={60} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "rgba(12, 23, 45, 0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalLoads"
                    name="Total Loads"
                    stroke="hsl(var(--orange-glow))"
                    strokeWidth={2}
                    fill="url(#colorVolume)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="movingAverage"
                    name="4-week Avg"
                    stroke="hsl(var(--cyan-glow))"
                    strokeDasharray="5 5"
                    fillOpacity={0}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard glow="cyan">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">AI System Performance</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Real-time utilization and latency across AI engines
                </p>
              </div>
              <span className="text-xs text-[hsl(var(--text-secondary))]">
                Uptime {data.systemPerformance.uptimePercent.toFixed(2)}%
              </span>
              </div>
            <div className="h-[320px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  barSize={18}
                  data={subsystemChartData}
                >
                  <RadialBar cornerRadius={8} dataKey="utilization" />
                  <Legend
                    iconSize={10}
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-[hsl(var(--text-secondary))]">{value}</span>
                    )}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Utilization"]}
                    contentStyle={{
                      backgroundColor: "rgba(12, 23, 45, 0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Lane & Forecast insights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <GlassCard glow="orange" className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Top Lane Breakdown</h3>
              <span className="text-xs text-[hsl(var(--text-secondary))]">
                Based on current 4-week rolling average
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/90">
                <thead className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                  <tr>
                    <th className="py-2 pr-6">Lane</th>
                    <th className="py-2 pr-6">Current</th>
                    <th className="py-2 pr-6">Prev.</th>
                    <th className="py-2 pr-6">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {data.laneBreakdown.map((lane) => (
                    <tr key={lane.lane} className="border-white/5 border-b last:border-b-0">
                      <td className="py-3 pr-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{lane.lane}</span>
                          <span className="text-xs text-[hsl(var(--text-secondary))]">
                            {lane.origin} · {lane.destination}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-6">{lane.current.toLocaleString()}</td>
                      <td className="py-3 pr-6 text-[hsl(var(--text-secondary))]">
                        {lane.previous.toLocaleString()}
                      </td>
                      <td className="py-3 pr-6">
                        <span
                          className={
                            lane.changePercent >= 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          {lane.changePercent >= 0 ? "+" : ""}
                          {lane.changePercent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard glow="cyan" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Forecast Accuracy</h3>
              <span
                className={`text-xs font-medium ${
                  data.forecastAccuracy.rating === "excellent"
                    ? "text-green-400"
                    : data.forecastAccuracy.rating === "strong"
                    ? "text-cyan-300"
                    : data.forecastAccuracy.rating === "moderate"
                    ? "text-yellow-300"
                    : "text-red-400"
                }`}
              >
                {data.forecastAccuracy.rating.toUpperCase()}
              </span>
                </div>
            <div className="space-y-3 text-sm text-[hsl(var(--text-secondary))]">
              <p>
                MAPE:{" "}
                <span className="text-white font-semibold">
                  {data.forecastAccuracy.mape.toFixed(1)}%
                </span>
              </p>
              <p>
                MAE:{" "}
                <span className="text-white font-semibold">
                  {data.forecastAccuracy.mae.toFixed(1)}
                </span>
              </p>
              <p>
                RMSE:{" "}
                <span className="text-white font-semibold">
                  {data.forecastAccuracy.rmse.toFixed(1)}
                </span>
              </p>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-xs">
                <p className="text-[hsl(var(--text-secondary))]">
                  AI models remain calibrated within thresholds. Continue monitoring alert queues
                  for spikes.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Insights */}
        <GlassCard glow="orange">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">AI Insights</h3>
            <div className="px-4 py-2 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-300 font-medium">All systems operational</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.insights.map((insight) => (
              <div
                key={insight.title}
                className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition"
              >
                <p className="text-sm font-semibold text-white">{insight.title}</p>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{insight.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;
