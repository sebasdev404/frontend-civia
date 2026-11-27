/**
 * Configuración base para el cliente de API que se conectará con FastAPI.
 * Utiliza fetch nativo para realizar peticiones.
 */

import { currentSessionId, sessionGeneration, expireSession, withAuthLock, SESSION_CHANGED, type SessionInfo } from '@/lib/session';

const API_BASE_URL = '/api/backend';

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
  reported_comments?: number | null;
  captured_comments?: number;
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

export interface CaseConflictReview {
  classification: string;
  related_case_ids: string[];
  attention_case_ids: string[];
  differences: Record<string, string[]>;
  checked_at: string;
}

export interface CaseConsolidation {
  id: string; primary_case_id: string; duplicate_case_id: string; reason: string;
  created_by: string; created_at: string; undone_at: string | null; undone_by: string | null; undo_reason: string | null;
}
export interface CaseComparisonRecord {
  id: string; title: string; content: string; author: string; internal_notes: string | null;
  [field: string]: string | number | boolean | null;
}
export interface CaseCorrection {
  id: string; case_id: string; disposition: 'needs_review' | 'general_opinion'; reason: string;
  created_by: string; created_at: string; undone_at: string | null; undone_by: string | null; undo_reason: string | null;
}
export interface CaseCorrectionReview {
  case: CaseComparisonRecord; test_note: string | null; blockers: string[]; revision: string; history: CaseCorrection[];
  source: { post_title: string; post_message: string | null; post_url: string | null; comment: { content?: string; message?: string } } | null;
}
export interface CaseComparison {
  cases: CaseComparisonRecord[]; differences: string[]; attention_case_ids: string[];
  blockers: string[]; revision: string;
  source: { post_id: string; comment_id: string; post_title: string; post_message: string | null; post_url: string | null; comment: { content?: string; message?: string } } | null;
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
  provenance_status?: 'needs_review' | 'recovered_local' | 'consolidated' | null;
  provenance_reason?: string | null;
  provenance_conflict?: CaseConflictReview | null;
  duplicate_of?: string | null;
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
  summary: { captured: number; analyzed: number; pending: number; pending_with_context: number; review: number;
    stances: Partial<Record<ConversationStance, number>>; anger_in_support: number;
    reported: number; posts_missing_context: number };
  themes: { topic: string; narrative: string; label: string; count: number }[];
  posts: { id: string; title: string; month: string | null; captured: number; reported: number;
    context_ready: boolean; context_source: string; is_video: boolean }[];
  items: ConversationComment[]; total: number; has_more: boolean; ai_available: boolean;
  automatic_analysis: boolean;
  analysis_status: MetaSyncJob['status'];
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

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); this.name = 'ApiError'; }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  const requestGeneration = sessionGeneration();
  const sid = currentSessionId();
  const publicAuth = /^\/auth\/(login|forgot-password|verify-otp|reset-password)$/.test(endpoint);
  headers.delete('Authorization');
  // Profile validation discovers a cookie renewed by another tab.
  if (sid && !publicAuth && endpoint !== '/auth/me') headers.set('X-Civia-Session', sid);
  if (typeof options.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const send = () => fetch(url, {
    ...options,
    cache: 'no-store',
    credentials: 'same-origin',
    headers,
  });
  const response = /^\/auth\/(login|logout|logout-all|reset-password|change-password)$/.test(endpoint) ? await withAuthLock(send) : await send();

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 && !publicAuth && (errorData.code !== 'NO_SESSION' || sid !== null) && typeof window !== 'undefined') expireSession(requestGeneration, errorData.session_id);
    if (errorData.code === 'SESSION_CHANGED' && typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_CHANGED));
    const detail = typeof errorData.detail === 'string' ? errorData.detail : response.status === 403 ? 'Tu rol no permite realizar esta acción.' : 'No se pudo completar la solicitud.';
    throw new ApiError(detail, response.status, errorData.code);
  }
  return response;
}

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const response = await apiRequest(endpoint, options);
  return response.status === 204 ? null : response.json();
}


async function waitForSync(job: MetaSyncJob, onProgress?: (job: MetaSyncJob) => void) {
  let current = job;
  onProgress?.(current);
  while (current.id && (current.status === 'queued' || current.status === 'running')) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    current = await fetcher(`/meta/sync-jobs/${encodeURIComponent(current.id)}`, {  });
    onProgress?.(current);
  }
  if (current.status === 'failed' || current.status === 'interrupted') throw new Error(current.error || 'La actualización se interrumpió.');
  return { ...current.result, status: current.status };
}

export const API = {
  caseCorrections: {
    review: (id: string): Promise<CaseCorrectionReview> => fetcher(`/case-corrections/case/${encodeURIComponent(id)}`, {  }),
    save: (payload: { request_id: string; case_id: string; revision: string; disposition: 'needs_review' | 'general_opinion'; reason: string; confirmed_review: true }): Promise<CaseCorrection> => fetcher('/case-corrections', { method: 'POST', body: JSON.stringify(payload) }),
    undo: (id: string, reason: string): Promise<CaseCorrection> => fetcher(`/case-corrections/${encodeURIComponent(id)}/undo`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },
  caseConsolidations: {
    compare: (primary_case_id: string, duplicate_case_id: string): Promise<CaseComparison> => fetcher('/case-consolidations/compare', { method: 'POST', body: JSON.stringify({ primary_case_id, duplicate_case_id }) }),
    history: (id: string): Promise<CaseConsolidation[]> => fetcher(`/case-consolidations/case/${encodeURIComponent(id)}`, {  }),
    save: (payload: { request_id: string; primary_case_id: string; duplicate_case_id: string; revision: string; reason: string; confirmed_same_request: true }): Promise<CaseConsolidation> => fetcher('/case-consolidations', { method: 'POST', body: JSON.stringify(payload) }),
    undo: (id: string, reason: string): Promise<CaseConsolidation> => fetcher(`/case-consolidations/${encodeURIComponent(id)}/undo`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },
  triage: {
    consolidate: (payload: { comments: { post_id: string; comment_id: string }[]; target_case_id?: string; title?: string }): Promise<{ case_id: string; created: boolean; linked: number; already_linked: number; comments_count: number }> => fetcher('/triage/consolidate', { method: 'POST', body: JSON.stringify(payload) }),
  },
  publications: {
    sources: (signal?: AbortSignal): Promise<PublicationSource[]> => fetcher('/publications/sources', { signal }),
    list: (params: URLSearchParams, signal?: AbortSignal): Promise<{ items: PublicationSummary[]; total: number; has_more: boolean }> => fetcher(`/publications?${params}`, { signal }),
    detail: (sourceId: string, postId: string, params: URLSearchParams, signal?: AbortSignal): Promise<PublicationDetail> => fetcher(`/publications/${encodeURIComponent(sourceId)}/${encodeURIComponent(postId)}?${params}`, { signal }),
    sync: (sourceId: string): Promise<MetaSyncJob> => fetcher(`/publications/sources/${encodeURIComponent(sourceId)}/sync`, { method: 'POST' }),
    refresh: (sourceId: string, postId: string): Promise<MetaSyncJob> => fetcher(`/publications/${encodeURIComponent(sourceId)}/${encodeURIComponent(postId)}/refresh`, { method: 'POST' }),
    exportComments: async (sourceId: string, postId: string): Promise<Blob> => {
      const response = await apiRequest(`/publications/${encodeURIComponent(sourceId)}/${encodeURIComponent(postId)}/comments.csv`);
      return response.blob();
    },
  },
  conversation: {
    getOverview: (params: URLSearchParams, signal?: AbortSignal): Promise<ConversationOverview> =>
      fetcher(`/conversation?${params}`, { signal }),
    getContext: (postId: string, signal?: AbortSignal): Promise<PublicationContext> =>
      fetcher(`/conversation/posts/${encodeURIComponent(postId)}/context`, { signal }),
    saveContext: (postId: string, payload: { summary: string; transcript: string }): Promise<PublicationContext> =>
      fetcher(`/conversation/posts/${encodeURIComponent(postId)}/context`, { method: 'PUT', body: JSON.stringify(payload) }),
    analyze: (params: URLSearchParams): Promise<{ processed: number; detail: string }> =>
      fetcher(`/conversation/analyze?${params}`, { method: 'POST' }),
  },
  citizens: {
    getAll: (params: URLSearchParams, signal?: AbortSignal) => fetcher(`/citizens?${params}`, { signal }),
    getById: (id: string) => fetcher(`/citizens/${encodeURIComponent(id)}`, {  }),
    deleteOne: (id: string): Promise<{ success: boolean; deleted_count: number; deleted_ids: string[] }> => fetcher(`/citizens/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    deleteMany: (ids: string[]): Promise<{ success: boolean; deleted_count: number; deleted_ids: string[] }> => fetcher('/citizens/bulk-delete', { method: 'POST', body: JSON.stringify({ citizen_ids: ids }) }),
    getComments: (id: string) => fetcher(`/citizens/${encodeURIComponent(id)}/comments`, {  }),
    saveReply: (id: string, payload: { case_id: string; reply_text: string; expected_revision: string }) => fetcher(`/citizens/${encodeURIComponent(id)}/reply`, { method: 'POST', body: JSON.stringify(payload) }),
    importFile: (file: File, preview: boolean) => {
      const body = new FormData();
      body.append('file', file);
      return fetcher(`/citizens/import${preview ? '/preview' : ''}`, { method: 'POST', body });
    },
  },
  auth: {
    login: (credentials: { email: string; password: string }): Promise<SessionInfo> =>
      fetcher('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () => fetcher('/auth/logout', { method: 'POST' }),
    logoutAll: () => fetcher('/auth/logout-all', { method: 'POST' }),
    sessions: (): Promise<{ created_at: string; expires_at: string; is_current: boolean }[]> => fetcher('/auth/sessions'),
    changePassword: (current_password: string, new_password: string): Promise<SessionInfo> => fetcher('/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password, new_password }) }),
    me: (signal?: AbortSignal): Promise<SessionInfo> => {
      const controller = new AbortController();
      const abort = () => controller.abort();
      if (signal?.aborted) controller.abort();
      else signal?.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(abort, 15000);
      return fetcher('/auth/me', {
        signal: controller.signal,
      }).finally(() => { clearTimeout(timer); signal?.removeEventListener('abort', abort); });
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
    updateUser: (id:string,data:{full_name:string;role:string;department:string;is_active:boolean;reason:string;expected_revision:string}) => fetcher(`/auth/users/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(data)}),
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
    markNoRequest: (id: string, data: { reason: string; confirmed_review: boolean; expected_revision: string }) => fetcher(`/cases/${id}/no-request`, { method: 'POST', body: JSON.stringify(data) }),
    reopen: (id: string, data: { reason: string; confirmed_reopening: boolean; expected_revision: string }) => fetcher(`/cases/${encodeURIComponent(id)}/reopen`, { method: 'POST', body: JSON.stringify(data) }),
    registerReference: (id: string, data: { number:string; institution:string; issued_on:string; evidence_reference:string; reason:string; confirmed_review:boolean; expected_revision:string }) => fetcher(`/cases/${encodeURIComponent(id)}/registration`, {method:'POST',body:JSON.stringify(data)}),
    cancelReference: (id:string, data:{reason:string;confirmed_review:boolean;expected_revision:string}) => fetcher(`/cases/${encodeURIComponent(id)}/registration/cancel`,{method:'POST',body:JSON.stringify(data)}),
    dispatch: (id: string, data: { assigned_department: string; assigned_to: string; note: string; confirmed_review: boolean; expected_revision: string }) =>
      fetcher(`/cases/${id}/dispatch`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addNote: (id: string, data: { note: string; expected_revision: string }) =>
      fetcher(`/cases/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    resolve: (id: string, data: { resolution_note: string; evidence_reference: string; confirmed_resolution: boolean; expected_revision: string }) =>
      fetcher(`/cases/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    togglePriority: (id: string, priority_action: boolean, expected_revision: string) =>
      fetcher(`/cases/${id}/priority-action`, {
        method: 'POST',
        body: JSON.stringify({ priority_action, expected_revision }),
      }),
    savePublicResponse: (id: string, public_response: string, expected_revision: string) =>
      fetcher(`/cases/${id}/public-response`, {
        method: 'POST',
        body: JSON.stringify({ public_response, expected_revision }),
      }),
  },
  analytics: {
    getOverview: (options: RequestInit = {}): Promise<import('@/lib/analytics').AnalyticsOverview> => fetcher('/analytics/overview', options),
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
    getTriageComments: () => fetcher('/meta/triage-comments', {  }),
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
      const job: MetaSyncJob = await fetcher('/meta/sync-live', {
        method: 'POST',
      });
      return waitForSync(job, onProgress);
    },
    getSyncJob: (id: string, signal?: AbortSignal): Promise<MetaSyncJob> => fetcher(`/meta/sync-jobs/${encodeURIComponent(id)}`, { signal }),
    getSyncStatus: (scope = 'connected', signal?: AbortSignal): Promise<MetaSyncJob> => fetcher(`/meta/sync-status?${new URLSearchParams({ scope })}`, { signal }),
  },
  system: {
    getDiagnostics: () => fetcher('/system/diagnostics'),
  },
  ai: {
    generateReply: (payload: { comment_text: string; user_type: string; author_metadata?: Record<string, unknown> }): Promise<{ response_text: string; topic: string }> => fetcher('/ai/generate-smart-reply', { method: 'POST', body: JSON.stringify(payload) }),
    getCredits: () => fetcher('/ai/credits'),
    syncBalance: (payload: { initial_budget?: number; real_balance?: number; consumed_usd?: number }) =>
      fetcher('/ai/sync-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
  },
};
