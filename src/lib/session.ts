export type UserRole = 'ADMIN' | 'ALCALDE' | 'SECRETARIO' | 'OPERADOR';
export interface AuthUser {
  id: string; email: string; full_name: string; role: UserRole;
  department?: string; avatar_url?: string | null; is_active: boolean; created_at: string;
}
export interface SessionInfo { user: AuthUser; session_id: string; expires_at: string }
export const SESSION_EXPIRED = 'civia:session-expired';
export const SESSION_CHANGED = 'civia:session-changed';
let generation = 0;
let sessionId: string | null = null;

export const sessionGeneration = () => generation;
export const currentSessionId = () => sessionId;

export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\r\n]/.test(value)) return '/dashboard';
  const path = value.split(/[?#]/)[0];
  return path === '/login' || path.startsWith('/login/') ? '/dashboard' : value;
}

export function clearLegacyCredentials() {
  localStorage.removeItem('civia_token');
  localStorage.removeItem('civia_user');
  document.cookie = 'civia_token=; path=/; max-age=0; SameSite=Lax';
}

export function acceptSession(info: SessionInfo) {
  if (sessionId !== info.session_id) generation++;
  sessionId = info.session_id;
  clearLegacyCredentials();
  sessionStorage.removeItem('civia_session_notice');
}

export function clearSession() {
  sessionId = null;
  generation++;
  clearLegacyCredentials();
}

export function notifyOtherTabs() {
  // A signal only; credentials and account profiles are never stored here.
  localStorage.setItem('civia_session_signal', `${Date.now()}:${crypto.randomUUID()}`);
}

export function expireSession(requestGeneration: number, rejectedSessionId?: string) {
  if (requestGeneration !== generation) return;
  if (rejectedSessionId && sessionId && rejectedSessionId !== sessionId) {
    window.dispatchEvent(new Event(SESSION_CHANGED));
    return;
  }
  clearSession();
  sessionStorage.setItem('civia_session_notice', 'expired');
  window.dispatchEvent(new Event(SESSION_EXPIRED));
}

let authQueue: Promise<unknown> = Promise.resolve();
export async function withAuthLock<T>(action: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) return await navigator.locks.request('civia-auth', action);
  const next = authQueue.then(action, action);
  authQueue = next.catch(() => undefined);
  return next;
}
