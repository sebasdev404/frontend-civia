"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api/client';

export type UserRole = 'ADMIN' | 'ALCALDE' | 'SECRETARIO' | 'OPERADOR';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS: Record<UserRole, AuthUser> = {
  ADMIN: {
    id: 'USR-000',
    email: 'admin@civia.gov.co',
    full_name: 'Ing. Juan Perdomo',
    role: 'ADMIN',
    department: 'Dirección de Tecnologías y Seguridad TI',
    avatar_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  ALCALDE: {
    id: 'USR-001',
    email: 'alcalde@civia.gov.co',
    full_name: 'Johan Steed',
    role: 'ALCALDE',
    department: 'Despacho del Alcalde',
    avatar_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  SECRETARIO: {
    id: 'USR-002',
    email: 'secretario@civia.gov.co',
    full_name: 'Dra. Camila Morales',
    role: 'SECRETARIO',
    department: 'Secretaría de Movilidad y Servicios',
    avatar_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  OPERADOR: {
    id: 'USR-003',
    email: 'operador@civia.gov.co',
    full_name: 'Carlos Mendoza',
    role: 'OPERADOR',
    department: 'Centro de Monitoreo Ciudadano',
    avatar_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
};

const DEFAULT_DEMO_USER: AuthUser = DEMO_ACCOUNTS.ALCALDE;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Inicializar estado desde LocalStorage al cargar la aplicación
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('civia_token');
      const storedUser = localStorage.getItem('civia_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Revalidación silenciosa con el backend
        API.auth.me()
          .then((freshUser: any) => {
            setUser(freshUser);
            localStorage.setItem('civia_user', JSON.stringify(freshUser));
          })
          .catch(() => {
            // Si el backend no responde pero hay sesión guardada, conservamos la sesión local
          });
      } else {
        // Para asegurar que el usuario pueda explorar si entra directamente sin login inicial
        // iniciamos con la sesión guardada o dejamos null
      }
    } catch (e) {
      console.warn('Error leyendo sesión local:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    try {
      const res = await API.auth.login({ email, password });
      const loggedUser = res.user;
      const accessToken = res.access_token;

      setUser(loggedUser);
      setToken(accessToken);

      localStorage.setItem('civia_token', accessToken);
      localStorage.setItem('civia_user', JSON.stringify(loggedUser));
      document.cookie = `civia_token=${accessToken}; path=/; max-age=691200; SameSite=Lax`;

      return loggedUser;
    } catch (err: any) {
      // Si el backend estuviera offline, permitimos autenticación de prueba local
      const roleMatch = Object.values(DEMO_ACCOUNTS).find(acc => acc.email.toLowerCase() === email.toLowerCase());
      if (roleMatch && password === 'civia2026') {
        setUser(roleMatch);
        const demoToken = `demo-token-${roleMatch.role.toLowerCase()}`;
        setToken(demoToken);
        localStorage.setItem('civia_token', demoToken);
        localStorage.setItem('civia_user', JSON.stringify(roleMatch));
        return roleMatch;
      }
      throw err;
    }
  };

  const switchDemoUser = async (role: UserRole) => {
    const target = DEMO_ACCOUNTS[role];
    try {
      await login(target.email, 'civia2026');
    } catch {
      setUser(target);
      setToken(`demo-token-${role.toLowerCase()}`);
      localStorage.setItem('civia_token', `demo-token-${role.toLowerCase()}`);
      localStorage.setItem('civia_user', JSON.stringify(target));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civia_token');
    localStorage.removeItem('civia_user');
    document.cookie = 'civia_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: DEFAULT_DEMO_USER,
      token: 'demo-token',
      isAuthenticated: true,
      isLoading: false,
      login: async () => DEFAULT_DEMO_USER,
      logout: () => {},
      switchDemoUser: async () => {},
    };
  }
  return context;
}
