'use client';
import { useEffect, useRef, useState } from 'react';
import { API, type ConsolidatedCaseSummary } from '@/lib/api/client';
import styles from '@/app/citizens/citizens.module.scss';

export interface ReviewComment { id: string; post_id: string; comment_id: string; author: string; content: string }

export default function TriageReviewModal({ comments, initialTarget, initialMode = 'create', onClose, onSaved }: {
  comments: ReviewComment[]; initialTarget?: string; initialMode?: 'create' | 'associate'; onClose: () => void;
  onSaved: (result: { case_id: string; created: boolean; linked: number }) => void;
}) {
  const [mode, setMode] = useState<'create' | 'associate'>(initialTarget ? 'associate' : initialMode);
  const [target, setTarget] = useState(initialTarget || '');
  const [title, setTitle] = useState(('Solicitud ciudadana: ' + (comments[0]?.content || '')).slice(0, 255));
  const [search, setSearch] = useState(initialTarget || '');
  const [cases, setCases] = useState<ConsolidatedCaseSummary[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  useEffect(() => {
    if (mode !== 'associate') return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoadingCases(true); setSearchError('');
      API.cases.getPage(new URLSearchParams({ search, limit: '24' }), { signal: controller.signal })
      .then(page => { if (!controller.signal.aborted) setCases(page.items.filter(c => !['Resuelto', 'No requiere gestión'].includes(c.status))); })
      .catch(e => { if (!controller.signal.aborted) setSearchError(e instanceof Error ? e.message : 'No se pudieron buscar casos'); })
      .finally(() => { if (!controller.signal.aborted) setLoadingCases(false); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, mode]);
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const result = await API.triage.consolidate({ comments: comments.map(({ post_id, comment_id }) => ({ post_id, comment_id })),
        ...(mode === 'associate' ? { target_case_id: target } : { title: title.trim() }) });
      onSaved(result);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la selección'); }
    finally { pending.current = false; setBusy(false); }
  };
  return <div className={styles['modal-overlay']} onClick={() => !pending.current && onClose()}><section role="dialog" aria-modal="true" aria-labelledby="triage-review-title" className={styles['modal-card']} onClick={e => e.stopPropagation()}>
    <div className={styles['modal-header']}><h3 id="triage-review-title">{mode === 'create' ? 'Crear un caso' : 'Vincular a un caso existente'}</h3><button type="button" className="btn-ghost" disabled={busy} onClick={onClose}>Cerrar</button></div>
    <div className={`${styles['modal-body']} ${styles['review-body']}`}>
      <p>{comments.length} {comments.length === 1 ? 'comentario seleccionado' : 'comentarios seleccionados'}. Confirma que describen la misma solicitud. El caso nuevo queda pendiente; asigna el responsable después desde su detalle.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        <label><input type="radio" name="triage-action" checked={mode === 'create'} disabled={busy} onChange={() => setMode('create')} /> Crear un caso</label>
        <label><input type="radio" name="triage-action" checked={mode === 'associate'} disabled={busy} onChange={() => setMode('associate')} /> Asociar a un caso existente</label>
      </div>
      {mode === 'create' ? <label>Título del caso<input className="form-input" value={title} maxLength={255} disabled={busy} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} /></label> : <>
        <label>Buscar caso por código, título o ubicación<input className="form-input" value={search} disabled={busy} onChange={e => { setSearch(e.target.value); setTarget(''); }} style={{ width: '100%' }} /></label>
        {loadingCases ? <p role="status">Buscando…</p> : <label>Caso de destino<select className="form-input" value={target} disabled={busy} onChange={e => setTarget(e.target.value)} style={{ width: '100%' }}><option value="">Selecciona un caso abierto</option>{cases.map(c => <option key={c.id} value={c.id}>{c.id} · {c.title}</option>)}</select></label>}
        {searchError && <p role="alert">{searchError}</p>}
      </>}
      <ul style={{ maxHeight: 220, overflowY: 'auto' }}>{comments.map(c => <li key={c.id} style={{ marginBottom: 12 }}><strong>{c.author}</strong><p style={{ whiteSpace: 'pre-wrap' }}>{c.content}</p></li>)}</ul>
      {error && <p role="alert" style={{ color: '#f87171' }}>{error}</p>}
    </div>
    <div className={styles['modal-footer']}><button type="button" className="btn-ghost" disabled={busy} onClick={onClose}>Cancelar</button><button type="button" className="btn-primary" disabled={busy || (mode === 'create' ? title.trim().length < 5 : !target || loadingCases || !!searchError)} onClick={save}>{busy ? 'Guardando…' : mode === 'create' ? 'Crear caso y vincular comentarios' : 'Guardar asociación'}</button></div>
  </section></div>;
}
