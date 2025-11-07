const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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


