import { useCallback, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import RoutePlannerMap from "@/components/RoutePlannerMap";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
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
  Wand2,
} from "lucide-react";
import { postJson } from "@/lib/api";
import type { MapStop } from "@/components/RoutePlannerMap";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const integerFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

const formatLargeNumber = (value: number) => {
  if (!Number.isFinite(value)) return "—";
  const absValue = Math.abs(value);
  if (absValue === 0) return "0";
  if (absValue >= 1000) {
    return compactFormatter.format(value);
  }
  return numberFormatter.format(value);
};

const formatPercent = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "-" : "+"}${numberFormatter.format(Math.abs(value))}%`;
};

const strategyOptions = [
  { id: "fastest" as const, label: "Fastest", description: "Minimize travel time", icon: "⚡" },
  { id: "cheapest" as const, label: "Cheapest", description: "Minimize trip spend", icon: "💰" },
  { id: "ai" as const, label: "AI Optimized", description: "Balanced optimization", icon: "🤖" },
];

const transportOptions = [
  { id: "land" as const, label: "Land", icon: <Truck className="w-4 h-4" />, subtitle: "Regional ground fleets" },
  { id: "sea" as const, label: "Sea", icon: <Ship className="w-4 h-4" />, subtitle: "Global ocean freight" },
  { id: "air" as const, label: "Air", icon: <Plane className="w-4 h-4" />, subtitle: "Express air cargo" },
];

interface StopInput extends MapStop {
  id: string;
}

type StrategyKey = "fastest" | "cheapest" | "ai";
type TransportKey = "air" | "sea" | "land";

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
    estimatedArrivalIso: string;
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

interface GeocodeResponse {
  success: boolean;
  location: {
    name: string;
    lat: number;
    lng: number;
    formatted?: string;
  };
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
  const [isGeocodingOrigin, setIsGeocodingOrigin] = useState(false);
  const [geocodingStops, setGeocodingStops] = useState<Record<string, boolean>>({});

  const originGeocodeTimer = useRef<NodeJS.Timeout | null>(null);
  const lastOriginQueryRef = useRef<string>(origin.name);
  const stopGeocodeTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const lastStopQueryRef = useRef<Record<string, string>>({});

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

  const geocodeLocation = useCallback(async (query: string) => {
    const data = await postJson<GeocodeResponse>("/api/route/geocode", { location: query });
    return data.location;
  }, []);

  const performOriginGeocode = useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      setIsGeocodingOrigin(true);
      try {
        const location = await geocodeLocation(query);
        lastOriginQueryRef.current = location.formatted ?? location.name ?? query;
        setOrigin((prev) => ({
          ...prev,
          name: location.formatted ?? location.name ?? prev.name,
          lat: location.lat,
          lng: location.lng,
        }));
        resetErrors();
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error ?? "Unable to locate that origin. Please add coordinates manually.");
        setErrorReasoning(apiError.reasoning ?? null);
        setRecommendation([]);
      } finally {
        setIsGeocodingOrigin(false);
      }
    },
    [geocodeLocation],
  );

  const handleGeocodeOrigin = useCallback(() => {
    if (!origin.name.trim()) {
      setError("Enter an origin description before using AI coordinates.");
      setErrorReasoning(null);
      setRecommendation([]);
      return;
    }
    performOriginGeocode(origin.name);
  }, [origin.name, performOriginGeocode]);

  const performStopGeocode = useCallback(
    async (stopId: string, query: string) => {
      if (!query.trim()) return;
      const target = stops.find((stop) => stop.id === stopId);
      if (!target) return;
      setGeocodingStops((prev) => ({ ...prev, [stopId]: true }));
      try {
        const location = await geocodeLocation(query);
        lastStopQueryRef.current = {
          ...lastStopQueryRef.current,
          [stopId]: location.formatted ?? location.name ?? query,
        };
        setStops((prev) =>
          prev.map((stop) =>
            stop.id === stopId
              ? {
                  ...stop,
                  name: location.formatted ?? location.name ?? stop.name,
                  lat: location.lat,
                  lng: location.lng,
                }
              : stop,
          ),
        );
        resetErrors();
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error ?? `Unable to locate ${target.name}. Try a more specific description.`);
        setErrorReasoning(apiError.reasoning ?? null);
        setRecommendation([]);
      } finally {
        setGeocodingStops((prev) => {
          const { [stopId]: _omit, ...rest } = prev;
          return rest;
        });
      }
    },
    [geocodeLocation, stops],
  );

  const handleGeocodeStop = useCallback(
    (stopId: string) => {
      const target = stops.find((stop) => stop.id === stopId);
      if (!target || !target.name.trim()) {
        setError("Add a location name before using AI coordinates for this stop.");
        setErrorReasoning(null);
        setRecommendation([]);
        return;
      }
      performStopGeocode(stopId, target.name);
    },
    [performStopGeocode, stops],
  );

  const scheduleOriginGeocode = useCallback(
    (value: string) => {
      if (originGeocodeTimer.current) {
        clearTimeout(originGeocodeTimer.current);
      }
      const trimmed = value.trim();
      if (trimmed.length < 3) return;
      originGeocodeTimer.current = setTimeout(() => {
        if (trimmed === lastOriginQueryRef.current) return;
        performOriginGeocode(trimmed);
      }, 700);
    },
    [performOriginGeocode],
  );

  const scheduleStopGeocode = useCallback(
    (stopId: string, value: string) => {
      if (stopGeocodeTimersRef.current[stopId]) {
        clearTimeout(stopGeocodeTimersRef.current[stopId]);
      }
      const trimmed = value.trim();
      if (trimmed.length < 3) return;
      stopGeocodeTimersRef.current[stopId] = setTimeout(() => {
        if (trimmed === lastStopQueryRef.current[stopId]) return;
        performStopGeocode(stopId, trimmed);
      }, 700);
    },
    [performStopGeocode],
  );

  const handleGenerate = async () => {
    if (stops.length < 1) {
      setError("Please provide at least one stop to optimize a route.");
      setRecommendation([]);
      setErrorReasoning(null);
      return;
    }

    setIsLoading(true);
    resetErrors();

    try {
      let nextOrigin = origin;
      if ((!origin.lat || !origin.lng) && origin.name.trim()) {
        const location = await geocodeLocation(origin.name);
        nextOrigin = {
          ...origin,
          name: location.formatted ?? location.name ?? origin.name,
          lat: location.lat,
          lng: location.lng,
        };
        setOrigin(nextOrigin);
      }

      if (!nextOrigin.lat || !nextOrigin.lng) {
        throw new Error("Origin requires valid coordinates. Use AI locate or enter lat/lng manually.");
      }

      const updatedStops = await Promise.all(
        stops.map(async (stop) => {
          if (stop.lat && stop.lng) return stop;
          if (!stop.name.trim()) {
            throw new Error(`Stop "${stop.name || "Unnamed"}" is missing coordinates and has no name to geocode.`);
          }
          const location = await geocodeLocation(stop.name);
          return {
            ...stop,
            name: location.formatted ?? location.name ?? stop.name,
            lat: location.lat,
            lng: location.lng,
          };
        }),
      );

      setStops(updatedStops);

      const data = await postJson<OptimizationResponse>("/api/route/optimize", {
        origin: nextOrigin,
        stops: updatedStops,
        transportMode: transport,
        strategy,
        weightKg,
      });

      setResult(data);
    } catch (err) {
      const apiError = err as ApiError;
      setResult(null);
      setError(
        apiError?.error ??
          (err instanceof Error ? err.message : "Failed to optimize route. Please verify the details and try again."),
      );
      setRecommendation(apiError?.recommendedModes ?? []);
      setErrorReasoning(apiError?.reasoning ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoute = useCallback(() => {
    if (!result) {
      window.alert("Generate a route before saving.");
      return;
    }

    const doc = new jsPDF();
    const marginLeft = 14;
    let currentHeight = 20;

    const addLine = (text: string, fontSize = 10) => {
      doc.setFontSize(fontSize);
      doc.text(text, marginLeft, currentHeight);
      currentHeight += fontSize / 2 + 4;
    };

    doc.setFont("helvetica", "bold");
    addLine("AI Route Summary", 16);
    doc.setFont("helvetica", "normal");

    addLine(`Generated: ${new Date(result.optimizedRoute.timestamp).toLocaleString()}`);
    addLine(`Strategy: ${result.optimizedRoute.strategy}`);
    addLine(`Transport Mode: ${result.optimizedRoute.transportMode}`);
    addLine(`Cargo Weight: ${integerFormatter.format(result.optimizedRoute.weightKg)} kg`);
    addLine(`Estimated Arrival: ${new Date(result.optimizedRoute.estimatedArrivalIso).toLocaleString()}`);

    currentHeight += 4;
    doc.setFont("helvetica", "bold");
    addLine("Key Metrics", 14);
    doc.setFont("helvetica", "normal");

    addLine(`Total Distance: ${numberFormatter.format(result.optimizedRoute.totalDistanceKm)} km`);
    addLine(`Estimated Time: ${numberFormatter.format(result.optimizedRoute.estimatedTimeHr)} hr`);
    addLine(`Total Cost: $${numberFormatter.format(result.optimizedRoute.totalCostUSD)}`);
    addLine(`Cost / kg: $${numberFormatter.format(result.optimizedRoute.costPerKgUSD)}`);
    addLine(`Fuel Used: ${numberFormatter.format(result.optimizedRoute.fuelUsedLiters)} L`);
    addLine(`CO₂ Emitted: ${numberFormatter.format(result.optimizedRoute.co2Kg)} kg`);

    currentHeight += 4;
    doc.setFont("helvetica", "bold");
    addLine("Optimized Stop Order", 14);
    doc.setFont("helvetica", "normal");

    result.optimizedRoute.order.forEach((stopName, index) => {
      addLine(`${index + 1}. ${stopName}`);
    });

    doc.save(`route-plan-${Date.now()}.pdf`);
  }, [result]);

  const handleSendDispatcher = useCallback(() => {
    if (!result) {
      window.alert("Generate a route before sending to dispatch.");
      return;
    }

    const message = [
      "Dispatch Notification",
      `Strategy: ${result.optimizedRoute.strategy}`,
      `Transport Mode: ${result.optimizedRoute.transportMode}`,
      `Stops: ${result.optimizedRoute.order.join(" ➜ ")}`,
      `ETA: ${new Date(result.optimizedRoute.estimatedArrivalIso).toLocaleString()}`,
    ].join("\n");

    window.alert(`${message}\n\n(Integrate with your dispatch system here.)`);
  }, [result]);

  const comparisonCards = useMemo(() => {
    if (!result) return [];
    const { naive, optimized, improvements } = result.comparison;

    return [
      {
        label: "Distance",
        original: `${numberFormatter.format(naive.totalDistanceKm)} km`,
        optimized: `${numberFormatter.format(optimized.totalDistanceKm)} km`,
        percent: improvements.distancePercent,
        percentLabel: `${improvements.distanceKm >= 0 ? "-" : "+"}${numberFormatter.format(
          Math.abs(improvements.distanceKm),
        )} km`,
      },
      {
        label: "Travel Time",
        original: `${numberFormatter.format(naive.totalTimeHr)} hr`,
        optimized: `${numberFormatter.format(optimized.totalTimeHr)} hr`,
        percent: improvements.timePercent,
        percentLabel: `${improvements.timeHr >= 0 ? "-" : "+"}${numberFormatter.format(
          Math.abs(improvements.timeHr),
        )} hr`,
      },
      {
        label: "Total Cost",
        original: `$${numberFormatter.format(naive.totalCostUSD)}`,
        optimized: `$${numberFormatter.format(optimized.totalCostUSD)}`,
        percent: improvements.costPercent,
        percentLabel: `${improvements.costUSD >= 0 ? "-" : "+"}$${numberFormatter.format(
          Math.abs(improvements.costUSD),
        )}`,
      },
      {
        label: "Cost / kg",
        original: `$${numberFormatter.format(naive.costPerKgUSD)}`,
        optimized: `$${numberFormatter.format(optimized.costPerKgUSD)}`,
        percent: improvements.costPerKgPercent,
        percentLabel: `${improvements.costPerKgUSD >= 0 ? "-" : "+"}$${numberFormatter.format(
          Math.abs(improvements.costPerKgUSD),
        )}`,
      },
      {
        label: "Fuel Used",
        original: `${numberFormatter.format(naive.fuelUsedLiters)} L`,
        optimized: `${numberFormatter.format(optimized.fuelUsedLiters)} L`,
        percent: improvements.fuelPercent,
        percentLabel: `${improvements.fuelLiters >= 0 ? "-" : "+"}${numberFormatter.format(
          Math.abs(improvements.fuelLiters),
        )} L`,
      },
      {
        label: "Fuel Cost",
        original: `$${numberFormatter.format(naive.fuelCostUSD)}`,
        optimized: `$${numberFormatter.format(optimized.fuelCostUSD)}`,
        percent: improvements.fuelCostPercent,
        percentLabel: `${improvements.fuelCostUSD >= 0 ? "-" : "+"}$${numberFormatter.format(
          Math.abs(improvements.fuelCostUSD),
        )}`,
      },
      {
        label: "CO₂ Emitted",
        original: `${numberFormatter.format(naive.co2Kg)} kg`,
        optimized: `${numberFormatter.format(optimized.co2Kg)} kg`,
        percent: improvements.co2Percent,
        percentLabel: `${improvements.co2Kg >= 0 ? "-" : "+"}${numberFormatter.format(
          Math.abs(improvements.co2Kg),
        )} kg`,
      },
      {
        label: "Fuel Efficiency",
        original: `${numberFormatter.format(naive.fuelEfficiencyKmPerL)} km/L`,
        optimized: `${numberFormatter.format(optimized.fuelEfficiencyKmPerL)} km/L`,
        percent: improvements.fuelEfficiencyPercent,
        percentLabel: `${improvements.fuelEfficiencyKmPerL >= 0 ? "+" : "-"}${numberFormatter.format(
          Math.abs(improvements.fuelEfficiencyKmPerL),
        )} km/L`,
      },
    ];
  }, [result]);

  const mapStops: MapStop[] = result?.optimizedRoute.stops ?? stops;
  const mapOrder = result?.optimizedRoute.order;
  const estimatedArrival = result ? new Date(result.optimizedRoute.estimatedArrivalIso).toLocaleString() : null;

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white relative inline-block">
            AI Route Planning
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--cyan-glow))] rounded-full shadow-[0_0_15px_rgba(255,122,0,0.6)]" />
          </h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Plan, optimize, and visualize multi-modal logistics routes with deterministic AI routing.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <GlassCard glow="cyan" className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Route Inputs</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">Origin</label>
                  <button
                    onClick={handleGeocodeOrigin}
                    disabled={isGeocodingOrigin}
                    className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[hsl(var(--cyan-glow))] hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeocodingOrigin ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    AI locate
                  </button>
                </div>
                <Input
                  value={origin.name}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setOrigin((prev) => ({ ...prev, name: nextValue }));
                    scheduleOriginGeocode(nextValue);
                  }}
                  placeholder="Origin name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <div className="grid grid-cols-2 gap-2">
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
                    Delivery Stops
                  </label>
                  <button onClick={addStop} className="flex items-center gap-2 text-xs text-[hsl(var(--cyan-glow))] hover:text-white transition-colors">
                    <Plus className="w-4 h-4" /> Add stop
                  </button>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {stops.map((stop, index) => {
                    const isGeocoding = geocodingStops[stop.id];
                    return (
                      <div key={stop.id} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
                        <div className="flex items-center justify-between text-[hsl(var(--text-secondary))] text-xs">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
                            Stop {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleGeocodeStop(stop.id)}
                              disabled={isGeocoding}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[hsl(var(--cyan-glow))] hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isGeocoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                              AI locate
                            </button>
                            <button
                              onClick={() => removeStop(stop.id)}
                              className="text-white/60 hover:text-red-400"
                              aria-label="Remove stop"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <Input
                          value={stop.name}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            updateStopValue(stop.id, "name", nextValue);
                            scheduleStopGeocode(stop.id, nextValue);
                          }}
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
                    );
                  })}
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
                <p className="text-[hsl(var(--text-secondary))] text-xs">Weight influences mode eligibility, fuel burn, and cost per kg.</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">Transport Mode</span>
                <div className="grid grid-cols-3 gap-2">
                  {transportOptions.map((option) => {
                    const isActive = transport === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTransport(option.id)}
                        className={`rounded-xl border px-3 py-2 text-left transition-all ${
                          isActive
                            ? "border-[hsl(var(--orange-glow))] bg-[hsl(var(--orange-glow))]/20 text-white shadow-[0_0_20px_rgba(255,122,0,0.25)]"
                            : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-white/25"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {option.icon}
                          <span>{option.label}</span>
                        </div>
                        <p className="text-xs mt-1 opacity-70">{option.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
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
                            ? "border-[hsl(var(--cyan-glow))] bg-[hsl(var(--cyan-glow))]/20 text-white shadow-[0_0_20px_rgba(0,255,255,0.25)]"
                            : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-white/25"
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

              <GlowButton variant="primary" className="w-full mt-4" onClick={handleGenerate} disabled={isLoading}>
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
                  {errorReasoning && <p className="text-xs text-red-200/80">{errorReasoning}</p>}
                  {recommendation.length > 0 && (
                    <p className="text-xs text-red-200/80">Recommended modes: {recommendation.join(", ")}</p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard glow="orange" className="xl:col-span-2 space-y-4">
            <div className="h-[360px] rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <RoutePlannerMap origin={origin} stops={mapStops} optimizedOrder={mapOrder} />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Route Overview</h3>
              <div className="text-right">
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  {result
                    ? `Optimized at ${new Date(result.optimizedRoute.timestamp).toLocaleTimeString()}`
                    : "Awaiting optimization"}
                </p>
                {estimatedArrival && (
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    Estimated Arrival: <span className="text-white">{estimatedArrival}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard glow="orange" className="bg-white/5 border border-white/10">
                <p className="text-xs text-[hsl(var(--text-secondary))]">Total Trip Cost</p>
                <p className="text-2xl font-semibold text-white break-all">
                  {result ? `$${numberFormatter.format(result.optimizedRoute.totalCostUSD)}` : "—"}
                </p>
                {result && (
                  <p
                    className={`text-xs ${
                      result.comparison.improvements.costPercent >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {result.comparison.improvements.costUSD >= 0 ? "Saved" : "Added"} ${numberFormatter.format(
                      Math.abs(result.comparison.improvements.costUSD),
                    )}
                  </p>
                )}
              </GlassCard>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-[hsl(var(--text-secondary))]">Distance</p>
                <p className="text-lg font-semibold text-white break-all">
                  {result ? `${numberFormatter.format(result.optimizedRoute.totalDistanceKm)} km` : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-[hsl(var(--text-secondary))]">Estimated Time</p>
                <p className="text-lg font-semibold text-white break-all">
                  {result ? `${numberFormatter.format(result.optimizedRoute.estimatedTimeHr)} hr` : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-[hsl(var(--text-secondary))]">Fuel Used</p>
                <p className="text-lg font-semibold text-white break-all">
                  {result ? `${numberFormatter.format(result.optimizedRoute.fuelUsedLiters)} L` : "—"}
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
                      {result ? result.optimizedRoute.transportMode : transportOptions.find((o) => o.id === transport)?.label}
                    </span>
                    <span className="text-sm text-[hsl(var(--text-secondary))]">{integerFormatter.format(weightKg)} kg cargo</span>
                  </div>
                  <p className="text-[hsl(var(--text-secondary))] text-sm leading-relaxed">
                    {result
                      ? result.optimizedRoute.reason
                      : "Select stops, transport mode, and strategy to generate an optimized route."}
                  </p>
                  {result && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[hsl(var(--text-secondary))]">Cost / kg</p>
                        <p className="text-white font-semibold break-all">
                          ${formatLargeNumber(result.optimizedRoute.costPerKgUSD)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[hsl(var(--text-secondary))]">Fuel cost</p>
                        <p className="text-white font-semibold break-all">
                          ${formatLargeNumber(result.optimizedRoute.fuelCostUSD)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[hsl(var(--text-secondary))]">CO₂ emitted</p>
                        <p className="text-white font-semibold break-all">
                          {formatLargeNumber(result.optimizedRoute.co2Kg)} kg
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[hsl(var(--text-secondary))]">Fuel efficiency</p>
                        <p className="text-white font-semibold break-all">
                          {numberFormatter.format(result.optimizedRoute.fuelEfficiencyKmPerL)} km/L
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
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
                        <span className="text-white/70 break-all">{card.original}</span>
                        <span className="text-white font-semibold break-all">{card.optimized}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`${
                            card.percent === null
                              ? "text-[hsl(var(--text-secondary))]"
                              : card.percent >= 0
                                ? "text-green-400"
                                : "text-red-400"
                          }`}
                        >
                          {formatPercent(card.percent)}
                        </span>
                        <span className="text-white/80 break-all">{card.percentLabel}</span>
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
                {(result ? result.optimizedRoute.order : stops.map((stop) => stop.name || "Stop")).map((name, idx) => (
                  <span
                    key={`${name}-${idx}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-white flex items-center gap-2 max-w-[200px] break-words"
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
                  <p className="text-white text-lg font-semibold break-all">
                    {formatLargeNumber(result.optimizedRoute.totalDistanceKm)} km
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p>ETA (Hours)</p>
                  <p className="text-white text-lg font-semibold break-all">
                    {numberFormatter.format(result.optimizedRoute.totalTimeHr)} hr
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p>Fuel Used</p>
                  <p className="text-white text-lg font-semibold break-all">
                    {formatLargeNumber(result.optimizedRoute.fuelUsedLiters)} L
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p>CO₂ Output</p>
                  <p className="text-white text-lg font-semibold break-all">
                    {formatLargeNumber(result.optimizedRoute.co2Kg)} kg
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p>Est. Arrival</p>
                  <p className="text-white text-sm font-semibold break-all">
                    {estimatedArrival}
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
                  <p>AI balanced strategy optimizes for efficiency and cost-effectiveness.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--orange-glow))]" />
                <p className="text-[hsl(var(--text-secondary))]">Time</p>
                <p className="text-sm font-semibold text-white">
                  {result ? `${numberFormatter.format(result.comparison.improvements.timePercent)}%` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Fuel className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--cyan-glow))]" />
                <p className="text-[hsl(var(--text-secondary))]">Fuel</p>
                <p className="text-sm font-semibold text-white">
                  {result ? `${numberFormatter.format(result.comparison.improvements.fuelPercent)}%` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Leaf className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-[hsl(var(--text-secondary))]">Eco</p>
                <p className="text-sm font-semibold text-white">
                  {result ? `${numberFormatter.format(result.comparison.improvements.co2Percent)}%` : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <GlowButton variant="primary" className="w-full" disabled={!result} onClick={handleSaveRoute}>
                Save Route
              </GlowButton>
              <GlowButton variant="outline" className="w-full" disabled={!result} onClick={handleSendDispatcher}>
                Send to Dispatcher
              </GlowButton>
              <button
                className="w-full px-4 py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors disabled:opacity-50"
                disabled={!result}
                onClick={() =>
                  result
                    ? window.alert("TMS export coming soon — integrate your preferred workflow here.")
                    : window.alert("Generate a route before exporting.")
                }
              >
                Export to TMS
              </button>
            </div>
          </GlassCard>
        </div>

        {result && (
          <GlassCard glow="cyan" className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Detailed Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[hsl(var(--text-secondary))]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide">Original Route</p>
                <div className="flex items-center gap-2 text-white text-lg font-semibold break-all">
                  <DollarSign className="w-4 h-4" />
                  ${numberFormatter.format(result.comparison.naive.totalCostUSD)}
                </div>
                <p>Distance: {numberFormatter.format(result.comparison.naive.totalDistanceKm)} km</p>
                <p>ETA: {numberFormatter.format(result.comparison.naive.totalTimeHr)} hr</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide">Optimized Route</p>
                <div className="flex items-center gap-2 text-white text-lg font-semibold break-all">
                  <DollarSign className="w-4 h-4" />
                  ${numberFormatter.format(result.comparison.optimized.totalCostUSD)}
                </div>
                <p>Distance: {numberFormatter.format(result.comparison.optimized.totalDistanceKm)} km</p>
                <p>ETA: {numberFormatter.format(result.comparison.optimized.estimatedTimeHr)} hr</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide">Savings Snapshot</p>
                <p
                  className={`text-lg font-semibold ${
                    result.comparison.improvements.costUSD >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.comparison.improvements.costUSD >= 0 ? "Saved" : "Added"} ${numberFormatter.format(
                    Math.abs(result.comparison.improvements.costUSD),
                  )}
                </p>
                <p>
                  Fuel Δ: {result.comparison.improvements.fuelLiters >= 0 ? "-" : "+"}
                  {numberFormatter.format(Math.abs(result.comparison.improvements.fuelLiters))} L
                </p>
                <p>
                  CO₂ Δ: {result.comparison.improvements.co2Kg >= 0 ? "-" : "+"}
                  {numberFormatter.format(Math.abs(result.comparison.improvements.co2Kg))} kg
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default RoutePlanning;
