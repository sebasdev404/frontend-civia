'use client';
import { useEffect, useState } from 'react';
import { API, type CaseCorrectionReview } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import styles from './CaseConsolidationPanel.module.scss';

export function CaseCorrectionPanel({ caseId, onChanged }: { caseId: string; onChanged: () => Promise<void> }) {
  const { user } = useAuth();
  const canDecide = user?.role === 'ADMIN' || user?.role === 'SECRETARIO';
  const [review, setReview] = useState<CaseCorrectionReview | null>(null);
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [disposition, setDisposition] = useState<'needs_review' | 'general_opinion'>('needs_review');
  const [confirmed, setConfirmed] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [undoId, setUndoId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    API.caseCorrections.review(caseId).then(value => { if (active) { setReview(value); setRequestId(crypto.randomUUID()); } })
      .catch((e: Error) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [caseId]);
  async function refresh() {
    setReview(await API.caseCorrections.review(caseId));
    setRequestId(crypto.randomUUID()); setConfirmed(false);
  }
  async function save() {
    if (!review || busy || !confirmed) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const saved = await API.caseCorrections.save({ request_id: requestId, case_id: caseId, revision: review.revision,
        disposition, reason: reason.trim(), confirmed_review: true });
      await refresh(); await onChanged(); setOpened(false); setReason('');
      setNotice(saved.undone_at ? 'Esta operación ya había sido revertida. Revisa el estado actual.' : 'Corrección guardada. Se retiró la asignación de prueba y se conservó el historial.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la corrección.'); }
    finally { setBusy(false); }
  }
  async function undo() {
    if (!undoId || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await API.caseCorrections.undo(undoId, reason.trim());
      await refresh(); await onChanged(); setUndoId(null); setReason('');
      setNotice('Corrección revertida; se conservan las notas de ambas operaciones.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo revertir la corrección.'); }
    finally { setBusy(false); }
  }
  return <section className={styles.panel} aria-label="Corrección de despacho de prueba">
    <h2>Despacho de prueba registrado</h2><p>Una asignación de prueba no acredita atención real. Revisa el comentario y la bitácora antes de retirar su efecto operativo.</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}{notice && <p role="status" className={styles.notice}>{notice}</p>}
    {review?.history.map(row => <article className={styles.history} key={row.id}>
      <strong>{row.undone_at ? 'Corrección revertida' : 'Asignación de prueba retirada'}</strong>
      <p>{row.disposition === 'general_opinion' ? 'Clasificado por revisión humana como opinión general sin solicitud.' : 'Dejado pendiente de revisión de la solicitud.'}</p>
      <p>{row.reason}</p><small>Registró {row.created_by} · {new Date(row.created_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</small>
      {row.undone_at ? <p>Revirtió {row.undone_by}: {row.undo_reason}</p> : canDecide && <p><button className="btn-secondary" disabled={busy} onClick={() => { setUndoId(row.id); setOpened(false); setReason(''); }}>Revertir corrección</button></p>}
    </article>)}
    {undoId && <form className={styles.decision} onSubmit={e => { e.preventDefault(); void undo(); }}>
      <p>Solo se podrá restaurar la asignación anterior si no existen cambios posteriores ni una consolidación activa.</p>
      <label>Motivo de reversión<textarea required minLength={10} maxLength={2000} disabled={busy} value={reason} onChange={e => setReason(e.target.value)} /></label>
      <div className={styles.actions}><button className="btn-primary" disabled={busy || reason.trim().length < 10}>Confirmar reversión</button><button type="button" className="btn-secondary" disabled={busy} onClick={() => setUndoId(null)}>Cancelar</button></div>
    </form>}
    {canDecide && review && !review.history.some(row => !row.undone_at) && <button className="btn-secondary" disabled={busy} onClick={() => { setOpened(true); setUndoId(null); setConfirmed(false); }}>Corregir despacho de prueba</button>}
    {opened && review && <div className={styles.decision}>
      <button className="btn-secondary" disabled={busy} onClick={() => { setBusy(true); void refresh().catch((e: Error) => setError(e.message)).finally(() => setBusy(false)); }}>Actualizar revisión</button>
      {review.blockers.map(value => <p className={styles.warning} key={value}>{value}</p>)}
      <p><strong>Asignación actual:</strong> {String(review.case.assigned_to || 'Sin responsable')} · {String(review.case.assigned_department || 'Sin dependencia')}</p>
      <blockquote>{review.test_note || 'No se encontró una última asignación explícita de prueba.'}</blockquote>
      <details><summary>Ver comentario, publicación y bitácora</summary>
        <blockquote>{review.case.content}</blockquote><p>{review.source?.post_title}</p><p>{review.source?.post_message}</p>
        <pre>{review.case.internal_notes || 'Sin notas registradas'}</pre>
      </details>
      {!review.blockers.length && <form onSubmit={e => { e.preventDefault(); void save(); }}>
        <label>Qué hacer después de retirar la asignación<select disabled={busy} value={disposition} onChange={e => { setDisposition(e.target.value as typeof disposition); setConfirmed(false); }}>
          <option value="needs_review">Dejar pendiente de revisión de la solicitud</option><option value="general_opinion">Marcar como opinión general sin solicitud concreta</option>
        </select></label>
        <p>Se retirarán la persona y la dependencia asignadas. Se conservarán el comentario, su origen y la bitácora completa. No se registrará una solución ni se cerrará como resuelto.</p>
        <label>Motivo de la corrección<textarea required minLength={10} maxLength={2000} disabled={busy} value={reason} onChange={e => setReason(e.target.value)} /></label>
        <label className={styles.check}><input type="checkbox" disabled={busy} checked={confirmed} onChange={e => setConfirmed(e.target.checked)} required />{disposition === 'general_opinion' ? 'Revisé la evidencia y confirmo que es una opinión general sin solicitud concreta, con una asignación de prueba que debe retirarse.' : 'Revisé la bitácora y confirmo que corresponde retirar esta asignación de prueba y dejar el contenido pendiente de revisión.'}</label>
        <button className="btn-primary" disabled={busy || !confirmed || reason.trim().length < 10}>Guardar corrección con historial</button>
      </form>}
    </div>}
    {!canDecide && <p>Administración o Secretaría pueden registrar esta corrección.</p>}
  </section>;
}
