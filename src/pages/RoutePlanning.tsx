import { useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { postJson } from "@/lib/api";
import {
  AlertTriangle,
  Brain,
  Clock,
  DollarSign,
  Fuel,
  Leaf,
  Loader2,
  MapPin,
  Navigation,
  Plane,
  Plus,
  Ship,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat("en-US");

type StrategyKey = "fastest" | "cheapest" | "ai";
type TransportKey = "air" | "sea" | "land";

interface StopInput {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface RouteMetrics {
  totalDistanceKm: number;
  totalTimeHr: number;
  totalCostUSD: number;
  costPerKgUSD: number;
  fuelUsedLiters: number;
  fuelCostUSD: number;
  co2Kg: number;
  fuelEfficiencyKmPerL: number;
}

interface OptimizationResponse {
  success: boolean;
  optimizedRoute: RouteMetrics & {
    stops: StopInput[];
    order: string[];
    reason: string;
    timestamp: string;
    transportMode: string;
    transportIcon: string;
    strategy: string;
    strategyIcon: string;
    weightKg: number;
  };
  comparison: {
    naive: RouteMetrics;
    optimized: RouteMetrics;
    improvements: {
      distancePercent: number;
      timePercent: number;
      costPercent: number;
      costPerKgPercent: number;
      fuelPercent: number;
      fuelCostPercent: number;
      co2Percent: number;
      distanceKm: number;
      timeHr: number;
      costUSD: number;
      costPerKgUSD: number;
      fuelLiters: number;
      fuelCostUSD: number;
      co2Kg: number;
      fuelEfficiencyKmPerL: number;
      fuelEfficiencyPercent: number;
    };
  };
}

interface ApiError {
  error?: string;
  recommendedModes?: string[];
  reasoning?: string;
}

const defaultOrigin: StopInput = {
  id: "origin",
  name: "Dubai Mega Hub",
  lat: 25.276987,
  lng: 55.296249,
};

const defaultStops: StopInput[] = [
  {
    id: "stop-1",
    name: "Frankfurt Distribution",
    lat: 50.110924,
    lng: 8.682127,
  },
  {
    id: "stop-2",
    name: "New York Seaport",
    lat: 40.712776,
    lng: -74.005974,
  },
];

const transportOptions: { id: TransportKey; label: string; icon: JSX.Element }[] = [
  { id: "land", label: "Land", icon: <Truck className="w-4 h-4" /> },
  { id: "sea", label: "Sea", icon: <Ship className="w-4 h-4" /> },
  { id: "air", label: "Air", icon: <Plane className="w-4 h-4" /> },
];

const strategyOptions: { id: StrategyKey; label: string; description: string; icon: string }[] = [
  { id: "fastest", label: "Fastest", description: "Minimize travel time", icon: "⚡" },
  { id: "cheapest", label: "Cheapest", description: "Minimize trip spend", icon: "💰" },
  { id: "ai", label: "AI Optimized", description: "Balanced demo output", icon: "🤖" },
];

const RoutePlanning = () => {
  const [origin, setOrigin] = useState<StopInput>(defaultOrigin);
  const [stops, setStops] = useState<StopInput[]>(defaultStops);
  const [transport, setTransport] = useState<TransportKey>("air");
  const [strategy, setStrategy] = useState<StrategyKey>("ai");
  const [weightKg, setWeightKg] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string[]>([]);
  const [errorReasoning, setErrorReasoning] = useState<string | null>(null);

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        id: `stop-${Date.now()}`,
        name: "",
        lat: 0,
        lng: 0,
      },
    ]);
  };

  const updateStopValue = (id: string, field: keyof StopInput, value: string) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === id
          ? {
              ...stop,
              [field]: field === "name" ? value : Number(value),
            }
          : stop,
      ),
    );
  };

  const removeStop = (id: string) => {
    setStops((prev) => prev.filter((stop) => stop.id !== id));
  };

  const resetErrors = () => {
    setError(null);
    setRecommendation([]);
    setErrorReasoning(null);
  };

  const handleGenerate = async () => {
    if (stops.length < 2) {
      setError("Please provide at least two stops to optimize a route.");
      return;
    }

    setIsLoading(true);
    resetErrors();

    try {
      const data = await postJson<OptimizationResponse>("/api/route/optimize", {
        origin,
        stops,
        transportMode: transport,
        strategy,
        weightKg,
      });

      setResult(data);
    } catch (err) {
      const apiError = err as ApiError;
      setResult(null);
      setError(apiError.error ?? "Failed to optimize route. Please try again.");
      setRecommendation(apiError.recommendedModes ?? []);
      setErrorReasoning(apiError.reasoning ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  const comparisonCards = useMemo(() => {
    if (!result) return [];
    const { naive, optimized, improvements } = result.comparison;

    return [
      {
        label: "Distance",
        original: `${number.format(naive.totalDistanceKm)} km`,
        optimized: `${number.format(optimized.totalDistanceKm)} km`,
        percent: improvements.distancePercent,
        delta: `${improvements.distanceKm >= 0 ? "-" : "+"}${number.format(Math.abs(improvements.distanceKm))} km`,
      },
      {
        label: "Travel Time",
        original: `${number.format(naive.totalTimeHr)} hr`,
        optimized: `${number.format(optimized.totalTimeHr)} hr`,
        percent: improvements.timePercent,
        delta: `${improvements.timeHr >= 0 ? "-" : "+"}${number.format(Math.abs(improvements.timeHr))} hr`,
      },
      {
        label: "Total Cost",
        original: `$${number.format(naive.totalCostUSD)}`,
        optimized: `$${number.format(optimized.totalCostUSD)}`,
        percent: improvements.costPercent,
        delta: `${improvements.costUSD >= 0 ? "-" : "+"}$${number.format(Math.abs(improvements.costUSD))}`,
      },
      {
        label: "Cost / kg",
        original: `$${number.format(naive.costPerKgUSD)}`,
        optimized: `$${number.format(optimized.costPerKgUSD)}`,
        percent: improvements.costPerKgPercent,
        delta: `${improvements.costPerKgUSD >= 0 ? "-" : "+"}$${number.format(Math.abs(improvements.costPerKgUSD))}`,
      },
      {
        label: "Fuel Used",
        original: `${number.format(naive.fuelUsedLiters)} L`,
        optimized: `${number.format(optimized.fuelUsedLiters)} L`,
        percent: improvements.fuelPercent,
        delta: `${improvements.fuelLiters >= 0 ? "-" : "+"}${number.format(Math.abs(improvements.fuelLiters))} L`,
      },
      {
        label: "Fuel Cost",
        original: `$${number.format(naive.fuelCostUSD)}`,
        optimized: `$${number.format(optimized.fuelCostUSD)}`,
        percent: improvements.fuelCostPercent,
        delta: `${improvements.fuelCostUSD >= 0 ? "-" : "+"}$${number.format(Math.abs(improvements.fuelCostUSD))}`,
      },
      {
        label: "CO₂ Emitted",
        original: `${number.format(naive.co2Kg)} kg`,
        optimized: `${number.format(optimized.co2Kg)} kg`,
        percent: improvements.co2Percent,
        delta: `${improvements.co2Kg >= 0 ? "-" : "+"}${number.format(Math.abs(improvements.co2Kg))} kg`,
      },
      {
        label: "Fuel Efficiency",
        original: `${number.format(naive.fuelEfficiencyKmPerL)} km/L`,
        optimized: `${number.format(optimized.fuelEfficiencyKmPerL)} km/L`,
        percent: improvements.fuelEfficiencyPercent,
        delta: `${improvements.fuelEfficiencyKmPerL >= 0 ? "+" : "-"}${number.format(
          Math.abs(improvements.fuelEfficiencyKmPerL),
        )} km/L`,
      },
    ];
  }, [result]);

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white relative inline-block">
            AI Route Planning
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--cyan-glow))] rounded-full shadow-[0_0_15px_rgba(255,122,0,0.6)]" />
          </h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Deterministic demo routing across land, sea, and air with balanced cost/time metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <GlassCard glow="cyan" className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Route Inputs</h3>
              <span className="text-xs text-[hsl(var(--text-secondary))]">Demo-friendly defaults</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))] mb-2 block">
                  Origin
                </label>
                <Input 
                  value={origin.name}
                  onChange={(e) => setOrigin((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Origin name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    type="number"
                    value={origin.lat}
                    onChange={(e) => setOrigin((prev) => ({ ...prev, lat: Number(e.target.value) }))}
                    placeholder="Latitude"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                  <Input
                    type="number"
                    value={origin.lng}
                    onChange={(e) => setOrigin((prev) => ({ ...prev, lng: Number(e.target.value) }))}
                    placeholder="Longitude"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                    Stops
                  </label>
                  <button
                    onClick={addStop}
                    className="flex items-center gap-2 text-xs text-[hsl(var(--cyan-glow))] hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add stop
                  </button>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {stops.map((stop, index) => (
                    <div key={stop.id} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
                      <div className="flex items-center justify-between text-[hsl(var(--text-secondary))] text-xs">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
                          Stop {index + 1}
                        </span>
                        <button onClick={() => removeStop(stop.id)} className="text-white/60 hover:text-red-400" aria-label="Remove stop">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Input 
                        value={stop.name}
                        onChange={(e) => updateStopValue(stop.id, "name", e.target.value)}
                        placeholder="Stop name"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <Input
                          type="number"
                          value={stop.lat}
                          onChange={(e) => updateStopValue(stop.id, "lat", e.target.value)}
                          placeholder="Latitude"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                        <Input
                          type="number"
                          value={stop.lng}
                          onChange={(e) => updateStopValue(stop.id, "lng", e.target.value)}
                          placeholder="Longitude"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                  Cargo Weight (kg)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <p className="text-[hsl(var(--text-secondary))] text-xs">
                  Weight influences payload limits, fuel, and costs.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                  Transport Mode
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {transportOptions.map((option) => {
                    const isActive = transport === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTransport(option.id)}
                        className={`rounded-xl border px-3 py-2 text-left transition-all ${
                          isActive
                            ? 'border-[hsl(var(--orange-glow))] bg-[hsl(var(--orange-glow))]/20 text-white shadow-[0_0_20px_rgba(255,122,0,0.25)]'
                            : 'border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {option.icon}
                          <span>{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
*** End Patch              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                  Optimization Strategy
                </span>
                <div className="flex flex-col gap-2">
                  {strategyOptions.map((option) => {
                    const isActive = strategy === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setStrategy(option.id)}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 transition-all ${
                          isActive
                            ? 'border-[hsl(var(--cyan-glow))] bg-[hsl(var(--cyan-glow))]/20 text-white shadow-[0_0_20px_rgba(0,255,255,0.25)]'
                            : 'border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{option.icon}</span>
                          <div className="text-left">
                            <p className="text-sm font-semibold">{option.label}</p>
                            <p className="text-xs opacity-70">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <GlowButton
                variant="primary"
                className="w-full mt-4"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Optimizing Route...
                  </span>
                ) : (
                  "Generate Optimized Route"
                )}
              </GlowButton>

              {error && (
                <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">{error}</span>
                  </div>
                  {errorReasoning && (
                    <p className="text-xs text-red-200/80">{errorReasoning}</p>
                  )}
                  {recommendation.length > 0 && (
                    <p className="text-xs text-red-200/80">
                      Recommended modes: {recommendation.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard glow="orange" className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Route Overview</h3>
              <span className="text-xs text-[hsl(var(--text-secondary))]">
                {result
                  ? `Optimized at ${new Date(result.optimizedRoute.timestamp).toLocaleTimeString()}`
                  : "Awaiting optimization"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard glow="orange" className="bg-white/5 border border-white/10">
                <p className="text-xs text-[hsl(var(--text-secondary))]">Total Trip Cost</p>
                <p className="text-2xl font-semibold text-white">
                  {result ? `$${number.format(result.optimizedRoute.totalCostUSD)}` : "—"}
                </p>
                {result && (
                  <p
                    className={`text-xs ${
                      result.comparison.improvements.costPercent >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {result.comparison.improvements.costUSD >= 0 ? "Saved" : "Added"} ${number.format(
                      Math.abs(result.comparison.improvements.costUSD),
                    )}
                  </p>
                )}
              </GlassCard>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-[hsl(var(--text-secondary))]">Distance</p>
                <p className="text-lg font-semibold text-white">
                  {result ? `${number.format(result.optimizedRoute.totalDistanceKm)} km` : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-[hsl(var(--text-secondary))]">Estimated Time</p>
                <p className="text-lg font-semibold text-white">
                  {result ? `${number.format(result.optimizedRoute.totalTimeHr)} hr` : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-[hsl(var(--text-secondary))]">Fuel Used</p>
                <p className="text-lg font-semibold text-white">
                  {result ? `${number.format(result.optimizedRoute.fuelUsedLiters)} L` : "—"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[hsl(var(--orange-glow))]/20 text-[hsl(var(--orange-glow))]">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      {result ? result.optimizedRoute.strategyIcon : "🤖"}
                      {result ? result.optimizedRoute.strategy : "AI Strategy pending"}
                    </span>
                    <span className="text-sm text-[hsl(var(--text-secondary))] flex items-center gap-2">
                      {result ? result.optimizedRoute.transportIcon : "🚚"}
                      {result
                        ? result.optimizedRoute.transportMode
                        : transportOptions.find((opt) => opt.id === transport)?.label}
                    </span>
                    <span className="text-sm text-[hsl(var(--text-secondary))]">
                      {integer.format(weightKg)} kg cargo
                    </span>
                  </div>
                  <p className="text-[hsl(var(--text-secondary))] text-sm leading-relaxed">
                    {result
                      ? result.optimizedRoute.reason
                      : "Select stops, weights, transport, and strategy then generate an optimized demo route."}
                  </p>
                  {result && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[hsl(var(--text-secondary))]">Cost / kg</p>
                        <p className="text-white font-semibold">
                          ${number.format(result.optimizedRoute.costPerKgUSD)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[hsl(var(--text-secondary))]">Fuel cost</p>
                        <p className="text-white font-semibold">
                          ${number.format(result.optimizedRoute.fuelCostUSD)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[hsl(var(--text-secondary))]">CO₂ emitted</p>
                        <p className="text-white font-semibold">
                          {number.format(result.optimizedRoute.co2Kg)} kg
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[hsl(var(--text-secondary))]">Fuel efficiency</p>
                        <p className="text-white font-semibold">
                          {number.format(result.optimizedRoute.fuelEfficiencyKmPerL)} km/L
                        </p>
                  </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
*** End Patch            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
                Before & After Comparison
              </h4>
              {result ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {comparisonCards.map((card) => (
                    <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <p className="text-xs text-[hsl(var(--text-secondary))]">{card.label}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{card.original}</span>
                        <span className="text-white font-semibold">{card.optimized}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`${card.percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {card.percent >= 0 ? '-' : '+'}{number.format(Math.abs(card.percent))}%
                        </span>
                        <span className="text-white/80">{card.delta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-[hsl(var(--text-secondary))]">
                  Generate a route to see comparative metrics.
                </div>
              )}
            </div>

            <GlassCard glow="cyan" className="bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Navigation className="w-5 h-5 text-[hsl(var(--cyan-glow))]" />
                <h4 className="text-sm font-semibold text-white">Stop Order</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {(result ? result.optimizedRoute.order : stops.map((stop) => stop.name || 'Stop')).map((name, idx) => (
                  <span
                    key={`${name}-${idx}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-white flex items-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-[hsl(var(--cyan-glow))] text-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {name || `Stop ${idx + 1}`}
                  </span>
                ))}
              </div>
            </GlassCard>
          </GlassCard>

          <GlassCard glow="orange" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">AI Route Insights</h3>
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--orange-glow))] animate-pulse" />
            </div>

            {result ? (
              <div className="grid grid-cols-2 gap-3 text-xs text-[hsl(var(--text-secondary))]">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p>Total Distance</p>
                  <p className="text-white text-lg font-semibold">
                    {number.format(result.optimizedRoute.totalDistanceKm)} km
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p>ETA</p>
                  <p className="text-white text-lg font-semibold">
                    {number.format(result.optimizedRoute.totalTimeHr)} hr
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p>Fuel Used</p>
                  <p className="text-white text-lg font-semibold">
                    {number.format(result.optimizedRoute.fuelUsedLiters)} L
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p>CO₂ Output</p>
                  <p className="text-white text-lg font-semibold">
                    {number.format(result.optimizedRoute.co2Kg)} kg
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-[hsl(var(--text-secondary))]">
                Enter stops, weight, transport mode, and strategy to see AI insights and metrics.
            </div>
            )}

            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-[hsl(var(--orange-glow))]/30 space-y-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[hsl(var(--orange-glow))]" />
                <span className="text-sm font-semibold text-white">AI Suggestions</span>
              </div>
              <div className="space-y-2 text-xs text-[hsl(var(--text-secondary))]">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--cyan-glow))] mt-1.5" />
                  <p>Fastest strategy compresses ETA with modest cost trade-offs.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                  <p>Cheapest strategy slightly extends distance while cutting spend per kg.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--orange-glow))] mt-1.5" />
                  <p>AI balanced strategy keeps improvements believable for demo purposes.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--orange-glow))]" />
                <p className="text-[hsl(var(--text-secondary))]">Time</p>
                <p className="text-sm font-semibold text-white">
                  {result ? `${number.format(result.comparison.improvements.timePercent)}%` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Fuel className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--cyan-glow))]" />
                <p className="text-[hsl(var(--text-secondary))]">Fuel</p>
                <p className="text-sm font-semibold text-white">
                  {result ? `${number.format(result.comparison.improvements.fuelPercent)}%` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Leaf className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-[hsl(var(--text-secondary))]">Eco</p>
                <p className="text-sm font-semibold text-white">
                  {result ? `${number.format(result.comparison.improvements.co2Percent)}%` : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <GlowButton variant="primary" className="w-full" disabled={!result}>
                Save Route
              </GlowButton>
              <GlowButton variant="outline" className="w-full" disabled={!result}>
                Send to Dispatcher
              </GlowButton>
              <button
                className="w-full px-4 py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors disabled:opacity-50"
                disabled={!result}
              >
                Export to TMS
              </button>
            </div>
          </GlassCard>
        </div>

        {result && (
          <GlassCard glow="cyan" className="spaceραπε***EOF        {result && (
          <GlassCard glow="cyan" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Detailed Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[hsl(var(--text-secondary))]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide">Original Route</p>
                <div className="flex items-center gap-2 text-white text-lg font-semibold">
                  <DollarSign className="w-4 h-4" />
                  ${number.format(result.comparison.naive.totalCostUSD)}
                </div>
                <p>Distance: {number.format(result.comparison.naive.totalDistanceKm)} km</p>
                <p>ETA: {number.format(result.comparison.naive.totalTimeHr)} hr</p>
                  </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide">Optimized Route</p>
                <div className="flex items-center gap-2 text-white text-lg font-semibold">
                  <DollarSign className="w-4 h-4" />
                  ${number.format(result.comparison.optimized.totalCostUSD)}
                </div>
                <p>Distance: {number.format(result.comparison.optimized.totalDistanceKm)} km</p>
                <p>ETA: {number.format(result.comparison.optimized.estimatedTimeHr)} hr</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide">Savings Snapshot</p>
                <p className={`text-lg font-semibold ${result.comparison.improvements.costUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.comparison.improvements.costUSD >= 0 ? 'Saved' : 'Added'} ${number.format(Math.abs(result.comparison.improvements.costUSD))}
                </p>
                <p>Fuel Δ: {result.comparison.improvements.fuelLiters >= 0 ? '-' : '+'}{number.format(Math.abs(result.comparison.improvements.fuelLiters))} L</p>
                <p>CO₂ Δ: {result.comparison.improvements.co2Kg >= 0 ? '-' : '+'}{number.format(Math.abs(result.comparison.improvements.co2Kg))} kg</p>
              </div>
          </div>
        </GlassCard>
        )}
      </div>
    </div>
  );
};

export default RoutePlanning;
