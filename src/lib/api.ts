const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isBrowser = typeof window !== 'undefined';
const isLocalRuntime =
  import.meta.env.DEV ||
  (isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname));

const DEFAULT_API_BASE_URL = isLocalRuntime
  ? 'http://localhost:3001'
  : '/.netlify/functions/server';

export const API_BASE_URL =
  isLocalRuntime
    ? envBaseUrl || DEFAULT_API_BASE_URL
    : envBaseUrl && !envBaseUrl.includes('localhost')
      ? envBaseUrl
      : DEFAULT_API_BASE_URL;

export async function postJson<T>(endpoint: string, payload: unknown, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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


