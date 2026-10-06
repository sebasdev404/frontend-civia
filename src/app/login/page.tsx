"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.scss';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales no válidas. Revisa tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
    setLoading(true);

    try {
      await login(roleEmail, rolePass);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error autenticando rol demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-wrapper']}>
      <div className={styles['login-card']}>
        {/* Cabecera de Marca */}
        <div className={styles['brand-header']}>
          <div className={styles['logo-badge']}>C</div>
          <h1 className={styles['brand-title']}>CIVIA</h1>
          <p className={styles['brand-subtitle']}>
            Plataforma de Inteligencia Ciudadana y Gestión Estratégica
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className={styles['error-banner']}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className={styles['login-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="email">Correo Institucional</label>
            <div className={styles['input-container']}>
              <Mail size={16} className={styles['input-icon']} />
              <input
                id="email"
                type="email"
                placeholder="usuario@civia.gov.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Contraseña</label>
            <div className={styles['input-container']}>
              <Lock size={16} className={styles['input-icon']} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles['toggle-pwd']}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles['submit-btn']} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Validando Credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Accesos Rápidos Demo para Evaluación y Pruebas */}
        <div className={styles['demo-section']}>
          <div className={styles['demo-title']}>Accesos Rápidos Demo (1 Clic)</div>
          <div className={styles['demo-roles']}>
            <button
              type="button"
              className={styles['demo-role-btn']}
              onClick={() => handleSelectRole('alcalde@civia.gov.co', 'civia2026')}
              disabled={loading}
            >
              <div className={styles['role-info']}>
                <span className={styles['role-name']}>Johan Steed</span>
                <span className={styles['role-sub']}>Despacho del Alcalde Mayor</span>
              </div>
              <span className={[styles['role-badge'], styles.alcalde].join(' ')}>Alcalde</span>
            </button>

            <button
              type="button"
              className={styles['demo-role-btn']}
              onClick={() => handleSelectRole('secretario@civia.gov.co', 'civia2026')}
              disabled={loading}
            >
              <div className={styles['role-info']}>
                <span className={styles['role-name']}>Dra. Camila Morales</span>
                <span className={styles['role-sub']}>Secretaría de Movilidad</span>
              </div>
              <span className={[styles['role-badge'], styles.secretario].join(' ')}>Secretario</span>
            </button>

            <button
              type="button"
              className={styles['demo-role-btn']}
              onClick={() => handleSelectRole('operador@civia.gov.co', 'civia2026')}
              disabled={loading}
            >
              <div className={styles['role-info']}>
                <span className={styles['role-name']}>Carlos Mendoza</span>
                <span className={styles['role-sub']}>Centro de Atención Ciudadana</span>
              </div>
              <span className={[styles['role-badge'], styles.operador].join(' ')}>Operador</span>
            </button>
          </div>
        </div>

        {/* Footer de Seguridad */}
        <div className={styles['footer-security']}>
          <ShieldCheck size={14} style={{ color: 'var(--emerald-500)' }} />
          <span>Autenticación Segura JWT • Cifrado Criptográfico SHA-256</span>
        </div>
      </div>
    </div>
  );
}
