const DEFAULT_API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : '/.netlify/functions/server';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

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


