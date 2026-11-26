'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API, type CaseComparison, type CaseConsolidation } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import { fieldLabels } from './CaseProvenanceNote';
import styles from './CaseConsolidationPanel.module.scss';

const display = (value: string | number | boolean | null | undefined) => value == null || value === '' ? 'Sin dato registrado' : typeof value === 'boolean' ? value ? 'Sí' : 'No' : String(value);
const date = (value: string) => new Date(value).toLocaleString('es-CO', { timeZone: 'America/Bogota' });

export function CaseConsolidationPanel({ caseId, relatedIds, onChanged }: {
  caseId: string; relatedIds: string[]; onChanged: () => Promise<void>;
}) {
  const { user } = useAuth();
  const canDecide = user?.role === 'ADMIN' || user?.role === 'SECRETARIO';
  const [history, setHistory] = useState<CaseConsolidation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [otherId, setOtherId] = useState(relatedIds[0] || '');
  const [preview, setPreview] = useState<CaseComparison | null>(null);
  const [primary, setPrimary] = useState(caseId);
  const [requestId, setRequestId] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [undoId, setUndoId] = useState<string | null>(null);
  const [undoReason, setUndoReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    API.caseConsolidations.history(caseId).then(rows => { if (active) setHistory(rows); })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [caseId]);

  async function compare() {
    if (busy || !otherId) return;
    setBusy(true); setError(''); setNotice(''); setPreview(null); setConfirmed(false); setReason('');
    try {
      const value = await API.caseConsolidations.compare(caseId, otherId);
      setPreview(value); setPrimary(value.attention_case_ids.length === 1 ? value.attention_case_ids[0] : caseId);
      setRequestId(crypto.randomUUID());
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar la comparación'); }
    finally { setBusy(false); }
  }
  async function refresh() {
    setHistory(await API.caseConsolidations.history(caseId));
    await onChanged();
  }
  async function save() {
    if (!preview || busy || !confirmed) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const saved = await API.caseConsolidations.save({ request_id: requestId, primary_case_id: primary,
        duplicate_case_id: preview.cases.find(row => row.id !== primary)!.id,
        revision: preview.revision, reason: reason.trim(), confirmed_same_request: true });
      setPreview(null); setConfirmed(false); await refresh();
      setNotice(saved.undone_at ? 'Esta operación ya estaba registrada y fue revertida. Actualiza la comparación para tomar una nueva decisión.' : 'Consolidación guardada. Ambos expedientes y sus bitácoras se conservan. La atención continúa en el principal.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar. Puedes reintentar; la operación no se duplica.'); }
    finally { setBusy(false); }
  }
  async function undo() {
    if (!undoId || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await API.caseConsolidations.undo(undoId, undoReason.trim());
      setUndoId(null); setUndoReason(''); setPreview(null); await refresh();
      setNotice('Consolidación deshecha. Ambos casos vuelven a la bandeja con todos sus datos y cambios posteriores.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo deshacer la consolidación'); }
    finally { setBusy(false); }
  }
  if (!relatedIds.length && !history.length) {
    if (historyLoading) return <p role="status">Consultando relaciones entre expedientes…</p>;
    if (error) return <p className={styles.error} role="alert">No se pudieron consultar los expedientes relacionados: {error}</p>;
    return null;
  }
  return <section className={styles.panel} aria-label="Comparación y consolidación de expedientes">
    <h2>Expedientes relacionados</h2>
    <p>Compara ambos historiales antes de confirmar que corresponden a la misma solicitud.</p>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    {history.map(row => <article key={row.id} className={styles.history}>
      <strong>{row.undone_at ? 'Consolidación deshecha' : 'Consolidación activa'}</strong>
      <p>Principal: <Link href={`/cases/${encodeURIComponent(row.primary_case_id)}`}>{row.primary_case_id}</Link> · Duplicado: <Link href={`/cases/${encodeURIComponent(row.duplicate_case_id)}`}>{row.duplicate_case_id}</Link></p>
      <p>{row.reason}</p><small>Registró {row.created_by} · {date(row.created_at)}</small>
      {row.undone_at ? <p>Revirtió {row.undone_by} · {date(row.undone_at)}: {row.undo_reason}</p>
        : canDecide && <button className="btn-secondary" disabled={busy} onClick={() => { setUndoId(row.id); setUndoReason(''); }}>Deshacer consolidación</button>}
    </article>)}
    {undoId && <form onSubmit={e => { e.preventDefault(); void undo(); }} className={styles.decision}>
      <h3>Deshacer la relación entre expedientes</h3><p>Se conservan los avances posteriores del principal. No se restauran versiones antiguas ni se borra el historial.</p>
      <label>Motivo de la reversión<textarea required minLength={10} maxLength={2000} value={undoReason} onChange={e => setUndoReason(e.target.value)} disabled={busy} /></label>
      <div className={styles.actions}><button className="btn-primary" disabled={busy || undoReason.trim().length < 10}>Confirmar reversión</button><button type="button" className="btn-secondary" disabled={busy} onClick={() => setUndoId(null)}>Cancelar</button></div>
    </form>}
    {relatedIds.length > 0 && !history.some(row => !row.undone_at) && <div className={styles.actions}>
      <label>Expediente relacionado<select disabled={busy} value={otherId} onChange={e => { setOtherId(e.target.value); setPreview(null); }}>
        {relatedIds.map(id => <option key={id} value={id}>{id}</option>)}
      </select></label>
      <button className="btn-secondary" disabled={busy || !otherId} onClick={() => void compare()}>{busy ? 'Procesando…' : preview ? 'Actualizar comparación' : 'Comparar expedientes'}</button>
    </div>}
    {preview && <>
      {preview.blockers.map(message => <p key={message} className={styles.warning}>{message}</p>)}
      {preview.source && <div className={styles.source}><h3>Origen compartido en la captura local</h3>
        <p>{preview.source.post_title}</p><blockquote>{preview.source.comment.content || preview.source.comment.message}</blockquote>
        <p>{preview.source.post_message}</p>
        <small>Publicación: {preview.source.post_id} · Comentario: {preview.source.comment_id}</small>
        {preview.source.post_url && <p><a href={preview.source.post_url} target="_blank" rel="noopener noreferrer">Consultar publicación original ↗</a></p>}
      </div>}
      <div className={styles.pair}>{preview.cases.map(row => <article key={row.id} className={styles.case}>
        <h3><Link href={`/cases/${encodeURIComponent(row.id)}`}>{row.id}</Link></h3><p><strong>{row.title}</strong></p><blockquote>{row.content}</blockquote>
        <dl>{['author', 'date_time', 'status', 'assigned_to', 'assigned_department', 'public_response', 'resolution_note', 'institutional_radicado'].map(field => <div key={field}><dt>{fieldLabels[field] || field}</dt><dd>{display(row[field])}</dd></div>)}</dl>
        <details><summary>Ver bitácora completa</summary><pre>{row.internal_notes || 'Sin notas registradas'}</pre></details>
        {preview.attention_case_ids.includes(row.id) && <p className={styles.warning}>Tiene seguimiento registrado. Debe conservarse como principal.</p>}
        {canDecide && <label className={styles.check}><input type="radio" name="principal" value={row.id} checked={primary === row.id} disabled={busy || preview.blockers.length > 0 || preview.attention_case_ids.some(id => id !== row.id)} onChange={() => { setPrimary(row.id); setConfirmed(false); }} />Conservar como principal</label>}
      </article>)}</div>
      <details className={styles.differences}><summary>Comparar campos diferentes ({preview.differences.length})</summary>
        {preview.differences.map(field => <div key={field}><strong>{fieldLabels[field] || field}</strong><div className={styles.pair}>{preview.cases.map(row => <p key={row.id}><small>{row.id}</small><br />{display(row[field])}</p>)}</div></div>)}
      </details>
      {canDecide && !preview.blockers.length && preview.attention_case_ids.length < 2 && <form className={styles.decision} onSubmit={e => { e.preventDefault(); void save(); }}>
        <h3>Confirmar la consolidación</h3><p><strong>Principal: {primary}.</strong> El otro expediente quedará identificado como duplicado y fuera de la bandeja habitual. Su bitácora y comentarios seguirán consultables. Las clasificaciones del principal no se reemplazan.</p>
        <label>Motivo de la decisión<textarea required minLength={10} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} disabled={busy} /></label>
        <label className={styles.check}><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={busy} required />Revisé ambos historiales y confirmo que corresponden a la misma solicitud, no únicamente al mismo comentario.</label>
        <button className="btn-primary" disabled={busy || !confirmed || reason.trim().length < 10}>Guardar consolidación reversible</button>
      </form>}
      {preview.attention_case_ids.length > 1 && <p className={styles.warning}>Ambos tienen seguimiento. Se requiere una revisión adicional antes de consolidarlos.</p>}
      {!canDecide && <p>Administración o Secretaría pueden confirmar la decisión.</p>}
    </>}
  </section>;
}
