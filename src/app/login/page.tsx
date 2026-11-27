"use client";

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api/client';
import { safeReturnTo } from '@/lib/session';
import logo from '../../../public/logo.png';
import styles from './login.module.scss';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';

type ViewMode = 'login' | 'forgot_request' | 'forgot_verify' | 'forgot_success';

function LoginContent() {
  const searchParams = useSearchParams();
  const { login, setSession } = useAuth();
  const router = useRouter();

  // Estado general de vista
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Estados de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de Recuperación / OTP
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // ─── 1. Login Normal ──────────────────────────────────────────
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.replace(safeReturnTo(searchParams.get('next')));
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : '') || 'Credenciales no válidas. Revisa tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. Solicitar Código OTP ─────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const targetEmail = (recoveryEmail || email).trim().toLowerCase();
    if (!targetEmail) {
      setError('Por favor ingresa tu correo institucional.');
      setLoading(false);
      return;
    }

    try {
      const res = await API.auth.forgotPassword(targetEmail);
      setRecoveryEmail(targetEmail);
      setInfoMessage(res.message);

      setViewMode('forgot_verify');
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : '') || 'No fue posible enviar el código. Verifica el correo ingresado.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 3. Reenviar Código OTP ──────────────────────────────────
  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await API.auth.forgotPassword(recoveryEmail);
      setInfoMessage(result.message);
      setOtpCode('');

    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : '') || 'Error al reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 4. Validar OTP y Restablecer Contraseña ─────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otpCode.trim();
    if (!/^[0-9]{6}$/.test(cleanOtp)) {
      setError('El código OTP debe tener 6 dígitos numéricos.');
      return;
    }

    if (newPassword.length < 10) {
      setError('La nueva contraseña debe tener al menos 10 caracteres.');
      return;
    }

    if (new TextEncoder().encode(newPassword).length > 72) {
      setError('La contraseña no puede superar 72 bytes.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);

    try {
      const res = await API.auth.resetPassword(recoveryEmail, cleanOtp, newPassword);
      
      // El servidor establece la cookie protegida; aquí solo recibimos el perfil.
      if (res.session_id && res.user) {
        setSession(res);
      }

      setViewMode('forgot_success');

      // Redirigir al dashboard después de 1.8 segundos
      setTimeout(() => {
        router.replace(safeReturnTo(searchParams.get('next')));
      }, 1800);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : '') || 'Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgot = () => {
    setError(null);
    setInfoMessage(null);
    setRecoveryEmail(email || '');
    setViewMode('forgot_request');
  };

  const handleBackToLogin = () => {
    setError(null);
    setInfoMessage(null);
    setViewMode('login');
  };

  return (
    <div className={styles['login-wrapper']}>
      <div className={styles['login-card']}>
        {/* Cabecera de Marca */}
        <div className={styles['brand-header']}>
          <Image src={logo} alt="CIVIA" width={112} loading="eager" className={styles['brand-logo']} />
          {/* <h1 className={styles['brand-title']}>CIVIA</h1> */}
          <p className={styles['brand-motto']}>{'"Ordenemos a Neiva"'}</p>
        </div>

        {searchParams.get('reason') === 'expired' && <div className={styles['info-banner']} role="status">Tu sesión terminó. Inicia sesión para continuar donde estabas.</div>}
        {/* Mensaje de Error */}
        {error && (
          <div className={styles['error-banner']}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Mensaje Informativo */}
        {infoMessage && (
          <div className={styles['info-banner']}>
            <Info size={18} />
            <div>
              <span>{infoMessage}</span>

            </div>
          </div>
        )}

        {/* ─── VISTA 1: Formulario de Login ─── */}
        {viewMode === 'login' && (
          <>
            <form onSubmit={handleSubmitLogin} className={styles['login-form']}>
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

              <div className={styles['form-options']}>
                <button
                  type="button"
                  className={styles['forgot-btn']}
                  onClick={handleOpenForgot}
                >
                  ¿Olvidaste tu contraseña?
                </button>
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

          </>
        )}

        {/* ─── VISTA 2: Solicitar OTP por Correo ─── */}
        {viewMode === 'forgot_request' && (
          <form onSubmit={handleRequestOtp} className={styles['login-form']}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '12px', background: 'var(--accent-surface)', color: 'var(--text-link)', marginBottom: '8px' }}>
                <KeyRound size={28} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recuperar Contraseña</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Ingresa tu correo y te enviaremos un código OTP de 6 dígitos con vigencia de 15 minutos.
              </p>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="recovery-email">Correo Institucional</label>
              <div className={styles['input-container']}>
                <Mail size={16} className={styles['input-icon']} />
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="ejemplo@civia.gov.co"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className={styles['action-row']}>
              <button type="submit" className={styles['submit-btn']} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Enviando Código OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Código de Recuperación</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles['secondary-btn']}
                onClick={handleBackToLogin}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                <span>Volver al inicio de sesión</span>
              </button>
            </div>
          </form>
        )}

        {/* ─── VISTA 3: Ingresar OTP + Nueva Contraseña ─── */}
        {viewMode === 'forgot_verify' && (
          <form onSubmit={handleResetPassword} className={styles['login-form']}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Verificar Código y Nueva Clave</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Si recibiste el código para <strong>{recoveryEmail}</strong>, ingrésalo y define tu nueva contraseña.
              </p>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="otp-code">Código OTP (6 dígitos)</label>
              <div className={styles['input-container']}>
                <input
                  id="otp-code"
                  type="text"
                  maxLength={6}
                  minLength={6}
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className={styles['otp-input']}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="new-password">Nueva Contraseña</label>
              <div className={styles['input-container']}>
                <Lock size={16} className={styles['input-icon']} />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Mínimo 10 caracteres"
                  minLength={10}
                  maxLength={72}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles['toggle-pwd']}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="confirm-password">Confirmar Nueva Contraseña</label>
              <div className={styles['input-container']}>
                <Lock size={16} className={styles['input-icon']} />
                <input
                  id="confirm-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Repite la nueva contraseña"
                  minLength={10}
                  maxLength={72}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className={styles['forgot-btn']}
                onClick={handleResendOtp}
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} />
                <span>¿No te llegó? Reenviar código</span>
              </button>
            </div>

            <div className={styles['action-row']}>
              <button type="submit" className={styles['submit-btn']} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Actualizando Contraseña...</span>
                  </>
                ) : (
                  <>
                    <span>Guardar y Entrar a CIVIA</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles['secondary-btn']}
                onClick={handleBackToLogin}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        )}

        {/* ─── VISTA 4: Éxito y Redirección ─── */}
        {viewMode === 'forgot_success' && (
          <div className={styles['success-card']}>
            <div className={styles['success-icon-wrap']}>
              <CheckCircle2 size={36} />
            </div>
            <h3 className={styles['success-title']}>¡Contraseña Restablecida!</h3>
            <p className={styles['success-desc']}>
              Tu contraseña se actualizó y los accesos anteriores quedaron invalidados. Entrando a CIVIA…
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-link)', fontWeight: 600, fontSize: '0.875rem' }}>
              <Loader2 size={18} className="animate-spin" />
              <span>Redirigiendo al Dashboard...</span>
            </div>
          </div>
        )}

        {/* Footer de Seguridad */}
        <div className={styles['footer-security']}>
          <ShieldCheck size={14} style={{ color: 'var(--emerald-500)' }} />
          <span>Acceso con cuenta autorizada</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<p role="status">Cargando acceso...</p>}><LoginContent /></Suspense>;
}
