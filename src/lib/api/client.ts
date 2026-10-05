/**
 * Configuración base para el cliente de API que se conectará con FastAPI.
 * Utiliza fetch nativo (o puedes cambiarlo a Axios) para realizar peticiones.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Aquí podrías inyectar el token de autenticación (Ej. JWT)
    // 'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Ocurrió un error en la petición');
  }

  return response.json();
}

export const API = {
  cases: {
    getAll: () => fetcher('/cases'),
    getById: (id: string) => fetcher(`/cases/${id}`),
    // updateStatus: (id: string, status: string) => fetcher(`/cases/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
  },
  analytics: {
    getSentiment: () => fetcher('/analytics/sentiment'),
    getMapPoints: () => fetcher('/analytics/map-points'),
  }
};
