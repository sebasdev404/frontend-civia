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
  likes_count: number | null;
  reactions_count: number | null;
  views_count: number | null;
  views_status?: string;
  views_detail?: string;
  shares_count: number | null;
  metrics_status?: string;
  metrics_updated_at?: string | null;
  metrics_detail?: string | null;
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
  post_message: string | null;
  post_permalink_url: string | null;
  comment_id: string | null;
  comment_url: string | null;
  source_status: 'post_available' | 'post_missing' | 'reference_missing';
  provenance_status?: 'needs_review' | 'recovered_local' | null;
  provenance_reason?: string | null;
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

export type ConversationStance = 'support' | 'criticism' | 'mixed' | 'neutral' | 'unclear';
export interface ConversationAnalysis {
  stance: ConversationStance;
  emotion: string;
  target: string;
  topic: string;
  narrative: string;
  explanation: string;
  confidence: number;
  needs_review: boolean;
  status: 'analyzed' | 'pending';
}
export interface ConversationComment extends ConversationAnalysis {
  id: string; post_id: string; post_title: string; post_url: string | null;
  author: string; content: string; time: string | null; parent: string | null;
  permalink_url: string | null; context_source: string;
}
export interface PublicationContext {
  summary: string; transcript: string; caption: string; title: string;
  source: string; ready: boolean; is_video: boolean;
}
export interface ConversationOverview {
  summary: { captured: number; analyzed: number; pending: number; review: number;
    stances: Partial<Record<ConversationStance, number>>; anger_in_support: number;
    reported: number; posts_missing_context: number };
  themes: { topic: string; narrative: string; label: string; count: number }[];
  posts: { id: string; title: string; month: string | null; captured: number; reported: number;
    context_ready: boolean; context_source: string; is_video: boolean }[];
  items: ConversationComment[]; total: number; has_more: boolean; ai_available: boolean;
}

export interface MetaSyncJob {
  id: string | null; scope: string | null;
  status: 'idle' | 'queued' | 'running' | 'success' | 'partial' | 'failed' | 'interrupted';
  progress: { stage?: string; detail?: string; network?: string; completed?: number; total?: number };
  result: { status?: string; detail?: string; posts_updated?: number; new_comments_captured?: number; timestamp?: string; instagram_status?: string; instagram_detail?: string; errors?: string[] } | null;
  error: string | null; created_at?: string; updated_at?: string; already_running?: boolean;
}
export interface PublicationSource {
  id: string; name: string; url: string; status: string; detail: string | null; checked_at: string | null; posts_count: number;
}
export interface PublicationSummary {
  id: string; title: string; message: string | null; source: string; cover_image: string | null; thumbnail_url: string | null;
  media_type: string | null; published_at: string | null; permalink_url: string | null;
  total_comments: number | null; likes_count: number | null; reactions_count: number | null; shares_count: number | null;
  metrics_status: string; metrics_updated_at: string | null;
}
export interface PublicationComment {
  id: string; content: string; author?: string; author_id?: string; author_picture_url?: string; author_is_protected?: boolean;
  time?: string; likes_count?: number | null; parent_content?: string | null; permalink_url?: string;
  automation: { status: string; signals: string[]; label: string; explanation: string };
}
export interface PublicationDetail extends PublicationSummary {
  comments: PublicationComment[]; comments_total: number; captured_comments: number; comments_has_more: boolean;
  identity_note: string; metrics_detail: string;
  reaction_people: { id: string; name: string | null; type: string | null; identity_verified: boolean }[];
  reaction_people_total: number; reaction_people_status: string; reaction_people_detail: string; reaction_people_truncated: boolean;
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

async function waitForSync(job: MetaSyncJob, onProgress?: (job: MetaSyncJob) => void) {
  let current = job;
  onProgress?.(current);
  while (current.id && (current.status === 'queued' || current.status === 'running')) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    current = await fetcher(`/meta/sync-jobs/${encodeURIComponent(current.id)}`, { headers: citizenAuthHeaders() });
    onProgress?.(current);
  }
  if (current.status === 'failed' || current.status === 'interrupted') throw new Error(current.error || 'La actualización se interrumpió.');
  return { ...current.result, status: current.status };
}

export const API = {
  triage: {
    consolidate: (payload: { comments: { post_id: string; comment_id: string }[]; target_case_id?: string; title?: string }): Promise<{ case_id: string; created: boolean; linked: number; already_linked: number; comments_count: number }> => fetcher('/triage/consolidate', { method: 'POST', headers: citizenAuthHeaders(), body: JSON.stringify(payload) }),
  },
  publications: {
    sources: (signal?: AbortSignal): Promise<PublicationSource[]> => fetcher('/publications/sources', { headers: citizenAuthHeaders(), signal }),
    list: (params: URLSearchParams, signal?: AbortSignal): Promise<{ items: PublicationSummary[]; total: number; has_more: boolean }> => fetcher(`/publications?${params}`, { headers: citizenAuthHeaders(), signal }),
    detail: (sourceId: string, postId: string, params: URLSearchParams, signal?: AbortSignal): Promise<PublicationDetail> => fetcher(`/publications/${encodeURIComponent(sourceId)}/${encodeURIComponent(postId)}?${params}`, { headers: citizenAuthHeaders(), signal }),
    sync: (sourceId: string): Promise<MetaSyncJob> => fetcher(`/publications/sources/${encodeURIComponent(sourceId)}/sync`, { method: 'POST', headers: citizenAuthHeaders() }),
    refresh: (sourceId: string, postId: string): Promise<MetaSyncJob> => fetcher(`/publications/${encodeURIComponent(sourceId)}/${encodeURIComponent(postId)}/refresh`, { method: 'POST', headers: citizenAuthHeaders() }),
    exportComments: async (sourceId: string, postId: string): Promise<Blob> => {
      const response = await fetch(`${API_BASE_URL}/publications/${encodeURIComponent(sourceId)}/${encodeURIComponent(postId)}/comments.csv`, { headers: citizenAuthHeaders() });
      if (!response.ok) throw new Error('No se pudieron exportar los comentarios capturados.');
      return response.blob();
    },
  },
  conversation: {
    getOverview: (params: URLSearchParams, signal?: AbortSignal): Promise<ConversationOverview> =>
      fetcher(`/conversation?${params}`, { headers: citizenAuthHeaders(), signal }),
    getContext: (postId: string, signal?: AbortSignal): Promise<PublicationContext> =>
      fetcher(`/conversation/posts/${encodeURIComponent(postId)}/context`, { headers: citizenAuthHeaders(), signal }),
    saveContext: (postId: string, payload: { summary: string; transcript: string }): Promise<PublicationContext> =>
      fetcher(`/conversation/posts/${encodeURIComponent(postId)}/context`, { method: 'PUT', headers: citizenAuthHeaders(), body: JSON.stringify(payload) }),
    analyze: (params: URLSearchParams): Promise<{ processed: number; detail: string }> =>
      fetcher(`/conversation/analyze?${params}`, { method: 'POST', headers: citizenAuthHeaders() }),
  },
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
    markNoRequest: (id: string) => fetcher(`/cases/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'No requiere gestión', requires_followup: false }) }),
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
    getTriageComments: () => fetcher('/meta/triage-comments', { headers: citizenAuthHeaders() }),
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
    syncLive: async (onProgress?: (job: MetaSyncJob) => void) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('civia_token') : null;
      const job: MetaSyncJob = await fetcher('/meta/sync-live', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return waitForSync(job, onProgress);
    },
    getSyncJob: (id: string, signal?: AbortSignal): Promise<MetaSyncJob> => fetcher(`/meta/sync-jobs/${encodeURIComponent(id)}`, { headers: citizenAuthHeaders(), signal }),
    getSyncStatus: (scope = 'connected', signal?: AbortSignal): Promise<MetaSyncJob> => fetcher(`/meta/sync-status?${new URLSearchParams({ scope })}`, { headers: citizenAuthHeaders(), signal }),
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
