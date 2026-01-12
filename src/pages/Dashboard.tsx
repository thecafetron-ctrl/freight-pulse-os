import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import { GlassCard } from "@/components/GlassCard";
import { getJson } from "@/lib/api";
import type {
  DashboardSnapshot,
  DashboardSystemStatus,
  InsightAnomaly,
} from "@/types/analytics";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  Loader2,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getFallbackDashboardSnapshot } from "@/data/insightsFallback";

interface DashboardResponse {
  success: boolean;
  data: DashboardSnapshot;
}

const statusIconMap: Record<
  DashboardSystemStatus["status"],
  { color: string; icon: JSX.Element }
> = {
  operational: {
    color: "text-green-400",
    icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  },
  degraded: {
    color: "text-yellow-300",
    icon: <AlertTriangle className="w-4 h-4 text-yellow-300" />,
  },
  offline: {
    color: "text-red-400",
    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
  },
};

const severityColorMap: Record<InsightAnomaly["severity"], string> = {
  low: "text-emerald-300",
  medium: "text-yellow-300",
  high: "text-red-400",
};

const Dashboard = () => {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const dataRef = useRef<DashboardSnapshot | null>(null);

  const fetchSnapshot = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const payload = await getJson<DashboardResponse>("/api/insights/dashboard");
      if (!payload.success) {
        throw new Error("Failed to load dashboard data");
      }

      setData(payload.data);
      dataRef.current = payload.data;
      setError(null);
      setUsingFallback(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error loading dashboard";
      setError(message);
      if (!dataRef.current) {
        const fallback = getFallbackDashboardSnapshot();
        dataRef.current = fallback;
        setData(fallback);
        setUsingFallback(true);
      }
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  useEffect(() => {
    if (!data) {
      return undefined;
    }
    const interval = setInterval(() => {
      fetchSnapshot(true);
    }, 60_000);

    return () => clearInterval(interval);
  }, [data, fetchSnapshot]);

  const averageLaneChange = useMemo(() => {
    if (!data || data.laneHighlights.length === 0) {
      return 0;
    }
    const total = data.laneHighlights.reduce((sum, lane) => sum + lane.changePercent, 0);
    return total / data.laneHighlights.length;
  }, [data]);

  const statsCards = useMemo(() => {
    if (!data) {
      return [];
    }

    const cards = [
      {
        label: "Active Shipments",
        value: data.stats.activeShipments.toLocaleString(),
        delta: averageLaneChange,
        invert: false,
        icon: Package,
        glow: "orange" as const,
      },
      {
        label: "Quote Requests",
        value: data.stats.quoteRequests.toLocaleString(),
        delta: averageLaneChange * 0.8,
        invert: false,
        icon: DollarSign,
        glow: "cyan" as const,
      },
      {
        label: "Match Rate",
        value: `${data.stats.matchRate.toFixed(1)}%`,
        delta: data.stats.matchRate - 92,
        invert: false,
        icon: TrendingUp,
        glow: "orange" as const,
      },
      {
        label: "Avg Response Time",
        value: `${data.stats.avgResponseTimeMinutes.toFixed(1)}m`,
        delta: data.stats.avgResponseTimeMinutes - 2.6,
        invert: true,
        icon: Clock,
        glow: "cyan" as const,
      },
    ];

    return cards.map((card) => {
      const isPositive = card.invert ? card.delta <= 0 : card.delta >= 0;
      const trendLabel = `${isPositive ? "+" : ""}${card.delta.toFixed(1)}%`;
      return { ...card, isPositive, trendLabel };
    });
  }, [data, averageLaneChange]);

  const lastUpdated = data
    ? formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })
    : null;

  const renderContent = () => {
    if (loading && !data) {
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      );
    }

    if (error && !data) {
      return (
        <GlassCard glow="orange" className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Unable to load dashboard</h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-2">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchSnapshot()}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--orange-glow))] text-white font-medium hover:opacity-90 transition"
            >
              Retry
            </button>
          </div>
        </GlassCard>
      );
    }

    if (!data) {
      return null;
    }

    return (
      <>
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
          {statsCards.map((card, index) => (
            <GlassCard
              key={card.label}
              glow={card.glow}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-[hsl(var(--text-secondary))]">{card.label}</p>
                  <p className="text-3xl font-semibold text-white">{card.value}</p>
                  <div className="flex items-center gap-2 text-sm">
                    {card.isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={card.isPositive ? "text-green-400" : "text-red-400"}>
                      {card.trendLabel}
                    </span>
                    <span className="text-[hsl(var(--text-secondary))]">vs baseline</span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl transition-all duration-500 ${
                    card.glow === "orange"
                      ? "bg-gradient-to-br from-white/15 to-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      : "bg-gradient-to-br from-white/12 to-white/5 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                  }`}
                >
                  <card.icon
                    className={`w-6 h-6 transition-all duration-500 ${
                      card.glow === "orange"
                        ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                        : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    }`}
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-3 2xl:gap-6">
          <GlassCard glow="orange" className="2xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  Latest signals across load matching, quoting, and forecasting
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))]">
                <span>Auto-refreshing</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span>{lastUpdated}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {data.recentActivity.map((activity) => {
                const Icon =
                  activity.status === "success"
                    ? CheckCircle2
                    : activity.status === "warning"
                    ? AlertTriangle
                    : Info;
                const color =
                  activity.status === "success"
                    ? "text-emerald-300"
                    : activity.status === "warning"
                    ? "text-yellow-300"
                    : "text-cyan-300";

                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-[hsl(var(--text-secondary))]">
                          {activity.detail}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[hsl(var(--text-secondary))]">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard glow="cyan" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
              <button
                type="button"
                onClick={() => fetchSnapshot(true)}
                className="flex items-center gap-2 text-xs text-[hsl(var(--cyan-glow))] hover:text-white transition"
              >
                {refreshing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              <Link
                to="/quotes"
                className="group block w-full p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] text-white font-semibold transition duration-300 hover:shadow-[0_0_30px_rgba(255,122,0,0.45)] hover:scale-[1.01]"
              >
                Generate Quote
                <ArrowUpRight className="inline-block w-4 h-4 ml-2 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/load-matching"
                className="block w-full p-4 rounded-xl border-2 border-[hsl(var(--cyan-glow))] text-[hsl(var(--cyan-glow))] font-semibold transition duration-300 hover:bg-[hsl(var(--cyan-glow))] hover:text-[hsl(var(--navy-deep))]"
              >
                Find Matches
              </Link>
              <Link
                to="/documents"
                className="block w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold transition duration-300 hover:bg-white/10"
              >
                Upload Document
              </Link>
              <Link
                to="/analytics"
                className="block w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold transition duration-300 hover:bg-white/10"
              >
                View Analytics
              </Link>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[hsl(var(--text-secondary))]">Fleet Utilization</p>
                <span className="text-sm font-semibold text-white">
                  {data.utilization.utilizationPercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--cyan-glow))] to-[hsl(var(--orange-glow))]"
                  style={{ width: `${Math.min(100, data.utilization.utilizationPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-[hsl(var(--text-secondary))]">
                <span>{data.utilization.availableVehicles} total assets</span>
                <span>{data.utilization.idleVehicles} idle capacity</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Lane performance & Alerts */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
          <GlassCard glow="orange" className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Lane Performance</h3>
              <span className="text-xs text-[hsl(var(--text-secondary))]">
                Top {data.laneHighlights.length} monitored lanes
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.laneHighlights.map((lane) => (
                <div
                  key={lane.lane}
                  className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2 hover:bg-white/10 transition"
                >
                  <p className="text-sm font-semibold text-white">{lane.lane}</p>
                  <div className="flex items-center justify-between text-sm text-[hsl(var(--text-secondary))]">
                    <span>{lane.weeklyLoads.toLocaleString()} weekly loads</span>
                    <span
                      className={
                        lane.changePercent > 0
                          ? "text-green-400"
                          : lane.changePercent < 0
                          ? "text-red-400"
                          : "text-[hsl(var(--text-secondary))]"
                      }
                    >
                      {lane.changePercent >= 0 ? "+" : ""}
                      {lane.changePercent}%
                    </span>
                  </div>
                  <div className="text-xs text-[hsl(var(--text-secondary))]">
                    Trend:{" "}
                    <span className="font-medium text-white capitalize">{lane.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard glow="cyan" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">AI Alerts</h3>
              <span className="text-xs text-[hsl(var(--text-secondary))]">
                {data.alerts.count} detected
              </span>
            </div>
            {data.alerts.topAlerts.length === 0 ? (
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                No anomalies detected in the latest forecast horizon.
              </p>
            ) : (
              <div className="space-y-3">
                {data.alerts.topAlerts.map((alert) => (
                  <div
                    key={`${alert.lane}-${alert.type}`}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{alert.lane}</p>
                      <span className={`text-xs font-medium ${severityColorMap[alert.severity]}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{alert.message}</p>
                    <span className="text-xs text-[hsl(var(--text-secondary))]">
                      Change: {alert.percentChange >= 0 ? "+" : ""}
                      {alert.percentChange.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* System status */}
        <GlassCard glow="orange">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">AI Systems Status</h3>
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))]">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Real-time monitoring active</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {data.systemStatus.map((system) => {
              const statusMeta = statusIconMap[system.status];
              return (
                <div
                  key={system.system}
                  className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3 hover:bg-white/10 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{system.system}</p>
                    <span className={`flex items-center gap-1 text-xs ${statusMeta.color}`}>
                      {statusMeta.icon}
                      <span className="uppercase tracking-wide">{system.status}</span>
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-[hsl(var(--text-secondary))]">
                    <p>Latency: {system.latencyMs} ms</p>
                    <p>Throughput: {system.throughputPerMinute} / min</p>
                    <p>Uptime: {system.uptimePercent.toFixed(2)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient light effects - smooth fade to black */}
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[600px] animate-glow-orb pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.01) 70%, transparent 100%)',
          filter: 'blur(100px)',
          opacity: 0.5
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] animate-glow-orb pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.015) 50%, rgba(255,255,255,0.008) 70%, transparent 100%)',
          filter: 'blur(80px)',
          opacity: 0.4,
          animationDelay: '3s'
        }}
      />
      
      <div className="app-shell-wide space-y-6 pb-10 pt-6 sm:space-y-8 relative z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="leading-tight text-gradient-premium">Operations Dashboard</h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] sm:text-base">
              Real-time overview of AI-powered logistics performance
            </p>
          </div>
          {data && (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[hsl(var(--text-secondary))] sm:text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="whitespace-nowrap">Last updated {lastUpdated}</span>
            </div>
          )}
        </div>

        {usingFallback && (
          <div className="rounded-xl border border-yellow-400/40 bg-yellow-300/10 px-4 py-3 text-xs text-yellow-100 sm:text-sm">
            Live analytics service is currently unreachable
            {error ? (
              <>
                {" "}
                ({error}).
              </>
            ) : (
              "."
            )}{" "}
            Displaying Structure AI demo metrics so the experience remains uninterrupted.
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
