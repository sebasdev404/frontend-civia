"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api/client';
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

export default function LoginPage() {
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
  const [devOtpNotice, setDevOtpNotice] = useState<string | null>(null);

  // ─── 1. Login Normal ──────────────────────────────────────────
  const handleSubmitLogin = async (e: React.FormEvent) => {
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
      if (res.dev_otp) {
        setDevOtpNotice(res.dev_otp);
      }
      setViewMode('forgot_verify');
    } catch (err: any) {
      setError(err.message || 'No fue posible enviar el código. Verifica el correo ingresado.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 3. Reenviar Código OTP ──────────────────────────────────
  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await API.auth.forgotPassword(recoveryEmail);
      setInfoMessage('Nuevo código OTP generado y enviado.');
      if (res.dev_otp) {
        setDevOtpNotice(res.dev_otp);
      }
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 4. Validar OTP y Restablecer Contraseña ─────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length < 6) {
      setError('El código OTP debe tener 6 dígitos numéricos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);

    try {
      const res = await API.auth.resetPassword(recoveryEmail, cleanOtp, newPassword);
      
      // Iniciar sesión con el nuevo token retornado
      if (res.access_token && res.user) {
        setSession(res.user, res.access_token);
      }

      setViewMode('forgot_success');

      // Redirigir al dashboard después de 1.8 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgot = () => {
    setError(null);
    setInfoMessage(null);
    setDevOtpNotice(null);
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

        {/* Mensaje Informativo */}
        {infoMessage && (
          <div className={styles['info-banner']}>
            <Info size={18} />
            <div>
              <span>{infoMessage}</span>
              {devOtpNotice && (
                <div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Código OTP de prueba:</span>{' '}
                  <span className={styles['otp-highlight']}>{devOtpNotice}</span>
                </div>
              )}
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

                <button
                  type="button"
                  className={styles['demo-role-btn']}
                  onClick={() => handleSelectRole('admin@civia.gov.co', 'civia2026')}
                  disabled={loading}
                >
                  <div className={styles['role-info']}>
                    <span className={styles['role-name']}>Ing. Juan Perdomo</span>
                    <span className={styles['role-sub']}>Dirección TI y Gobernanza</span>
                  </div>
                  <span className={[styles['role-badge'], styles.admin].join(' ')}>Admin TI</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ─── VISTA 2: Solicitar OTP por Correo ─── */}
        {viewMode === 'forgot_request' && (
          <form onSubmit={handleRequestOtp} className={styles['login-form']}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-600)', marginBottom: '8px' }}>
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
                Ingresa el código enviado a <strong>{recoveryEmail}</strong> y define tu nueva contraseña.
              </p>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="otp-code">Código OTP (6 dígitos)</label>
              <div className={styles['input-container']}>
                <input
                  id="otp-code"
                  type="text"
                  maxLength={6}
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
                  placeholder="Mínimo 6 caracteres"
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
              Tu nueva clave de acceso ha sido guardada de forma segura con cifrado SHA-256. Iniciando tu sesión en el Despacho CIVIA...
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue-600)', fontWeight: 600, fontSize: '0.875rem' }}>
              <Loader2 size={18} className="animate-spin" />
              <span>Redirigiendo al Dashboard...</span>
            </div>
          </div>
        )}

        {/* Footer de Seguridad */}
        <div className={styles['footer-security']}>
          <ShieldCheck size={14} style={{ color: 'var(--emerald-500)' }} />
          <span>Autenticación Segura JWT • Cifrado Criptográfico SHA-256</span>
        </div>
      </div>
    </div>
  );
}
