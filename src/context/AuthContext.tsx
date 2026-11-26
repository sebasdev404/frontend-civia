"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { API, ApiError } from '@/lib/api/client';
import { acceptSession, clearLegacyCredentials, clearSession, expireSession, notifyOtherTabs, sessionGeneration, SESSION_CHANGED, SESSION_EXPIRED, type AuthUser, type SessionInfo } from '@/lib/session';
export type { AuthUser, UserRole, SessionInfo } from '@/lib/session';

interface AuthContextType {
  user: AuthUser | null; isAuthenticated: boolean; isLoading: boolean;
  sessionError: string | null; sessionExpired: boolean; retrySession: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>; logoutAll: () => Promise<void>; setSession: (info: SessionInfo) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const initial = { user: null as AuthUser | null, session_id: null as string | null, expires_at: '', isLoading: true, sessionError: null as string | null, sessionExpired: false };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setState] = useState(initial);
  const sequence = useRef(0);
  const validate = useCallback(async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    const attempt = ++sequence.current;
    try {
      const info = await API.auth.me(signal);
      if (signal?.aborted || attempt !== sequence.current) return;
      acceptSession(info);
      setState({ ...initial, isLoading: false, ...info });
    } catch (error) {
      if (signal?.aborted || attempt !== sequence.current) return;
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        setState(previous => ({ ...initial, isLoading: false, sessionExpired: !!previous.user || error.code !== 'NO_SESSION' || sessionStorage.getItem('civia_session_notice') === 'expired' }));
      } else {
        setState(previous => previous.user ? previous : { ...initial, isLoading: false, sessionError: 'No pudimos contactar al servidor para validar tu sesión. Reintenta cuando vuelva la conexión.' });
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    clearLegacyCredentials();
    void Promise.resolve().then(() => validate(controller.signal));
    const expired = () => { sequence.current++; setState({ ...initial, isLoading: false, sessionExpired: true }); };
    const changed = () => { void validate(controller.signal); };
    const storage = (event: StorageEvent) => { if (event.key === 'civia_session_signal') changed(); };
    window.addEventListener(SESSION_EXPIRED, expired);
    window.addEventListener(SESSION_CHANGED, changed);
    window.addEventListener('storage', storage);
    window.addEventListener('focus', changed);
    return () => { controller.abort(); window.removeEventListener(SESSION_EXPIRED, expired); window.removeEventListener(SESSION_CHANGED, changed); window.removeEventListener('storage', storage); window.removeEventListener('focus', changed); };
  }, [validate]);

  useEffect(() => {
    if (!session.session_id || !session.expires_at) return;
    const epoch = sessionGeneration();
    let timer = 0;
    const arm = () => {
      const remaining = Date.parse(session.expires_at) - Date.now();
      if (!Number.isFinite(remaining) || remaining <= 0) expireSession(epoch, session.session_id!);
      else timer = window.setTimeout(arm, Math.min(remaining, 2147483647));
    };
    arm();
    return () => clearTimeout(timer);
  }, [session.session_id, session.expires_at]);

  const setSession = (info: SessionInfo) => {
    sequence.current++;
    acceptSession(info);
    setState({ ...initial, isLoading: false, ...info });
    notifyOtherTabs();
  };
  const login = async (email: string, password: string): Promise<AuthUser> => {
    const result = await API.auth.login({ email, password });
    setSession(result);
    return result.user;
  };
  const closeSession = async (all: boolean) => {
    try {
      if (all) await API.auth.logoutAll(); else await API.auth.logout();
      sequence.current++;
      clearSession(); sessionStorage.removeItem('civia_session_notice');
      setState({ ...initial, isLoading: false }); notifyOtherTabs();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SESSION_CHANGED') { await validate(); return; }
      setState(previous => ({ ...previous, sessionError: 'No pudimos confirmar el cierre en el servidor. Reintenta cuando vuelva la conexión.' }));
    }
  };
  const retrySession = () => { setState(initial); void validate(); };
  return <AuthContext.Provider value={{ ...session, isAuthenticated: !!session.user, login, logout: () => closeSession(false), logoutAll: () => closeSession(true), setSession, retrySession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requiere AuthProvider.');
  return context;
}
