import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bot, Loader2 } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type RecentQuote = {
  route: string;
  price: string;
};

type DemoScenario = {
  label: string;
  description: string;
  message: string;
};

const normalizeBase = (value: string) => value.replace(/\/+$/, "");

const API_BASE = (() => {
  const configured = (import.meta.env.VITE_QUOTE_API_URL || "").trim();
  if (configured) {
    return normalizeBase(configured);
  }
  return `${normalizeBase(API_BASE_URL)}/api/quotes`;
})();

const SESSION_ID_PREFIX = "freight-pulse";

const createSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${SESSION_ID_PREFIX}-${crypto.randomUUID()}`;
  }
  return `${SESSION_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const fieldLabels: Record<string, string> = {
  origin: "Origin",
  destination: "Destination",
  shipment_date: "Pickup Date",
  freight_type: "Mode",
  weight: "Weight",
  pallets_or_pieces: "Pieces",
  dimensions: "Dimensions",
  accessorials: "Accessorials",
  service_level: "Service Level",
  special_notes: "Notes",
};

const extractQuotePrice = (text: string) => {
  const sanitizeValue = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const value = Number.parseFloat(cleaned);
    return Number.isFinite(value) ? value : null;
  };

  const formatUSD = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalLine =
    text.match(/Total\s+(?:Quoted\s+Amount|Cost|Price)[^\d]*(\d[\d,]*(?:\.\d{2})?)/i) ||
    text.match(/Total\s+(?:Quoted\s+Amount|Cost|Price)[^\d$]*(?:USD|US\$)?\s*(\d[\d,]*(?:\.\d{2})?)/i) ||
    text.match(/(USD|US\$)\s*(\d[\d,]*(?:\.\d{2})?)\s*(?:Total\s+(?:Quoted\s+Amount|Cost|Price))/i);

  if (totalLine) {
    const raw = totalLine[1] ?? totalLine[2];
    if (raw) {
      const value = sanitizeValue(raw);
      if (value !== null) {
        return formatUSD(value);
      }
    }
  }

  const amounts: number[] = [];

  for (const match of text.matchAll(/\$([\d,]+(?:\.\d{2})?)/g)) {
    const value = sanitizeValue(match[1]);
    if (value !== null) {
      amounts.push(value);
    }
  }

  for (const match of text.matchAll(/(?:USD|US\$)\s*([\d,]+(?:\.\d{2})?)/gi)) {
    const value = sanitizeValue(match[1]);
    if (value !== null) {
      amounts.push(value);
    }
  }

  if (amounts.length > 0) {
    const largest = Math.max(...amounts);
    return formatUSD(largest);
  }

  return "—";
};

const normalizeCollectedData = (input?: Record<string, unknown>) => {
  if (!input) {
    return {};
  }

  const normalized: Record<string, string> = {};

  Object.entries(input).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }
      normalized[key] = value.join(", ");
      return;
    }

    normalized[key] = String(value);
  });

  return normalized;
};

const Quotes = () => {
  const [sessionId, setSessionId] = useState<string>(() => createSessionId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuery, setUserQuery] = useState(
    "Need a quote for 3 pallets from Chicago to Dallas, pickup tomorrow."
  );
  const [isSending, setIsSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [readyToQuote, setReadyToQuote] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([
    { route: "Atlanta → New York", price: "$360" },
    { route: "Los Angeles → Denver", price: "$1,530" },
    { route: "Memphis → Seattle", price: "$2,210" },
  ]);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const autoTriggerQuoteRef = useRef(false);

  const demoScenarios: DemoScenario[] = [
    {
      label: "Air Freight",
      description: "Urgent electronics – Hong Kong to Los Angeles",
      message:
        "We need an air freight quote for 1200 kg of electronics from Hong Kong to Los Angeles next Tuesday. Include customs clearance assistance.",
    },
    {
      label: "Ocean Freight",
      description: "Full container – Shanghai to Long Beach",
      message:
        "Looking for an ocean freight quote on a 40ft container of furniture from Shanghai to Long Beach departing in three weeks.",
    },
    {
      label: "Road Freight",
      description: "Regional pallets – Dallas to Atlanta",
      message:
        "Need an LTL road freight quote for 6 pallets of automotive parts from Dallas, TX to Atlanta, GA picking up this Friday.",
    },
    {
      label: "Express Courier",
      description: "High priority samples – Paris to Berlin",
      message:
        "Requesting an express courier quote for 80 kg of fashion samples from Paris to Berlin with next-day delivery.",
    },
  ];

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    try {
      if (typeof container.scrollTo === "function") {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, aiTyping]);

  useEffect(() => {
    const startSession = async () => {
      try {
        setMessages([]);
        setCollectedData({});
        setReadyToQuote(false);
        setQuote(null);

        const response = await fetch(`${API_BASE}/session/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error(`Session start failed (${response.status})`);
        }

        const data = await response.json();

        if (data.success && data.message) {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: data.message,
            },
          ]);
        }
      } catch (err) {
        console.error("Error starting session", err);
        setMessages([
          {
            id: "welcome-error",
            role: "assistant",
            content:
              "I'm experiencing a connection issue with the quoting engine. Please check the backend service and try again.",
          },
        ]);
      }
    };

    startSession();
  }, [sessionId]);

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async (presetMessage?: string) => {
    const messageToSend = (presetMessage ?? userQuery).trim();

    if (!messageToSend || isSending) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageToSend,
    };

    appendMessage(userMessage);
    setUserQuery("");
    setError(null);
    setQuote(null);
    setIsSending(true);
    setAiTyping(true);
    setReadyToQuote(false);
    autoTriggerQuoteRef.current = false;

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: messageToSend,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed (${response.status})`);
      }

      const data = await response.json();
      const assistantMessage = typeof data.message === "string" ? data.message.trim() : "";
      const displayMessage = assistantMessage.match(/READY_TO_QUOTE/i)
        ? "All shipment details gathered. Preparing your premium quote."
        : assistantMessage || "I couldn't process that request. Please try again.";

      appendMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: displayMessage,
      });

      setCollectedData(normalizeCollectedData(data.collected_data));
      setReadyToQuote(Boolean(data.ready_to_quote));
    } catch (err) {
      console.error("Chat error", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error communicating with the server.";
      setError(errorMessage);
      appendMessage({
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: `I'm having trouble connecting to the quoting engine: ${errorMessage}`,
      });
    } finally {
      setIsSending(false);
      setAiTyping(false);
    }
  };

  const handleGenerateQuote = async (autoTriggered = false) => {
    if (quoteLoading) {
      return;
    }

    if (!readyToQuote && !autoTriggered) {
      setError("We still need a little more shipment detail before generating your quote.");
      return;
    }

    setQuoteLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/quote/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error(`Quote generation failed (${response.status})`);
      }

      const data = await response.json();

      if (!data.success || !data.quote) {
        throw new Error(data.error || "Quote came back empty.");
      }

      setQuote(data.quote);

      const normalizedShipment = normalizeCollectedData(data.shipment_data ?? collectedData);
      setCollectedData(normalizedShipment);

      const route = [normalizedShipment.origin, normalizedShipment.destination]
        .filter(Boolean)
        .join(" → ") || "Newest quote";

      setRecentQuotes((prev) => {
        const next: RecentQuote[] = [
          {
            route,
            price: extractQuotePrice(data.quote),
          },
          ...prev,
        ];
        return next.slice(0, 5);
      });
    } catch (err) {
      console.error("Quote generation error", err);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred while generating the quote.";
      setError(message);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  useEffect(() => {
    if (readyToQuote && !quote && !quoteLoading && !autoTriggerQuoteRef.current) {
      autoTriggerQuoteRef.current = true;
      void handleGenerateQuote(true);
    }
  }, [readyToQuote, quote, quoteLoading]);

  const renderTypingIndicator = () => (
    <div className="flex justify-start" key="typing-indicator">
      <div className="max-w-[80%] p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="typing-indicator text-white">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );

  const summaryEntries = Object.entries(collectedData).filter(([, value]) =>
    typeof value === "string" && value.trim().length > 0
  );

  const handleResetConversation = async () => {
    try {
      await fetch(`${API_BASE}/session/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (err) {
      console.warn("Session reset warning", err);
    } finally {
      setSessionId(createSessionId());
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="app-shell-wide space-y-6 pb-12 pt-6 sm:space-y-8">
        <div className="space-y-3 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--orange-glow))]" />
            Freight Pulse • Luxury Quoting Suite
          </div>
          <h1 className="leading-tight">AI Quote Generator</h1>
          <p className="max-w-2xl text-sm text-[hsl(var(--text-secondary))] sm:text-base">
            Tailored multimodal quotes with real-world routing, fuel dynamics, and advisor intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassCard className="space-y-6 border border-white/10 bg-gradient-to-br from-white/8 via-white/[0.07] to-white/3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] lg:col-span-2" glow="orange">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-[hsl(var(--orange-glow))]/15 p-3 shadow-[0_0_25px_rgba(255,122,0,0.35)]">
                <Bot className="w-6 h-6 text-[hsl(var(--orange-glow))]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Quote Assistant</h2>
                <p className="text-xs text-white/50 tracking-wide uppercase">Luxury advisory • AI guided • Multimodal aware</p>
              </div>
              <GlowButton
                variant="outline"
                className="ml-auto w-full border-white/20 bg-black/20 text-white hover:border-[hsl(var(--orange-glow))]/60 sm:w-auto"
                onClick={handleResetConversation}
              >
                Start Fresh
              </GlowButton>
            </div>

            <div
              className="max-h-[420px] space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4 pr-1 shadow-inner shadow-black/40 sm:max-h-[520px]"
              ref={chatContainerRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-full rounded-2xl border sm:max-w-[80%] ${
                      message.role === "user"
                        ? "bg-[hsl(var(--navy-deep))] border-white/10 p-4"
                        : "bg-white/5 border-[hsl(var(--orange-glow))]/30 p-6"
                    }`}
                  >
                    <p className="text-white whitespace-pre-line leading-relaxed text-sm md:text-base">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {aiTyping && renderTypingIndicator()}
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Describe your shipment..."
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition-all placeholder:text-[hsl(var(--text-secondary))] focus:border-[hsl(var(--orange-glow))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--orange-glow))]/25 sm:text-base"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <GlowButton
                variant="primary"
                className={`shrink-0 sm:w-auto ${isSending ? "pointer-events-none opacity-60" : ""}`}
                onClick={() => void handleSend()}
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending
                  </span>
                ) : (
                  "Send"
                )}
              </GlowButton>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <GlowButton
                variant="primary"
                className="flex items-center gap-2 shadow-[0_0_25px_rgba(255,122,0,0.35)] sm:w-auto"
                onClick={() => void handleGenerateQuote()}
              >
                {quoteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating Quote
                  </>
                ) : (
                  <>Generate Quote</>
                )}
              </GlowButton>
              <p className="text-xs italic text-white/60 sm:text-sm">
                {readyToQuote ? "Details verified—your quote will appear momentarily." : "Collecting shipment intel..."}
              </p>
            </div>

            {quote && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Generated Quote</h3>
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Ready to save or share</span>
                </div>
                <pre className="rounded-xl bg-black/40 border border-white/10 p-4 font-mono text-sm text-white whitespace-pre-wrap leading-snug">
{quote}
                </pre>
              </div>
            )}
          </GlassCard>

          <div className="space-y-6">
            <GlassCard glow="cyan">
              <h3 className="mb-4">Test Scenarios</h3>
              <div className="space-y-2 sm:space-y-3">
                {demoScenarios.map((scenario) => (
                  <button
                    key={scenario.label}
                    type="button"
                    onClick={() => void handleSend(scenario.message)}
                    className="w-full rounded-xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-4 text-left text-sm transition-all hover:border-[hsl(var(--orange-glow))]/60 hover:shadow-[0_15px_35px_rgba(255,122,0,0.25)] sm:text-base"
                  >
                    <p className="text-sm font-semibold text-white tracking-wide">{scenario.label}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard glow="orange">
              <h3 className="mb-4">Collected Shipment Data</h3>
              {summaryEntries.length ? (
                <div className="space-y-3">
                  {summaryEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                        {fieldLabels[key] ?? key}
                      </p>
                      <p className="text-sm text-white text-right max-w-[60%] leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  Share shipment details to see them organized here automatically.
                </p>
              )}
            </GlassCard>

            <GlassCard glow="cyan">
              <h3 className="mb-4">Recent Quotes</h3>
              <div className="space-y-3">
                {recentQuotes.map((quoteItem, index) => (
                  <div 
                    key={`${quoteItem.route}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-white/10 via-transparent to-white/5 p-4 transition-all hover:border-[hsl(var(--orange-glow))]/60 hover:shadow-[0_18px_40px_rgba(255,122,0,0.25)]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm truncate pr-4 font-medium">{quoteItem.route}</p>
                      <p className="rounded-full bg-[hsl(var(--orange-glow))]/15 px-3 py-1 text-xs font-semibold text-[hsl(var(--orange-glow))] shadow-[0_0_15px_rgba(255,122,0,0.35)]">
                        {quoteItem.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quotes;
