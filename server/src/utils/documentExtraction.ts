import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import { v4 as uuid } from 'uuid';

export interface LogisticsData {
  shipper?: string | null;
  consignee?: string | null;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  pickupDate?: string | null;
  deliveryDate?: string | null;
  weight?: string | null;
  rate?: string | null;
  referenceNumber?: string | null;
  commodity?: string | null;
}

export interface DocumentResult {
  filename: string;
  success: boolean;
  data?: LogisticsData;
  error?: string;
  merged_from?: string[];
  document_count?: number;
  is_merged?: boolean;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TEXT_LENGTH = Number(process.env.DOC_MAX_TEXT || '10000');

function normalizeString(input?: string | null): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function bigrams(value: string): string[] {
  const result: string[] = [];
  for (let i = 0; i < value.length - 1; i++) {
    result.push(value.slice(i, i + 2));
  }
  return result;
}

function diceCoefficient(a?: string | null, b?: string | null): number {
  const aNorm = normalizeString(a);
  const bNorm = normalizeString(b);

  if (!aNorm || !bNorm) return 0;
  if (aNorm === bNorm) return 1;
  if (aNorm.length < 2 || bNorm.length < 2) return 0;

  const aBigrams = bigrams(aNorm);
  const bBigrams = bigrams(bNorm);
  const bMap = new Map<string, number>();

  for (const bg of bBigrams) {
    bMap.set(bg, (bMap.get(bg) || 0) + 1);
  }

  let intersection = 0;
  for (const bg of aBigrams) {
    const count = bMap.get(bg) || 0;
    if (count > 0) {
      bMap.set(bg, count - 1);
      intersection += 1;
    }
  }

  return (2 * intersection) / (aBigrams.length + bBigrams.length);
}

export async function readDocument(buffer: Buffer, filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.pdf') {
    const pdfData = await pdfParse(buffer);
    return pdfData.text || '';
  }

  if (ext === '.docx' || ext === '.doc') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value || '';
  }

  if (ext === '.txt' || ext === '.csv') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file format: ${ext || 'unknown'}`);
}

function truncateText(text: string): string {
  if (text.length <= MAX_TEXT_LENGTH) return text;
  return text.slice(0, MAX_TEXT_LENGTH);
}

export async function extractDocumentData(text: string): Promise<LogisticsData> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const prompt = `You are an AI assistant specialized in extracting logistics information from documents.
Analyze the following document text and extract these fields in JSON format:

- shipper: Name/company of the shipper
- consignee: Name/company of the consignee
- pickupAddress: Full pickup address
- deliveryAddress: Full delivery address
- pickupDate: Pickup date (format as YYYY-MM-DD if possible)
- deliveryDate: Delivery date (format as YYYY-MM-DD if possible)
- weight: Weight of shipment (include units)
- rate: Rate or cost (include currency)
- referenceNumber: Reference/BOL/PRO number
- commodity: Type of goods being shipped

If a field is not found, set it to null. Return ONLY valid JSON, no additional text.

Document text:
${truncateText(text)}

JSON output:`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a logistics data extraction expert. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 1000,
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('No response from OpenAI');
  }

  let parsed: unknown;
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    const jsonText = start !== -1 && end !== -1 ? raw.slice(start, end + 1) : raw;
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error('Invalid JSON response from OpenAI');
  }

  const data = parsed as Record<string, unknown>;

  const logistics: LogisticsData = {
    shipper: (data.shipper as string) ?? null,
    consignee: (data.consignee as string) ?? null,
    pickupAddress: (data.pickupAddress as string) ?? null,
    deliveryAddress: (data.deliveryAddress as string) ?? null,
    pickupDate: (data.pickupDate as string) ?? null,
    deliveryDate: (data.deliveryDate as string) ?? null,
    weight: (data.weight as string) ?? null,
    rate: (data.rate as string) ?? null,
    referenceNumber: (data.referenceNumber as string) ?? null,
    commodity: (data.commodity as string) ?? null,
  };

  return logistics;
}

function mergeLogisticsData(loads: LogisticsData[]): LogisticsData {
  return loads.reduce<LogisticsData>((acc, load) => ({
    shipper: chooseValue(acc.shipper, load.shipper),
    consignee: chooseValue(acc.consignee, load.consignee),
    pickupAddress: chooseValue(acc.pickupAddress, load.pickupAddress),
    deliveryAddress: chooseValue(acc.deliveryAddress, load.deliveryAddress),
    pickupDate: acc.pickupDate ?? load.pickupDate ?? null,
    deliveryDate: acc.deliveryDate ?? load.deliveryDate ?? null,
    weight: chooseValue(acc.weight, load.weight),
    rate: chooseValue(acc.rate, load.rate),
    referenceNumber: acc.referenceNumber ?? load.referenceNumber ?? null,
    commodity: chooseValue(acc.commodity, load.commodity),
  }), {} as LogisticsData);
}

function chooseValue(current?: string | null, incoming?: string | null): string | null {
  if (!current && incoming) return incoming;
  if (!incoming) return current ?? null;
  if (!current) return incoming;
  return incoming.length > current.length ? incoming : current;
}

function loadsAreSame(a: LogisticsData, b: LogisticsData): boolean {
  if (a.referenceNumber && b.referenceNumber) {
    if (diceCoefficient(a.referenceNumber, b.referenceNumber) > 0.9) {
      return true;
    }
  }

  const scores: number[] = [];
  const shipperScore = diceCoefficient(a.shipper, b.shipper);
  if (shipperScore) scores.push(shipperScore);
  const consigneeScore = diceCoefficient(a.consignee, b.consignee);
  if (consigneeScore) scores.push(consigneeScore);
  const pickupScore = diceCoefficient(a.pickupAddress, b.pickupAddress);
  if (pickupScore) scores.push(pickupScore);
  const deliveryScore = diceCoefficient(a.deliveryAddress, b.deliveryAddress);
  if (deliveryScore) scores.push(deliveryScore);

  if (a.pickupDate && b.pickupDate) {
    scores.push(a.pickupDate === b.pickupDate ? 1 : 0);
  }

  if (scores.length < 3) {
    return false;
  }

  const average = scores.reduce((sum, val) => sum + val, 0) / scores.length;
  return average >= 0.75;
}

export function deduplicateResults(results: DocumentResult[]): DocumentResult[] {
  const successes = results.filter((result) => result.success && result.data);
  const failures = results.filter((result) => !result.success || !result.data);

  const groups: DocumentResult[][] = [];
  const used = new Set<number>();

  successes.forEach((result, index) => {
    if (!result.data || used.has(index)) return;

    const group: DocumentResult[] = [result];
    used.add(index);

    successes.forEach((other, otherIndex) => {
      if (otherIndex === index || used.has(otherIndex) || !other.data) return;
      if (loadsAreSame(result.data!, other.data!)) {
        group.push(other);
        used.add(otherIndex);
      }
    });

    groups.push(group);
  });

  const merged: DocumentResult[] = groups.map((group) => {
    if (group.length === 1) {
      const [single] = group;
      return {
        ...single,
        merged_from: [single.filename],
        document_count: 1,
        is_merged: false,
      };
    }

    const mergedLoad = mergeLogisticsData(group.map((item) => item.data!));
    const sources = group.map((item) => item.filename);

    return {
      filename: `${group[0].filename} (+${group.length - 1} more)` ,
      success: true,
      data: mergedLoad,
      merged_from: sources,
      document_count: group.length,
      is_merged: true,
    };
  });

  const singleSuccesses = successes
    .filter((_res, index) => !used.has(index))
    .map((result) => ({
      ...result,
      merged_from: [result.filename],
      document_count: 1,
      is_merged: false,
    }));

  const enrichedFailures = failures.map((failure) => ({
    ...failure,
    success: false,
    merged_from: [failure.filename],
    document_count: 1,
    is_merged: false,
  }));

  return [...merged, ...singleSuccesses, ...enrichedFailures];
}

export function createTmsLoadId(): string {
  return `LOAD-${uuid().slice(0, 8).toUpperCase()}`;
}
