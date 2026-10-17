/**
 * Configuración base para el cliente de API que se conectará con FastAPI.
 * Utiliza fetch nativo para realizar peticiones.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
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
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetcher('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('civia_token') : null;
      return fetcher('/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    forgotPassword: (email: string) =>
      fetcher('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    verifyOtp: (email: string, otp_code: string) =>
      fetcher('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp_code }),
      }),
    resetPassword: (email: string, otp_code: string, new_password: string) =>
      fetcher('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp_code, new_password }),
      }),
    getUsers: () => fetcher('/auth/users'),
    createUser: (userData: {
      email: string;
      password: string;
      full_name: string;
      role: string;
      department?: string;
    }) =>
      fetcher('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    deleteUser: (userId: string) =>
      fetcher(`/auth/users/${userId}`, {
        method: 'DELETE',
      }),
  },
  cases: {
    getAll: (limit: number = 500) => fetcher(`/cases?limit=${limit}`),
    getById: (id: string) => fetcher(`/cases/${id}`),
    dispatch: (id: string, data: { assigned_department: string; assigned_to?: string; note?: string; internal_note?: string }) =>
      fetcher(`/cases/${id}/dispatch`, {
        method: 'POST',
        body: JSON.stringify({
          assigned_department: data.assigned_department,
          assigned_to: data.assigned_to,
          note: data.note || data.internal_note,
        }),
      }),
    addNote: (id: string, data: { note: string; author_name?: string; author?: string }) =>
      fetcher(`/cases/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          note: data.note,
          author_name: data.author_name || data.author || 'Sistema',
        }),
      }),
    resolve: (id: string, data: { resolution_note: string; resolved_by: string }) =>
      fetcher(`/cases/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    togglePriority: (id: string, priority_action?: boolean) =>
      fetcher(`/cases/${id}/priority-action`, {
        method: 'POST',
        body: priority_action !== undefined ? JSON.stringify({ priority_action }) : undefined,
      }),
    savePublicResponse: (id: string, public_response: string) =>
      fetcher(`/cases/${id}/public-response`, {
        method: 'POST',
        body: JSON.stringify({ public_response }),
      }),
  },
  analytics: {
    getSummary: () => fetcher('/analytics/summary'),
  },
  map: {
    getIncidents: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetcher(`/map/incidents${query}`);
    },
  },
  meta: {
    getMonths: () => fetcher('/meta/months'),
    getPosts: (limit: number = 250, month?: string, search?: string) => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (month && month !== 'all') params.append('month', month);
      if (search && search.trim()) params.append('search', search.trim());
      return fetcher(`/meta/posts?${params.toString()}`);
    },
    syncLive: () => fetcher('/meta/sync-live', { method: 'POST' }),
  },
  system: {
    getDiagnostics: () => fetcher('/system/diagnostics'),
  },
  ai: {
    getCredits: () => fetcher('/ai/credits'),
  },
};
