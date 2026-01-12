const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const isBrowser = typeof window !== "undefined";
const hostname = isBrowser ? window.location.hostname : "";
const isLocal =
  import.meta.env.DEV ||
  hostname === "localhost" ||
  hostname === "127.0.0.1";

const resolveApiOrigin = (): string => {
  if (envBaseUrl.length) {
    return envBaseUrl;
  }

  // Always use Netlify functions path in production
  // In local dev, use localhost:3001 if available, otherwise Netlify functions
  if (isLocal) {
    return "http://localhost:3001";
  }

  return "/.netlify/functions/server";
};

export const API_BASE_URL = resolveApiOrigin();

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const trimLeadingSlash = (value: string) => value.replace(/^\/+/, "");

const buildUrl = (endpoint: string): string => {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const base = trimTrailingSlash(API_BASE_URL);
  const path = `/${trimLeadingSlash(endpoint)}`;

  if (/^https?:\/\//i.test(base)) {
    return `${base}${path}`;
  }

  return `${base || ""}${path}`;
};

export async function postJson<T>(endpoint: string, payload: unknown, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data as T;
}

export async function getJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(endpoint), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data as T;
}


