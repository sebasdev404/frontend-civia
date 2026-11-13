/**
 * Configuración base para el cliente de API que se conectará con FastAPI.
 * Utiliza fetch nativo para realizar peticiones.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface MonitoredPostSummary {
  id: string;
  source: string;
  title: string;
  message: string | null;
  cover_image: string | null;
  thumbnail_url: string | null;
  media_type: string | null;
  published_at: string;
  month_key: string | null;
  permalink_url: string | null;
  total_comments: number;
  cases_count: number;
  likes_count: number;
  views_count: number;
  shares_count: number;
}

export interface MetaPostsPage {
  items: MonitoredPostSummary[];
  total: number;
  cases_total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ConsolidatedCaseSummary {
  id: string;
  source: string;
  author: string;
  priority: string;
  title: string;
  content: string;
  category: string;
  sentiment: string;
  location: string;
  date_time: string;
  status: string;
  media_type: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  media_available: boolean;
  institutional_radicado: string | null;
  assigned_department: string | null;
  assigned_to: string | null;
  priority_action: boolean;
  comments_count: number;
  post_id: string | null;
  post_title: string | null;
  impact_if_solved: string | null;
  impact_if_ignored: string | null;
}

export interface ConsolidatedCasesPage {
  items: ConsolidatedCaseSummary[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface InstagramConnectionStatus {
  status: 'ready' | 'not_connected' | 'not_configured' | 'missing_permissions' | 'error';
  username: string | null;
  account_id: string | null;
  detail: string;
  required_permissions: string[];
  missing_permissions: string[];
  permissions_checked: boolean;
  comments_available: boolean;
}

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (typeof options.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

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

function citizenAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('civia_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const API = {
  citizens: {
    getAll: (params: URLSearchParams, signal?: AbortSignal) => fetcher(`/citizens?${params}`, { headers: citizenAuthHeaders(), signal }),
    getById: (id: string) => fetcher(`/citizens/${encodeURIComponent(id)}`, { headers: citizenAuthHeaders() }),
    deleteOne: (id: string): Promise<{ success: boolean; deleted_count: number; deleted_ids: string[] }> => fetcher(`/citizens/${encodeURIComponent(id)}`, { method: 'DELETE', headers: citizenAuthHeaders() }),
    deleteMany: (ids: string[]): Promise<{ success: boolean; deleted_count: number; deleted_ids: string[] }> => fetcher('/citizens/bulk-delete', { method: 'POST', headers: citizenAuthHeaders(), body: JSON.stringify({ citizen_ids: ids }) }),
    getComments: (id: string) => fetcher(`/citizens/${encodeURIComponent(id)}/comments`, { headers: citizenAuthHeaders() }),
    saveReply: (id: string, payload: { case_id: string; reply_text: string; status: string }) => fetcher(`/citizens/${encodeURIComponent(id)}/reply`, { method: 'POST', headers: citizenAuthHeaders(), body: JSON.stringify(payload) }),
    importFile: (file: File, preview: boolean) => {
      const body = new FormData();
      body.append('file', file);
      return fetcher(`/citizens/import${preview ? '/preview' : ''}`, { method: 'POST', headers: citizenAuthHeaders(), body });
    },
  },
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
    getPage: async (params: URLSearchParams, options: RequestInit = {}): Promise<ConsolidatedCasesPage> => {
      const query = new URLSearchParams(params);
      query.set('paginated', 'true');
      const page = await fetcher(`/cases?${query}`, options);
      if (!page || !Array.isArray(page.items) || !Number.isInteger(page.total) || typeof page.has_more !== 'boolean') {
        throw new Error('El servidor no devolvió una página de casos válida. Reinicia el backend si acabas de actualizar CIVIA.');
      }
      return page;
    },
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
    getInstagramStatus: (): Promise<InstagramConnectionStatus> => fetcher('/meta/instagram/status'),
    getPost: (postId: string, options: RequestInit = {}) => fetcher(`/meta/posts/${encodeURIComponent(postId)}`, options),
    getTriageComments: () => fetcher('/meta/triage-comments'),
    getPosts: (limit: number = 250, month?: string, search?: string) => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (month && month !== 'all') params.append('month', month);
      if (search && search.trim()) params.append('search', search.trim());
      return fetcher(`/meta/posts?${params.toString()}`);
    },
    getPostsPage: async (limit = 24, offset = 0, month = 'all', search = '', network = 'all', options: RequestInit = {}, casesOnly = false): Promise<MetaPostsPage> => {
      const params = new URLSearchParams({
        limit: String(limit), offset: String(offset), month, search, network, paginated: 'true', include_details: 'false', cases_only: String(casesOnly),
      });
      const page = await fetcher(`/meta/posts?${params.toString()}`, options);
      if (Array.isArray(page)) {
        throw new Error('El servidor de CIVIA está ejecutando una versión anterior. Reinicia el backend para cargar las publicaciones.');
      }
      if (!page || !Array.isArray(page.items) || !Number.isInteger(page.total) || page.total < 0 || typeof page.has_more !== 'boolean') {
        throw new Error('La API de publicaciones devolvió un formato inválido. Intenta nuevamente.');
      }
      return page;
    },
    syncLive: () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('civia_token') : null;
      return fetcher('/meta/sync-live', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
  },
  system: {
    getDiagnostics: () => fetcher('/system/diagnostics'),
  },
  ai: {
    getCredits: () => fetcher('/ai/credits'),
    syncBalance: (payload: { initial_budget?: number; real_balance?: number; consumed_usd?: number }) =>
      fetcher('/ai/sync-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
  },
};
