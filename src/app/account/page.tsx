'use client';
import { useCallback, useEffect, useState } from 'react';
import { KeyRound, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api/client';
import styles from './account.module.scss';

export default function AccountPage() {
  const { user, setSession, logoutAll } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof API.auth.sessions>> | null>(null);
  const loadSessions = useCallback(() => API.auth.sessions().then(setSessions).catch(() => setSessions(null)), []);
  useEffect(() => { void loadSessions(); }, [loadSessions]);

  async function changePassword(event: React.FormEvent) {
    event.preventDefault(); setError(''); setNotice('');
    if (newPassword !== confirmation) { setError('Las contraseñas nuevas no coinciden.'); return; }
    if (new TextEncoder().encode(newPassword).length > 72) { setError('La contraseña es demasiado larga; utiliza como máximo 72 bytes.'); return; }
    setBusy(true);
    try {
      setSession(await API.auth.changePassword(currentPassword, newPassword));
      setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      setNotice('Contraseña actualizada. Los accesos anteriores quedaron invalidados; esta ventana continúa con una sesión nueva.');
      await loadSessions();
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo confirmar el cambio.'); }
    finally { setBusy(false); }
  }

  return <div className="page">
    <header className="page-header"><div><h1>Mi cuenta y seguridad</h1><p>Administra tu contraseña y los accesos abiertos a tu cuenta.</p></div></header>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="password-title">
        <KeyRound size={22} /><h2 id="password-title">Cambiar contraseña</h2>
        <p>El cambio invalida los accesos anteriores. Guarda cualquier trabajo pendiente antes de continuar.</p>
        <form onSubmit={changePassword}><fieldset disabled={busy}>
          <label>Contraseña actual<input type="password" required autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
          <label>Nueva contraseña<input type="password" required minLength={10} maxLength={72} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></label>
          <label>Repetir nueva contraseña<input type="password" required minLength={10} maxLength={72} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
          <p>Utiliza al menos 10 caracteres. Evita reutilizar la contraseña de otro servicio.</p>
          <button className="btn-primary" type="submit">{busy ? 'Actualizando…' : 'Actualizar contraseña'}</button>
        </fieldset></form>
      </section>
      <aside className={styles.panel} aria-labelledby="sessions-title">
        <ShieldCheck size={22} /><h2 id="sessions-title">Tus accesos</h2>
        <strong>{user?.full_name}</strong><p>{user?.email}</p>
        {sessions ? <><p>{sessions.length} {sessions.length === 1 ? 'sesión vigente' : 'sesiones vigentes'}</p><ul className={styles.sessions}>{sessions.map((item, index) => <li key={`${item.created_at}:${index}`}><strong>{item.is_current ? 'Sesión actual' : 'Otro acceso'}</strong><span>Inicio: {new Date(item.created_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</span></li>)}</ul></> : <p>No se pudo consultar el listado de accesos.</p>}
        <button className="btn-secondary" disabled={busy} onClick={() => void loadSessions()}><RefreshCw size={16} />Actualizar accesos</button>
        <div className={styles.closeSessions}><p>Cerrar todos los accesos también termina la sesión de esta ventana.</p>
          {confirmAll ? <><button className="btn-primary" disabled={busy} onClick={async () => { setBusy(true); await logoutAll(); setBusy(false); }}>Confirmar cierre</button><button className="btn-secondary" disabled={busy} onClick={() => setConfirmAll(false)}>Cancelar</button></> : <button className="btn-secondary" disabled={busy} onClick={() => setConfirmAll(true)}><LogOut size={16} />Cerrar todos los accesos</button>}
        </div>
      </aside>
    </div>
  </div>;
}
