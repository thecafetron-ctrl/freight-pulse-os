import { Router } from 'express';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getOpenAIClient } from '../utils/openaiClient';

type CollectedData = Record<string, string>;

type QuoteSession = {
  messages: ChatCompletionMessageParam[];
  collectedData: CollectedData;
  readyToQuote: boolean;
  createdAt: number;
  updatedAt: number;
};

type ChatAssistantPayload = {
  assistant_message?: string;
  collected_data?: Record<string, unknown>;
  ready_to_quote?: boolean;
  missing_fields?: string[];
};

const SESSION_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const todayIso = new Date().toISOString().split('T')[0];

const systemPrompt = `
You are "FreightPulse Concierge", an elite logistics quoting copilot.
Today's date is ${todayIso} (YYYY-MM-DD). Use this when interpreting relative phrases such as "tomorrow".

Always respond with valid JSON using this schema:
{
  "assistant_message": "plain-language guidance for the shipper, short paragraphs only",
  "collected_data": {
    "origin": "City, Country",
    "destination": "City, Country",
    "shipment_date": "ISO 8601 date",
    "freight_type": "Road | Air | Ocean | Rail | Courier",
    "weight": "numeric value with unit",
    "pallets_or_pieces": "number of units",
    "dimensions": "LxWxH with unit",
    "accessorials": "comma separated list of extras",
    "service_level": "Economy | Standard | Express | Premium",
    "special_notes": "freeform notes"
  },
  "ready_to_quote": boolean,
  "missing_fields": ["list of human-readable field labels that still need to be captured"]
}

Instructions:
- Preserve and refine previously collected data; do not delete fields unless the user corrects them.
- If a field is missing, leave it out of collected_data and include a friendly label in missing_fields.
- Set ready_to_quote true only when origin, destination, shipment_date, freight_type, weight, and service_level are fully captured.
- In assistant_message, ask for ONE missing detail at a time. Do not list every field collected so far—only reference the specific detail you still need or confirm just-captured information.
- assistant_message must not contain JSON, only conversational guidance.
- Keep responses concise, professional, and proactive.
- Always express dates in ISO format (YYYY-MM-DD) using today's date above for reference when computing relative dates.
`;

const quoteSystemPrompt = `
You are FreightPulse's elite pricing strategist.
Given structured shipment data, produce a polished premium quote summary.
Respond with a multi-line text block (no JSON) covering:
1. Route overview with distance estimate.
2. Mode & service tier, including rationale.
3. All-in price range in USD with fuel surcharge notes.
4. Transit time estimate and key milestones.
5. Value adds or advisories tailored to shipment.
6. Next steps or booking call-to-action.
Reference the customer-provided details verbatim where relevant.
Tone: confident, concierge-level, but concise.
`;

const sessions = new Map<string, QuoteSession>();

const router = Router();

const normalizeSessionId = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length >= 8 ? trimmed : null;
};

const startOfToday = new Date(todayIso);

const addDays = (date: Date, days: number): Date => {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
};

const convertRelativeDate = (value: string): string | null => {
  const lower = value.toLowerCase().trim();
  if (!lower) {
    return null;
  }

  if (/\btoday\b/.test(lower)) {
    return startOfToday.toISOString().split('T')[0];
  }

  if (/\btom+?or+?row\b/.test(lower) || /\btmrw\b/.test(lower) || /\btmr\b/.test(lower)) {
    return addDays(startOfToday, 1).toISOString().split('T')[0];
  }

  if (/\byesterday\b/.test(lower)) {
    return addDays(startOfToday, -1).toISOString().split('T')[0];
  }

  return null;
};

const normalizeDateValue = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const relative = convertRelativeDate(trimmed);
  if (relative) {
    return relative;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return parsed.toISOString().split('T')[0];
};

const sanitizeCollectedData = (input: Record<string, unknown> | undefined): CollectedData => {
  if (!input || typeof input !== 'object') {
    return {};
  }
  return Object.entries(input).reduce<CollectedData>((acc, [key, value]) => {
    if (value === null || value === undefined) {
      return acc;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return acc;
      }
      acc[key] = value.map((item) => String(item).trim()).filter(Boolean).join(', ');
      return acc;
    }
    const text = String(value).trim();
    if (!text) {
      return acc;
    }
    acc[key] = key.toLowerCase().includes('date') ? normalizeDateValue(text) : text;
    return acc;
  }, {});
};

const touchSession = (sessionId: string): QuoteSession => {
  const existing = sessions.get(sessionId);
  if (existing) {
    existing.updatedAt = Date.now();
    return existing;
  }
  const created: QuoteSession = {
    messages: [],
    collectedData: {},
    readyToQuote: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  sessions.set(sessionId, created);
  return created;
};

const pruneSessions = () => {
  const threshold = Date.now() - SESSION_TTL_MS;
  for (const [id, session] of sessions.entries()) {
    if (session.updatedAt < threshold) {
      sessions.delete(id);
    }
  }
};

router.post('/session/start', (req, res) => {
  pruneSessions();

  const sessionId = normalizeSessionId(req.body?.session_id);
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'session_id must be at least 8 characters',
    });
  }

  const session = touchSession(sessionId);
  session.messages = [];
  session.collectedData = {};
  session.readyToQuote = false;

  return res.json({
    success: true,
    session_id: sessionId,
    message: 'Welcome back! I\'m ready to craft a premium multimodal quote. Share your route and shipment details to begin.',
  });
});

router.post('/chat', async (req, res) => {
  pruneSessions();

  const sessionId = normalizeSessionId(req.body?.session_id);
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'session_id must be provided',
    });
  }

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'message must be provided',
    });
  }

  let session: QuoteSession;
  try {
    session = touchSession(sessionId);
  } catch (error) {
    console.error('Failed to initialize session', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initialize session',
    });
  }

  let client;
  try {
    client = getOpenAIClient();
  } catch (error) {
    console.error('OpenAI client unavailable', error);
    return res.status(503).json({
      success: false,
      error: 'Quoting engine is unavailable. Please configure OPENAI_API_KEY.',
    });
  }

  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...session.messages,
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Assistant returned empty response');
    }

    let payload: ChatAssistantPayload;
    try {
      payload = JSON.parse(rawContent) as ChatAssistantPayload;
    } catch (error) {
      console.error('Failed to parse assistant payload', rawContent);
      throw new Error('Assistant response was not valid JSON');
    }

    const assistantMessage = (payload.assistant_message ?? '').trim() || 'Let me know the shipment details and I will assemble your quote.';
    const collectedData = sanitizeCollectedData(payload.collected_data);
    const mergedCollectedData = { ...session.collectedData, ...collectedData };
    const readyToQuote = Boolean(payload.ready_to_quote);

    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: rawContent });
    session.collectedData = mergedCollectedData;
    session.readyToQuote = readyToQuote;

    return res.json({
      success: true,
      message: assistantMessage,
      collected_data: mergedCollectedData,
      ready_to_quote: readyToQuote,
      missing_fields: Array.isArray(payload.missing_fields) ? payload.missing_fields : [],
    });
  } catch (error) {
    console.error('Quote chat error', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error generating response',
    });
  }
});

router.post('/quote/generate', async (req, res) => {
  pruneSessions();

  const sessionId = normalizeSessionId(req.body?.session_id);
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'session_id must be provided',
    });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found. Please restart the conversation.',
    });
  }

  if (!session.readyToQuote) {
    return res.status(400).json({
      success: false,
      error: 'Shipment details are incomplete. Please share remaining information before requesting a quote.',
    });
  }

  let client;
  try {
    client = getOpenAIClient();
  } catch (error) {
    console.error('OpenAI client unavailable', error);
    return res.status(503).json({
      success: false,
      error: 'Quoting engine is unavailable. Please configure OPENAI_API_KEY.',
    });
  }

  try {
    const serializedData = JSON.stringify(session.collectedData, null, 2);

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: quoteSystemPrompt },
        {
          role: 'user',
          content: `Craft a premium logistics quote using this structured shipment profile:\n${serializedData}`,
        },
      ],
    });

    const quote = completion.choices[0]?.message?.content?.trim();
    if (!quote) {
      throw new Error('Quote generation returned empty response');
    }

    session.messages.push({
      role: 'assistant',
      content: `QUOTE_SNIPPET:\n${quote}`,
    });

    return res.json({
      success: true,
      quote,
      shipment_data: session.collectedData,
    });
  } catch (error) {
    console.error('Quote generation error', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error generating quote',
    });
  }
});

router.post('/session/reset', (req, res) => {
  const sessionId = normalizeSessionId(req.body?.session_id);
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'session_id must be provided',
    });
  }

  sessions.delete(sessionId);
  return res.json({
    success: true,
    message: 'Session reset successfully. Let\'s build a fresh quote.',
  });
});

export default router;

