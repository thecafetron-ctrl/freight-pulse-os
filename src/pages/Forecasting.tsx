import { useCallback, useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Loader2,
  Rocket,
  Sparkles,
  Download,
  FileText,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PlusCircle,
  Send,
  MapPin,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { API_BASE_URL } from "@/lib/api";

const API_ROOT = `${API_BASE_URL.replace(/\/+$/, "")}/api`;

const apiPath = (path: string) => `${API_ROOT}${path}`;

interface HistoricalPoint {
  week: string;
  loads: number;
}

interface LaneData {
  lane: string;
  origin: string;
  destination: string;
  history: HistoricalPoint[];
}

interface ForecastPoint {
  week: string;
  predicted_loads: number;
}

interface ForecastResult {
  lane: string;
  forecast: ForecastPoint[];
  trend_summary: string;
  trend_direction?: "rising" | "stable" | "falling";
  explanation?: string;
  confidence?: "high" | "medium" | "low";
  timestamp?: string;
}

interface AccuracyMetrics {
  mae: number;
  mape: number;
  rmse: number;
  dataPoints: number;
}

interface AccuracyPayload {
  metrics: AccuracyMetrics | null;
  rating: { label: string; color: string } | null;
  history: Array<{ timestamp: string; mape: number; mae: number; rmse: number }>;
}

interface Anomaly {
  lane: string;
  type: "spike" | "drop" | "stable";
  severity: "low" | "medium" | "high";
  message: string;
  percentChange: number;
}

interface ScenarioResult {
  impact: {
    percentChange: number;
    direction: string;
    description: string;
  };
  explanation: string;
}

interface MockDataResponse {
  success: boolean;
  data: LaneData[];
  lanes: string[];
  error?: string;
}

interface ForecastApiResponse {
  success: boolean;
  forecast: ForecastPoint[];
  trend_summary: string;
  trend_direction?: "rising" | "stable" | "falling";
  explanation?: string;
  confidence?: "high" | "medium" | "low";
  timestamp: string;
  error?: string;
}

interface ScenarioApiResponse {
  success: boolean;
  impact: { percentChange: number; direction: string; description: string };
  scenarioExplanation: string;
  error?: string;
}

interface AccuracyResponse {
  success: boolean;
  metrics: AccuracyMetrics | null;
  rating: { label: string; color: string } | null;
  history?: Array<{ timestamp: string; mape: number; mae: number; rmse: number }>;
  error?: string;
}

interface AlertsResponse {
  success: boolean;
  alerts: Anomaly[];
  error?: string;
}

const FALLBACK_LANES: LaneData[] = (() => {
  const createHistory = (base: number, amplitude: number, phase: number): HistoricalPoint[] => {
    const points: HistoricalPoint[] = [];
    const start = new Date("2023-01-01");
    for (let i = 0; i < 104; i += 1) {
      const date = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const seasonal = amplitude * Math.sin((2 * Math.PI * i) / 52 + phase);
      const noise = (Math.random() - 0.5) * base * 0.2;
      const trend = (i / 52) * base * 0.005;
      const loads = Math.max(50, Math.round(base + seasonal + noise + trend));
      points.push({
        week: date.toISOString().slice(0, 10),
        loads,
      });
    }
    return points;
  };

  return [
    {
      lane: "Dallas, TX → Atlanta, GA",
      origin: "Dallas, TX",
      destination: "Atlanta, GA",
      history: createHistory(150, 30, 0),
    },
    {
      lane: "Chicago, IL → Denver, CO",
      origin: "Chicago, IL",
      destination: "Denver, CO",
      history: createHistory(120, 25, Math.PI / 4),
    },
    {
      lane: "Houston, TX → Phoenix, AZ",
      origin: "Houston, TX",
      destination: "Phoenix, AZ",
      history: createHistory(180, 40, Math.PI / 2),
    },
    {
      lane: "Los Angeles, CA → Newark, NJ",
      origin: "Los Angeles, CA",
      destination: "Newark, NJ",
      history: createHistory(200, 35, Math.PI / 3),
    },
    {
      lane: "Seattle, WA → Chicago, IL",
      origin: "Seattle, WA",
      destination: "Chicago, IL",
      history: createHistory(140, 28, Math.PI / 1.8),
    },
    {
      lane: "Miami, FL → Charlotte, NC",
      origin: "Miami, FL",
      destination: "Charlotte, NC",
      history: createHistory(110, 22, Math.PI / 2.6),
    },
  ];
})();

const addWeeks = (date: Date, weeks: number) => new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

const buildFallbackForecast = (lane: LaneData, horizon: number): ForecastPoint[] => {
  const history = lane.history;
  const lastDate = new Date(history[history.length - 1].week);
  let lastValue = history[history.length - 1].loads;

  return Array.from({ length: horizon }).map((_, index) => {
    const date = addWeeks(lastDate, index + 1);
    const seasonalShift = 10 * Math.sin((2 * Math.PI * (history.length + index)) / 26);
    lastValue = Math.round(lastValue * (0.98 + Math.random() * 0.04) + seasonalShift);
    return {
      week: date.toISOString().slice(0, 10),
      predicted_loads: Math.max(50, lastValue),
    };
  });
};

const summarizeTrend = (lane: LaneData, forecast: ForecastPoint[]) => {
  const actualAvg = lane.history.slice(-8).reduce((acc, item) => acc + item.loads, 0) / 8;
  const forecastAvg = forecast.reduce((acc, item) => acc + item.predicted_loads, 0) / forecast.length;
  const change = actualAvg === 0 ? 0 : ((forecastAvg - actualAvg) / actualAvg) * 100;
  const direction = change > 5 ? "rising" : change < -5 ? "falling" : "stable";
  const summary = change > 5
    ? `Demand expected to rise approximately ${Math.abs(change).toFixed(1)}% over the next period.`
    : change < -5
      ? `Demand projected to soften by about ${Math.abs(change).toFixed(1)}%.`
      : "Demand likely to remain stable in the near term.";
  return { direction, summary, change };
};

const createLocalLaneData = (
  origin: string,
  destination: string,
  baseLoad: number = 160,
  amplitude: number = 35,
): LaneData => {
  const lane = `${origin.trim()} → ${destination.trim()}`;
  const history: HistoricalPoint[] = [];
  const start = new Date("2023-01-01");
  let lastValue = baseLoad;

  for (let i = 0; i < 104; i += 1) {
    const currentWeek = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const seasonal = amplitude * Math.sin((2 * Math.PI * i) / 52 + (origin.length + destination.length) * 0.1);
    const trend = (i / 52) * baseLoad * 0.007;
    const noiseSeed = Math.sin((i + origin.charCodeAt(0) + destination.charCodeAt(0)) * 12.9898) * 43758.5453;
    const noise = (noiseSeed - Math.floor(noiseSeed) - 0.5) * baseLoad * 0.2;
    lastValue = Math.max(50, Math.round(baseLoad + seasonal + trend + noise));
    history.push({
      week: currentWeek.toISOString().slice(0, 10),
      loads: lastValue,
    });
  }

  return {
    lane,
    origin: origin.trim(),
    destination: destination.trim(),
    history,
  };
};

const buildLocalChatResponse = (
  lane: string | undefined,
  question: string,
  laneData?: LaneData,
  forecast?: ForecastPoint[],
): string => {
  const target = lane || "the selected lane";
  if (!laneData) {
    return `I'm running in offline mode, but based on simulated data for ${target}, demand is expected to remain stable. Once the AI service reconnects I can give you live insights.`;
  }

  const simulatedForecast = forecast && forecast.length > 0 ? forecast : buildFallbackForecast(laneData, 8);
  const { summary } = summarizeTrend(laneData, simulatedForecast);
  const recentLoads = laneData.history.slice(-4).reduce((acc, item) => acc + item.loads, 0) / 4;

  return `Offline insight for ${target}: ${summary} Recent weekly volume is averaging about ${Math.round(recentLoads)} loads. I generated this locally while the AI service is disconnected, so reconnect for a deeper answer to: "${question}".`;
};

const LANE_COLORS = [
  { actual: "#22d3ee", forecast: "#f97316", previous: "#22d3ee" },
  { actual: "#a855f7", forecast: "#fb7185", previous: "#a855f7" },
  { actual: "#facc15", forecast: "#34d399", previous: "#facc15" },
];

const confidenceLabel: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

const confidenceColor: Record<string, string> = {
  high: "text-[hsl(var(--cyan-glow))]",
  medium: "text-[hsl(var(--orange-glow))]",
  low: "text-yellow-400",
};

type ChartPoint = Record<string, number | string | undefined> & { week: string };
type ChatMessage = { role: "assistant" | "user"; content: string };

const Forecasting = () => {
  const [lanes, setLanes] = useState<LaneData[]>([]);
  const [selectedLanes, setSelectedLanes] = useState<string[]>([]);
  const [horizon, setHorizon] = useState<number>(8);
  const [loading, setLoading] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendSummary, setTrendSummary] = useState<string>("");
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [forecastResults, setForecastResults] = useState<Map<string, ForecastResult>>(new Map());
  const [previousResults, setPreviousResults] = useState<Map<string, ForecastResult>>(new Map());
  const [showPrevious, setShowPrevious] = useState(false);
  const [laneIndicators, setLaneIndicators] = useState<ForecastResult[]>([]);
  const [accuracyData, setAccuracyData] = useState<AccuracyPayload | null>(null);
  const [alerts, setAlerts] = useState<Anomaly[]>([]);
  const [scenarioText, setScenarioText] = useState<string>("");
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [customRouteOpen, setCustomRouteOpen] = useState(false);
  const [customOrigin, setCustomOrigin] = useState("");
  const [customDestination, setCustomDestination] = useState("");
  const [customBaseLoad, setCustomBaseLoad] = useState<number>(160);
  const [customAmplitude, setCustomAmplitude] = useState<number>(35);
  const [customSubmitting, setCustomSubmitting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Ask me about lane trends, forecast risks, or capacity planning." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [laneSheetOpen, setLaneSheetOpen] = useState(false);

  useEffect(() => {
    const loadMockData = async () => {
      try {
        const response = await fetch(apiPath("/mockdata"));
        const data: MockDataResponse = await response.json();
        if (!data.success) throw new Error(data.error || "Failed to fetch mock data");
        setLanes(data.data);
        setSelectedLanes([data.lanes[0]]);
        setBackendAvailable(true);
        setOfflineMode(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setBackendAvailable(false);
        setOfflineMode(true);
        setError(null);
        const fallback = FALLBACK_LANES;
        setLanes(fallback);
        setSelectedLanes([fallback[0].lane]);
      }
    };
    loadMockData();
  }, []);

  const laneLookup = useMemo(() => new Map(lanes.map((lane) => [lane.lane, lane])), [lanes]);

  const toggleLane = (lane: string) => {
    setSelectedLanes((prev) => {
      if (prev.includes(lane)) {
        const updated = prev.filter((item) => item !== lane);
        return updated.length === 0 ? prev : updated;
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, lane];
    });
  };

  const handleCreateCustomLane = async () => {
    const origin = customOrigin.trim();
    const destination = customDestination.trim();
    if (!origin || !destination) {
      setError("Origin and destination are required to add a custom route.");
      return;
    }

    setCustomSubmitting(true);
    const baseLoad = Math.max(20, Number.isFinite(customBaseLoad) ? customBaseLoad : 160);
    const amplitude = Math.max(5, Number.isFinite(customAmplitude) ? customAmplitude : 35);

    const payload = {
      origin,
      destination,
      baseLoad,
      amplitude,
    };

    let laneData: LaneData | null = null;

    try {
      const response = await fetch(apiPath("/custom-route"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create custom route");
      }
      laneData = data.data as LaneData;
      setBackendAvailable(true);
      setOfflineMode(false);
    } catch (err) {
      console.error(err);
      laneData = createLocalLaneData(origin, destination, baseLoad, amplitude);
      setBackendAvailable(false);
      setOfflineMode(true);
    }

    if (laneData) {
      setLanes((prev) => {
        const filtered = prev.filter((item) => item.lane !== laneData!.lane);
        return [...filtered, laneData!];
      });
      setSelectedLanes((prev) => [laneData.lane, ...prev.filter((item) => item !== laneData!.lane)].slice(0, 3));
      setCustomRouteOpen(false);
      setCustomOrigin("");
      setCustomDestination("");
      setError(null);
    }

    setCustomSubmitting(false);
  };

  const handleSendChat = async () => {
    const prompt = chatInput.trim();
    if (!prompt) return;

    const lane = selectedLanes[0];
    const laneData = lane ? laneLookup.get(lane) : undefined;
    const forecast = lane ? forecastResults.get(lane)?.forecast : undefined;

    setChatMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setChatInput("");
    setChatLoading(true);

    try {
      let reply: string | null = null;
      try {
        const response = await fetch(apiPath("/forecast/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lane,
            question: prompt,
            history: laneData?.history,
            forecast,
            trend_summary: lane ? forecastResults.get(lane)?.trend_summary : undefined,
          }),
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "Assistant failed to respond");
        }
        reply = String(data.message);
        setBackendAvailable(true);
        setOfflineMode(false);
      } catch (remoteError) {
        console.error(remoteError);
        reply = null;
        setBackendAvailable(false);
        setOfflineMode(true);
      }

      if (!reply) {
        const fallbackLaneData = laneData
          ?? (selectedLanes.length > 0 ? laneLookup.get(selectedLanes[0]) : undefined)
          ?? FALLBACK_LANES[0];
        const fallbackLaneName = lane ?? fallbackLaneData.lane;
        const fallbackForecast = forecast && forecast.length > 0
          ? forecast
          : buildFallbackForecast(fallbackLaneData, horizon);
        reply = buildLocalChatResponse(fallbackLaneName, prompt, fallbackLaneData, fallbackForecast);
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: reply! }]);
    } finally {
      setChatLoading(false);
    }
  };

  const buildChartData = useCallback((
    currentLanes: string[],
    currentResults: Map<string, ForecastResult>,
    previous: Map<string, ForecastResult>,
    includePrevious: boolean,
  ): ChartPoint[] => {
    if (currentLanes.length === 0) return [];

    const weeks = new Set<string>();

    currentLanes.forEach((lane) => {
      const laneData = laneLookup.get(lane);
      const forecast = currentResults.get(lane);
      if (!laneData) return;

      laneData.history.slice(-8).forEach((point) => weeks.add(point.week));
      forecast?.forecast.forEach((point) => weeks.add(point.week));

      if (includePrevious) {
        const prev = previous.get(lane);
        prev?.forecast.forEach((point) => weeks.add(point.week));
      }
    });

    const sortedWeeks = Array.from(weeks).sort();

    return sortedWeeks.map((week) => {
      const point: ChartPoint = { week };
      currentLanes.forEach((lane) => {
        const laneData = laneLookup.get(lane);
        const active = currentResults.get(lane);
        const prev = previous.get(lane);

        if (laneData) {
          const actual = laneData.history.find((item) => item.week === week);
          if (actual) {
            point[`${lane}_actual`] = actual.loads;
          }
        }

        if (active) {
          const forecastPoint = active.forecast.find((item) => item.week === week);
          if (forecastPoint) {
            point[`${lane}_forecast`] = forecastPoint.predicted_loads;
          }
        }

        if (includePrevious && prev) {
          const previousPoint = prev.forecast.find((item) => item.week === week);
          if (previousPoint) {
            point[`${lane}_previous`] = previousPoint.predicted_loads;
          }
        }
      });
      return point;
    });
  }, [laneLookup]);

  const fetchAccuracy = async (lane: string) => {
    if (!backendAvailable) {
      setAccuracyData({
        metrics: {
          mae: 5,
          mape: 3.5,
          rmse: 6,
          dataPoints: 8,
        },
        rating: { label: "Simulated", color: "blue" },
        history: [],
      });
      return;
    }
    try {
      const response = await fetch(`${apiPath("/accuracy")}?lane=${encodeURIComponent(lane)}`);
      const data: AccuracyResponse = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to compute accuracy");
      setAccuracyData({ metrics: data.metrics, rating: data.rating, history: data.history || [] });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlerts = async (lanesToCheck: string[]) => {
    if (lanesToCheck.length === 0) return;
    if (!backendAvailable) {
      const fallbackAlerts = lanesToCheck.map((lane) => {
        const data = laneLookup.get(lane);
        if (!data) return null;
        const forecast = buildFallbackForecast(data, horizon);
        const { change, summary } = summarizeTrend(data, forecast);
        if (Math.abs(change) < 20) return null;
        return {
          lane,
          type: change > 0 ? "spike" : "drop",
          severity: Math.abs(change) > 40 ? "high" : Math.abs(change) > 30 ? "medium" : "low",
          message: summary,
          percentChange: Number(change.toFixed(1)),
        } as Anomaly;
      }).filter((item): item is Anomaly => item !== null);
      setAlerts(fallbackAlerts);
      return;
    }
    try {
      const response = await fetch(
        `${apiPath("/alerts")}?lanes=${lanesToCheck.map((lane) => encodeURIComponent(lane)).join(",")}`,
      );
      const data: AlertsResponse = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to load alerts");
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const generateForecasts = async () => {
    if (selectedLanes.length === 0) {
      setError("Select at least one lane to generate a forecast.");
      return;
    }

    setError(null);
    setScenarioResult(null);
    setLoading(true);

    const newResults = new Map<string, ForecastResult>();
    const summaryLines: string[] = [];

    const runRemote = async () => {
      for (const lane of selectedLanes) {
        const laneData = laneLookup.get(lane);
        if (!laneData) continue;

        const response = await fetch(apiPath("/forecast"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lane, history: laneData.history, horizon }),
        });

        const data: ForecastApiResponse & { error?: string } = await response.json();
        if (!data.success) throw new Error(data.error || `Failed to generate forecast for ${lane}`);

        newResults.set(lane, {
          lane,
          forecast: data.forecast,
          trend_summary: data.trend_summary,
          trend_direction: data.trend_direction,
          explanation: data.explanation,
          confidence: data.confidence,
          timestamp: data.timestamp,
        });

        summaryLines.push(`${lane}: ${data.trend_summary}`);
      }
    };

    const runFallback = () => {
      selectedLanes.forEach((lane) => {
        const laneData = laneLookup.get(lane);
        if (!laneData) return;
        const forecast = buildFallbackForecast(laneData, horizon);
        const { direction, summary } = summarizeTrend(laneData, forecast);
        newResults.set(lane, {
          lane,
          forecast,
          trend_summary: summary,
          trend_direction: direction,
          explanation: summary,
          confidence: "medium",
          timestamp: new Date().toISOString(),
        });
        summaryLines.push(`${lane}: ${summary}`);
      });
      setBackendAvailable(false);
      setOfflineMode(true);
    };

    try {
      let remoteSucceeded = false;
      try {
        await runRemote();
        if (newResults.size > 0) {
          remoteSucceeded = true;
          setBackendAvailable(true);
          setOfflineMode(false);
        }
      } catch (remoteError) {
        console.error(remoteError);
        newResults.clear();
        summaryLines.length = 0;
        setBackendAvailable(false);
      }

      if (!remoteSucceeded) {
        runFallback();
      }

      if (newResults.size === 0) {
        throw new Error("No forecasts generated. Ensure API is reachable.");
      }

      setPreviousResults(new Map(forecastResults));
      setForecastResults(newResults);
      setTrendSummary(summaryLines.join("\n\n"));
      const timeString = new Date().toLocaleTimeString();
      setLastGenerated(timeString);

      const indicators = selectedLanes.map((lane) => newResults.get(lane)).filter(Boolean) as ForecastResult[];
      setLaneIndicators(indicators);

      await fetchAccuracy(selectedLanes[0]);
      await fetchAlerts(selectedLanes);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Forecast generation failed.");
      if (newResults.size === 0) {
        runFallback();
        setPreviousResults(new Map(forecastResults));
        setForecastResults(newResults);
        setTrendSummary(summaryLines.join("\n\n"));
        const timeString = new Date().toLocaleTimeString();
        setLastGenerated(timeString);
        const indicators = selectedLanes.map((lane) => newResults.get(lane)).filter(Boolean) as ForecastResult[];
        setLaneIndicators(indicators);
      }
    } finally {
      setLoading(false);
    }
  };

  const runScenario = async () => {
    if (!scenarioText.trim() || selectedLanes.length === 0) {
      return;
    }

    const lane = selectedLanes[0];
    const laneData = laneLookup.get(lane);
    if (!laneData) return;

    setScenarioLoading(true);
    setScenarioResult(null);

    if (!backendAvailable) {
      const baseForecast = buildFallbackForecast(laneData, horizon);
      const adjustedForecast = baseForecast.map((item, index) => ({
        ...item,
        predicted_loads: Math.max(50, Math.round(item.predicted_loads * (1 + 0.05 + index * 0.01))),
      }));
      const { change } = summarizeTrend(laneData, adjustedForecast);
      setScenarioResult({
        impact: {
          percentChange: Number(change.toFixed(1)),
          direction: change > 0 ? "increase" : change < 0 ? "decrease" : "neutral",
          description: `Scenario would result in ${Math.abs(Math.round(change))}% ${
            change > 0 ? "increase" : change < 0 ? "decrease" : "change"
          } in average demand`,
        },
        explanation: `Scenario applied locally. Forecast adjusted upward to reflect "${scenarioText.trim()}" assumptions.`,
      });
      setScenarioLoading(false);
      return;
    }

    try {
      const response = await fetch(apiPath("/forecast/scenario"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lane, scenario: scenarioText.trim(), horizon, history: laneData.history }),
      });
      const data: ScenarioApiResponse = await response.json();
      if (!data.success) throw new Error(data.error || "Scenario simulation failed");
      setScenarioResult({
        impact: data.impact,
        explanation: data.scenarioExplanation,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Scenario simulation failed.");
    } finally {
      setScenarioLoading(false);
    }
  };

  const chartData = useMemo(
    () => buildChartData(selectedLanes, forecastResults, previousResults, showPrevious),
    [buildChartData, selectedLanes, forecastResults, previousResults, showPrevious],
  );

  const chartHasData = useMemo(
    () => chartData.length > 0 && selectedLanes.length > 0,
    [chartData, selectedLanes],
  );


  const exportLaneName = selectedLanes[0];

  const getExportRows = () => {
    if (!exportLaneName) return [];
    return chartData.map((point) => ({
      week: point.week,
      actual: point[`${exportLaneName}_actual`],
      forecast: point[`${exportLaneName}_forecast`],
    }));
  };

  const downloadCSV = () => {
    const rows = getExportRows();
    if (rows.length === 0 || !exportLaneName) return;

    const sanitizedSummary = trendSummary.replace(/"/g, '""');
    const lines = [
      `Demand Forecast Report - ${exportLaneName}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "Week,Actual Loads,Forecasted Loads",
      ...rows.map((row) => `${row.week},${row.actual ?? ""},${row.forecast ?? ""}`),
      "",
      "AI Summary",
      `"${sanitizedSummary}"`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forecast-${exportLaneName.replace(/[^a-z0-9]/gi, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const rows = getExportRows();
    if (rows.length === 0 || !exportLaneName) return;

    const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Demand Forecast - ${exportLaneName}</title>
        <style>
          body { font-family: 'Inter', sans-serif; color: #0f172a; padding: 32px; }
          h1 { margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .summary { background: #f8fafc; padding: 16px; border-radius: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <h1>Demand Forecast Report</h1>
        <p><strong>Lane:</strong> ${exportLaneName}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr><th>Week</th><th>Actual Loads</th><th>Forecasted Loads</th></tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `<tr><td>${row.week}</td><td>${row.actual ?? ""}</td><td>${row.forecast ?? ""}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
        <div class="summary">
          <h3>AI Analysis</h3>
          <p>${trendSummary.replace(/\n/g, "<br/>")}</p>
        </div>
      </body>
      </html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getTrendIcon = (direction?: string) => {
    if (direction === "rising") return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (direction === "falling") return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-blue-400" />;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0 || typeof label !== "string") {
      return null;
    }

    return (
      <div className="rounded-xl border border-white/10 bg-[hsl(var(--navy-panel))] px-4 py-3 shadow-lg">
        <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))] mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((item) => {
            const entry = item as Payload<number, string>;
            const value = typeof entry.value === "number" ? Math.round(entry.value).toLocaleString() : entry.value;
            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-6 text-[13px]">
                <span style={{ color: entry.color ?? "#e2e8f0" }}>{entry.name}</span>
                <span className="text-white font-semibold">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-fade-in">
          <div>
          <h1 className="text-4xl font-bold text-white">AI Demand Forecasting</h1>
            <p className="text-[hsl(var(--text-secondary))]">
              Multi-lane predictive analytics with AI explainability and scenario planning
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <GlowButton
              variant="secondary"
              className="flex items-center gap-2"
              onClick={downloadCSV}
            >
              <Download className="w-4 h-4" /> CSV Export
            </GlowButton>
            <GlowButton
              variant="outline"
              className="flex items-center gap-2"
              onClick={downloadPDF}
            >
              <FileText className="w-4 h-4" /> PDF Export
            </GlowButton>
            <GlowButton
              className="flex items-center gap-2"
              onClick={generateForecasts}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Forecasting...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" /> Generate Forecast
                </>
              )}
            </GlowButton>
          </div>
        </div>

        {offlineMode && (
          <div className="rounded-xl border border-[hsl(var(--cyan-glow))]/40 bg-[hsl(var(--cyan-glow))]/10 p-4 text-sm text-white">
            Running in offline demo mode—forecasts and alerts are simulated locally because the AI service is disconnected.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-200 hover:text-red-100">Dismiss</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-6">
            <GlassCard glow="cyan" className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Lane Controls</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPrevious((prev) => !prev)}
                    className={`flex items-center gap-2 text-xs ${
                      showPrevious ? "text-[hsl(var(--cyan-glow))]" : "text-[hsl(var(--text-secondary))]"
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${showPrevious ? "animate-spin" : ""}`} />
                    Compare Previous
                  </button>
                  <button
                    onClick={() => setCustomRouteOpen(true)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-white hover:border-[hsl(var(--cyan-glow))]/50 hover:bg-[hsl(var(--cyan-glow))]/10"
                  >
                    <PlusCircle className="w-3 h-3" /> Custom Route
                  </button>
                </div>
              </div>

              <div className="lg:hidden">
                <GlowButton
                  variant="secondary"
                  className="w-full items-center justify-center gap-2"
                  onClick={() => setLaneSheetOpen(true)}
                >
                  <MapPin className="w-4 h-4" /> Select Routes
                </GlowButton>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedLanes.map((lane) => (
                    <span
                      key={`chip-${lane}`}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white"
                    >
                      {lane.split("→")[0].trim()}
                    </span>
                  ))}
                  {selectedLanes.length === 0 && (
                    <span className="text-xs text-[hsl(var(--text-secondary))]">
                      No routes selected yet.
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden space-y-3 lg:block">
                {lanes.map((lane, index) => {
                  const selected = selectedLanes.includes(lane.lane);
                  const palette = LANE_COLORS[index % LANE_COLORS.length];
                  return (
                    <button
                      key={lane.lane}
                      onClick={() => toggleLane(lane.lane)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                        selected
                          ? "border-[hsl(var(--cyan-glow))]/60 bg-[hsl(var(--cyan-glow))]/15 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                          : "border-white/10 bg-white/5 hover:border-[hsl(var(--cyan-glow))]/30 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
              <div>
                          <p className="font-semibold text-white">{lane.lane}</p>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">
                            {lane.origin} • {lane.destination}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ background: palette.actual }}
                          />
                          <span className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                            {selected ? "Active" : "Tap to add"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--text-secondary))]">Forecast Horizon</label>
                <Select value={String(horizon)} onValueChange={(value) => setHorizon(Number(value))}>
                  <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Weeks • Tactical</SelectItem>
                    <SelectItem value="8">8 Weeks • Standard</SelectItem>
                    <SelectItem value="12">12 Weeks • Quarterly</SelectItem>
                    <SelectItem value="24">24 Weeks • Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-[hsl(var(--text-secondary))]">
                Selected lanes: {selectedLanes.length} / 3 • Horizon: {horizon} weeks
              </p>
            </GlassCard>

            <GlassCard glow="orange" className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Scenario Simulation</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Apply business assumptions to the first selected lane
                </p>
              </div>
              <textarea
                rows={4}
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                placeholder="e.g. Fuel prices increase by 15% or Add new shipper in Dallas"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-[hsl(var(--text-secondary))] focus:border-[hsl(var(--orange-glow))]/60 focus:outline-none"
              />
              <GlowButton
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
                onClick={runScenario}
              >
                {scenarioLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Simulating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Scenario
                  </>
                )}
              </GlowButton>

              {scenarioResult && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-semibold">Impact on demand</span>
                    <span className={`text-sm font-bold ${
                      scenarioResult.impact.direction === "increase"
                        ? "text-green-400"
                        : scenarioResult.impact.direction === "decrease"
                        ? "text-red-400"
                        : "text-[hsl(var(--text-secondary))]"
                    }`}>
                      {scenarioResult.impact.percentChange > 0 ? "+" : ""}
                      {scenarioResult.impact.percentChange}%
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    {scenarioResult.impact.description}
                  </p>
                  <p className="text-xs text-white/80">
                    {scenarioResult.explanation}
                  </p>
                </div>
              )}
            </GlassCard>
            </div>

          <GlassCard glow="orange" className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Multi-Lane Forecast Dashboard</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Actual vs forecasted loads with AI-driven trend detection
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {laneIndicators.map((indicator, index) => (
                  <div
                    key={indicator.lane}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: LANE_COLORS[index % LANE_COLORS.length].actual }} />
                    <span className="text-xs text-white font-medium">{indicator.lane.split("→")[0].trim()}</span>
                    {getTrendIcon(indicator.trend_direction)}
                    <span className={`text-[10px] uppercase ${confidenceColor[indicator.confidence || "medium"]}`}>
                      {confidenceLabel[indicator.confidence || "medium"]}
                    </span>
              </div>
                ))}
              </div>
            </div>

            <div className="h-[420px] rounded-2xl border border-white/5 bg-gradient-to-br from-[hsl(var(--navy-panel))] to-[hsl(var(--navy-medium))] p-4">
              {chartHasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#e2e8f0" }} />
                    {selectedLanes.map((lane, index) => {
                      const palette = LANE_COLORS[index % LANE_COLORS.length];
                      return (
                        <>
                          <Line
                            key={`${lane}-actual`}
                            type="monotone"
                            dataKey={`${lane}_actual`}
                            stroke={palette.actual}
                            strokeWidth={2.5}
                            dot={{ r: 3 }}
                            name={`${lane} • Actual`}
                            connectNulls
                          />
                          <Line
                            key={`${lane}-forecast`}
                            type="monotone"
                            dataKey={`${lane}_forecast`}
                            stroke={palette.forecast}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 0 }}
                            name={`${lane} • Forecast`}
                            connectNulls
                          />
                          {showPrevious && previousResults.has(lane) && (
                            <Line
                              key={`${lane}-previous`}
                              type="monotone"
                              dataKey={`${lane}_previous`}
                              stroke={palette.previous}
                              strokeWidth={1.5}
                              strokeDasharray="1 8"
                              dot={false}
                              opacity={0.4}
                              name={`${lane} • Previous Forecast`}
                              connectNulls
                            />
                          )}
                        </>
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-[hsl(var(--text-secondary))]">
                  <Sparkles className="h-10 w-10 text-[hsl(var(--cyan-glow))]" />
                  <p className="text-sm">Select lanes and generate a forecast to visualize demand projections.</p>
                </div>
              )}
            </div>

            {trendSummary && (
              <div className="rounded-2xl border border-[hsl(var(--cyan-glow))]/30 bg-[hsl(var(--cyan-glow))]/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">AI Trend Summary</h4>
                    {lastGenerated && (
                      <p className="text-xs text-[hsl(var(--text-secondary))]">Last generated at {lastGenerated}</p>
                    )}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-white/80">{trendSummary}</p>
              </div>
            )}

            {laneIndicators.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {laneIndicators.map((indicator, index) => (
                  <div
                    key={`${indicator.lane}-insight`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{indicator.lane}</span>
                      {getTrendIcon(indicator.trend_direction)}
                  </div>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">
                      {indicator.explanation || indicator.trend_summary}
                    </p>
                  </div>
                ))}
                </div>
            )}
          </GlassCard>

          <div className="space-y-6">
            <GlassCard glow="cyan" className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Forecast Accuracy</h3>
                <Activity className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
              </div>
              {accuracyData?.metrics ? (
                <>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-[hsl(var(--text-secondary))]">MAE</p>
                      <p className="text-lg font-semibold text-white">{accuracyData.metrics.mae.toFixed(1)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-[hsl(var(--text-secondary))]">MAPE</p>
                      <p className="text-lg font-semibold text-white">{accuracyData.metrics.mape.toFixed(1)}%</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-[hsl(var(--text-secondary))]">RMSE</p>
                      <p className="text-lg font-semibold text-white">{accuracyData.metrics.rmse.toFixed(1)}</p>
                    </div>
                  </div>
                  {accuracyData.rating && (
                    <p className={`text-xs font-semibold uppercase ${
                      accuracyData.rating.color === "green"
                        ? "text-green-400"
                        : accuracyData.rating.color === "blue"
                        ? "text-[hsl(var(--cyan-glow))]"
                        : accuracyData.rating.color === "yellow"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}>
                      {accuracyData.rating.label} accuracy based on {accuracyData.metrics.dataPoints} data points
                    </p>
                  )}
                  {accuracyData.history.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-[hsl(var(--text-secondary))]">Accuracy over time</p>
                      <div className="max-h-32 space-y-1 overflow-y-auto pr-1 text-xs">
                        {accuracyData.history.map((entry) => (
                          <div key={entry.timestamp} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <span className="text-[hsl(var(--text-secondary))]">{new Date(entry.timestamp).toLocaleString()}</span>
                            <span className="text-white font-semibold">{entry.mape}% MAPE</span>
                </div>
                        ))}
                  </div>
                </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Generate a forecast to compute accuracy metrics for the most recent run.
                </p>
              )}
            </GlassCard>

            <GlassCard glow="cyan" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Alerts & Anomalies</h3>
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              </div>

              {alerts.length === 0 ? (
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  No anomalies detected yet. Generate a forecast to run anomaly checks.
                </p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={`${alert.lane}-${alert.message}`}
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        alert.severity === "high"
                          ? "border-red-500/50 bg-red-500/10"
                          : alert.severity === "medium"
                          ? "border-yellow-500/40 bg-yellow-500/10"
                          : "border-[hsl(var(--cyan-glow))]/40 bg-[hsl(var(--cyan-glow))]/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{alert.lane}</span>
                        <span className="text-xs text-white/70">{alert.percentChange.toFixed(1)}%</span>
                  </div>
                      <p className="text-xs text-white/80 mt-1">{alert.message}</p>
                </div>
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard glow="cyan" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">AI Conversation</h3>
                <span className="text-xs text-[hsl(var(--text-secondary))]">
                  {backendAvailable ? "Live" : "Offline demo"}
                </span>
              </div>
              <ScrollArea className="h-60 pr-2">
                <div className="space-y-3">
                  {chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        message.role === "assistant"
                          ? "border-white/10 bg-white/5 text-white/90"
                          : "border-[hsl(var(--orange-glow))]/40 bg-[hsl(var(--orange-glow))]/15 text-white"
                      }`}
                    >
                      <p className="text-[10px] uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                        {message.role === "assistant" ? "Assistant" : "You"}
                      </p>
                      <p className="mt-1 whitespace-pre-line">{message.content}</p>
                  </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="space-y-2">
                <Textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask about trends, risks, or planning recommendations"
                  className="min-h-[80px] border-white/10 bg-white/5 text-sm text-white placeholder:text-[hsl(var(--text-secondary))]"
                />
                <GlowButton
                  variant="secondary"
                  className="flex w-full items-center justify-center gap-2"
                  onClick={handleSendChat}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  {chatLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send
                    </>
                  )}
                </GlowButton>
              </div>
            </GlassCard>
            </div>
        </div>
      </div>
      <Dialog open={customRouteOpen} onOpenChange={setCustomRouteOpen}>
        <DialogContent className="border border-white/10 bg-[hsl(var(--navy-medium))] text-white">
          <DialogHeader>
            <DialogTitle>Add Custom Lane</DialogTitle>
            <DialogDescription className="text-[hsl(var(--text-secondary))]">
              Generate synthetic historical data for a new origin → destination pair and include it in forecasting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom-origin" className="text-xs text-[hsl(var(--text-secondary))]">
                  Origin
                </Label>
                <Input
                  id="custom-origin"
                  value={customOrigin}
                  onChange={(event) => setCustomOrigin(event.target.value)}
                  placeholder="e.g. Seattle, WA"
                  className="border-white/10 bg-white/5 text-white placeholder:text-[hsl(var(--text-secondary))]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-destination" className="text-xs text-[hsl(var(--text-secondary))]">
                  Destination
                </Label>
                <Input
                  id="custom-destination"
                  value={customDestination}
                  onChange={(event) => setCustomDestination(event.target.value)}
                  placeholder="e.g. Miami, FL"
                  className="border-white/10 bg-white/5 text-white placeholder:text-[hsl(var(--text-secondary))]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom-base" className="text-xs text-[hsl(var(--text-secondary))]">
                  Baseline Weekly Loads
                </Label>
                <Input
                  id="custom-base"
                  type="number"
                  value={customBaseLoad}
                  onChange={(event) => setCustomBaseLoad(Number(event.target.value) || 150)}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-amplitude" className="text-xs text-[hsl(var(--text-secondary))]">
                  Seasonal Amplitude
                </Label>
                <Input
                  id="custom-amplitude"
                  type="number"
                  value={customAmplitude}
                  onChange={(event) => setCustomAmplitude(Number(event.target.value) || 30)}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end gap-3">
            <button
              onClick={() => setCustomRouteOpen(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[hsl(var(--text-secondary))] hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>
            <GlowButton
              variant="secondary"
              onClick={handleCreateCustomLane}
              className="flex items-center gap-2"
              disabled={customSubmitting}
            >
              {customSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" /> Add Route
                </>
              )}
            </GlowButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sheet open={laneSheetOpen} onOpenChange={setLaneSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[85vh] flex-col gap-4 border-white/10 bg-[hsl(var(--navy-medium))] text-white sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle className="text-white">Select Forecast Routes</SheetTitle>
            <SheetDescription className="text-[hsl(var(--text-secondary))]">
              Choose up to three lanes to compare. Your selections update the dashboard instantly.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="space-y-3">
              {lanes.map((lane, index) => {
                const selected = selectedLanes.includes(lane.lane);
                const palette = LANE_COLORS[index % LANE_COLORS.length];
                return (
                  <button
                    key={`mobile-${lane.lane}`}
                    type="button"
                    onClick={() => toggleLane(lane.lane)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-[hsl(var(--cyan-glow))]/60 bg-[hsl(var(--cyan-glow))]/15 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                        : "border-white/10 bg-white/5 hover:border-[hsl(var(--cyan-glow))]/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{lane.lane}</p>
                        <p className="text-xs text-[hsl(var(--text-secondary))]">
                          {lane.origin} • {lane.destination}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: palette.actual }}
                        />
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            selected
                              ? "bg-[hsl(var(--cyan-glow))]/20 text-[hsl(var(--cyan-glow))]"
                              : "bg-white/10 text-[hsl(var(--text-secondary))]"
                          }`}
                        >
                          {selected ? "Selected" : "Tap to add"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-[hsl(var(--text-secondary))]">
            <p>
              Selected lanes:{" "}
              <span className="font-semibold text-white">{selectedLanes.length}</span> / 3 · Horizon:{" "}
              <span className="font-semibold text-white">{horizon}</span> weeks
            </p>
            <p className="mt-2">
              Tap lanes to toggle them on or off. At least one lane must remain selected so the forecast can render.
            </p>
          </div>

          <GlowButton className="w-full" onClick={() => setLaneSheetOpen(false)}>
            Done
          </GlowButton>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Forecasting;
