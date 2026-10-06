/**
 * CIVIA API Client — Integración con FastAPI y PostgreSQL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('civia_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Ocurrió un error en la petición');
  }

  return response.json();
}

export const API = {
  auth: {
    login: (credentials: { email: string; password: string }) => 
      fetcher('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => fetcher('/auth/me'),
  },
  cases: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetcher(`/cases${query}`);
    },
    getById: (id: string) => fetcher(`/cases/${id}`),
    update: (id: string, data: any) => 
      fetcher(`/cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    create: (data: any) => 
      fetcher('/cases', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  map: {
    getIncidents: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetcher(`/map/incidents${query}`);
    },
    getZones: () => fetcher('/map/zones'),
    createIncident: (data: any) => 
      fetcher('/map/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  analytics: {
    getSummary: () => fetcher('/analytics/summary'),
  },
};
