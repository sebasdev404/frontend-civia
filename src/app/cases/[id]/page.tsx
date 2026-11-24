'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, CheckCircle2, Copy } from 'lucide-react';
import { CaseProvenanceNote } from '@/components/cases/CaseProvenanceNote';
import { API } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import styles from './workspace.module.scss';

const DEPARTMENTS = ['Las Ceibas - Empresas Públicas de Neiva E.S.P.', 'Secretaría de Infraestructura y Vías', 'Secretaría de Movilidad y Tránsito', 'Secretaría de Salud Municipal', 'Secretaría de Medio Ambiente y Desarrollo Rural', 'Secretaría de Gobierno y Convivencia Ciudadana', 'Dirección de Gestión del Riesgo', 'Secretaría de Educación'];
interface CaseData {
  provenance_status?: string | null; provenance_reason?: string | null;
  id: string; title: string; content: string; author: string; source: string; category: string; priority: string; status: string;
  location?: string; date_time?: string; sentiment?: string; institutional_radicado?: string;
  assigned_department?: string; assigned_to?: string; public_response?: string; internal_notes?: string;
  resolution_note?: string; resolved_by?: string; comment_url?: string; priority_action?: boolean;
  post_data?: { title: string; message?: string; cover_image?: string; permalink_url?: string };
  linked_comments?: { post_id: string; comment_id: string; linked_by: string; linked_at?: string; comment: { author?: string; content?: string; message?: string; permalink_url?: string } }[];
}
export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('evidence');
  const [department, setDepartment] = useState('');
  const [assignee, setAssignee] = useState('');
  const [instruction, setInstruction] = useState('');
  const [response, setResponse] = useState('');
  const [note, setNote] = useState('');
  const [resolution, setResolution] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    let active = true; setLoading(true); setData(null); setError(''); setReviewed(false); setConfirmed(false);
    API.cases.getById(id).then((item: CaseData) => {
      if (!active) return;
      setData(item); setDepartment(item.assigned_department || ''); setAssignee(item.assigned_to || '');
      setResponse(item.public_response || ''); setResolution(item.resolution_note || '');
    }).catch((e: Error) => { if (active) setError(e.message || 'No se pudo cargar el caso.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  async function save(action: () => Promise<unknown>, message: string) {
    if (busy) return false;
    setBusy(true); setError(''); setNotice('');
    try { await action(); setData(await API.cases.getById(id)); setNotice(message); return true; }
    catch (e) { setError(e instanceof Error ? e.message : 'El cambio no pudo guardarse.'); return false; }
    finally { setBusy(false); }
  }
  if (loading) return <div className="page" role="status">Cargando expediente…</div>;
  if (!data) return <div className="page"><Link href="/cases">← Volver a casos</Link><p role="alert">{error || 'Caso no disponible.'}</p><button className="btn-secondary" onClick={() => window.location.reload()}>Reintentar</button></div>;
  const noRequest = data.status === 'No requiere gestión';
  const closed = data.status === 'Resuelto' || noRequest;
  const assigned = Boolean(data.assigned_department && data.assigned_to);
  const canClose = user?.role === 'ADMIN' || user?.role === 'SECRETARIO';
  const step = closed ? 3 : data.status === 'En Gestión' ? 2 : reviewed ? 1 : 0;
  const sourceLink = data.comment_url || data.post_data?.permalink_url;
  return <div className={styles.workspace}>
    <Link className={styles.back} href="/cases?view=cases"><ArrowLeft size={16} /> Volver a gestión de casos</Link>
    <header className={styles.hero}><div><p className={styles.eyebrow}>EXPEDIENTE · {data.id}</p><h1>{data.title}</h1><div className={styles.tags}><span className="badge-blue">{data.status}</span><span className="badge-tag">{data.category}</span><span className={data.priority === 'Alta' ? 'badge-alta' : 'badge-tag'}>Prioridad {data.priority}</span></div></div><div className={styles.record}><span>Radicado institucional registrado</span><strong>{data.institutional_radicado || 'No registrado'}</strong><small>El ID de CIVIA no acredita una radicación externa. Valida los radicados históricos.</small></div></header>
    <ol className={styles.steps} aria-label="Etapas de atención">{['Revisar evidencia', 'Asignar responsable', 'Dar seguimiento', 'Resolver'].map((label, i) => <li key={label} aria-current={i === step ? 'step' : undefined}><span>{i < step || closed ? <CheckCircle2 size={17} /> : i + 1}</span>{label}</li>)}</ol>
    <CaseProvenanceNote status={data.provenance_status} reason={data.provenance_reason} />
    <div className={styles.next}><div><strong>{noRequest ? 'Comentario sin solicitud de atención' : closed ? 'Atención finalizada' : 'Siguiente paso'}</strong><p>{noRequest ? 'Se conserva el origen y el historial; no se despacha como problema ciudadano.' : closed ? 'Consulta la solución registrada y su historial.' : assigned ? 'Registra avances y documenta la solución antes de cerrar.' : 'Verifica que el comentario requiere atención y define quién lo atenderá.'}</p></div>{!closed && <button className="btn-secondary" onClick={() => setTab(assigned || reviewed ? 'management' : 'evidence')}>Continuar atención</button>}</div>
    {error && <p className={styles.error} role="alert">{error}</p>}{notice && <p className={styles.notice} role="status">{notice}</p>}
    <div className={styles.layout}><main className={styles.main}>
      <nav className={styles.tabs} aria-label="Secciones del caso">{[['evidence', 'Evidencia y contexto'], ['management', 'Gestión y respuesta'], ['history', 'Historial']].map(([key, label]) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>{label}</button>)}</nav>
      {tab === 'evidence' && <>
        <section className={styles.panel}><h2>Comentario de origen</h2><p className={styles.muted}>{data.author || 'Autor no identificado'} · {data.source} · {data.date_time || 'Fecha no disponible'}</p><blockquote>{data.content || 'Sin texto capturado.'}</blockquote>{sourceLink ? <a href={sourceLink} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> Consultar origen en la red social</a> : <p className={styles.warning}>Falta el enlace de origen. Verifica la trazabilidad antes de actuar.</p>}<p className={styles.muted}>Revisa la clasificación: un saludo, una opinión o una emoción no demuestran una solicitud de atención.</p></section>
        <section className={styles.panel}><h2>Contexto de la publicación</h2>{data.post_data ? <><h3>{data.post_data.title}</h3><p className={styles.pre}>{data.post_data.message}</p>{data.post_data.cover_image && <img className={styles.cover} src={data.post_data.cover_image} alt="Publicación de origen" />}</> : <p className={styles.warning}>No hay publicación vinculada disponible. No podemos validar el contexto completo.</p>}</section>
        {!!data.linked_comments?.length && <section className={styles.panel}><h2>Comentarios vinculados ({data.linked_comments.length})</h2>{data.linked_comments.map(link => <article key={`${link.post_id}:${link.comment_id}`}><p><strong>{link.comment.author || 'Autor no disponible'}</strong></p><blockquote>{link.comment.content || link.comment.message}</blockquote><p className={styles.muted}>Publicación: {link.post_id} · Comentario: {link.comment_id}</p>{link.comment.permalink_url && <a href={link.comment.permalink_url} target="_blank" rel="noopener noreferrer">Consultar comentario original</a>}</article>)}</section>}
        {!closed && <section className={styles.panel}><h2>Revisión de la solicitud</h2><p>Verifica el autor, el contexto y los datos del lugar antes de asignar el caso.</p><label className={styles.check}><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} /> Revisé la evidencia y corresponde dar atención.</label><button className="btn-primary" disabled={!reviewed} onClick={() => setTab('management')}>Continuar con la asignación</button><hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid var(--border)' }} /><p>Si únicamente es un saludo, agradecimiento u opinión, puedes retirarlo del flujo de atención conservando su registro.</p><button className="btn-secondary" disabled={busy} onClick={() => void save(() => API.cases.markNoRequest(id), 'Comentario registrado como sin solicitud. Se conserva la trazabilidad.')}>Marcar como comentario sin solicitud</button></section>}
      </>}
      {tab === 'management' && <>
        <section className={styles.panel}><h2>1. Asignar y definir el próximo paso</h2><p>La asignación se registra en CIVIA. No envía oficios ni notifica a la entidad externa.</p><form onSubmit={e => { e.preventDefault(); void save(() => API.cases.dispatch(id, { assigned_department: department, assigned_to: assignee.trim(), note: instruction.trim() }), 'Asignación guardada en CIVIA.'); }}><fieldset disabled={busy || closed}><label>Entidad o equipo<select required value={department} onChange={e => setDepartment(e.target.value)}><option value="">Selecciona un responsable</option>{[...new Set([...DEPARTMENTS, ...(data.assigned_department ? [data.assigned_department] : [])])].map(d => <option key={d}>{d}</option>)}</select></label><label>Persona responsable<input required value={assignee} onChange={e => setAssignee(e.target.value)} /></label><label>Próxima actuación<textarea required value={instruction} onChange={e => setInstruction(e.target.value)} /></label><label className={styles.check}><input type="checkbox" required checked={reviewed} onChange={e => setReviewed(e.target.checked)} /> Evidencia revisada.</label><button className="btn-primary">{busy ? 'Guardando…' : 'Guardar asignación'}</button></fieldset></form></section>
        <section className={styles.panel}><h2>2. Preparar respuesta al ciudadano</h2><p>Es un borrador interno. Guardar o copiar no publica mensajes en redes.</p><button className="btn-secondary" disabled={busy || closed} onClick={() => { setResponse(`Hola, gracias por compartir tu comentario. Hemos recibido tu mensaje sobre ${data.category}. ${data.status === 'En Gestión' ? 'El caso se encuentra en gestión en CIVIA.' : 'Revisaremos la información para determinar el siguiente paso.'} Si hace falta, por favor amplía los detalles del lugar y la situación.`); setNotice('Plantilla editable preparada. Revisa su contenido antes de usarla.'); }}>Usar plantilla de respuesta</button><form onSubmit={e => { e.preventDefault(); void save(() => API.cases.savePublicResponse(id, response.trim()), 'Borrador guardado. No se publicó en redes.'); }}><fieldset disabled={busy || closed}><label>Respuesta editable<textarea required rows={5} value={response} onChange={e => setResponse(e.target.value)} /></label><div className={styles.actions}><button className="btn-primary">Guardar borrador</button><button type="button" className="btn-secondary" disabled={!response.trim()} onClick={async () => { try { await navigator.clipboard.writeText(response); setNotice('Respuesta copiada.'); } catch { setError('No se pudo copiar la respuesta.'); } }}><Copy size={15} /> Copiar</button></div></fieldset></form></section>
        <section className={styles.panel}><h2>3. Documentar solución y cerrar</h2>{closed ? <><p className={styles.pre}>{data.resolution_note}</p><p className={styles.muted}>Registrado por {data.resolved_by || 'Responsable no registrado'}</p></> : <><p>Describe qué se hizo y la referencia del soporte: visita, enlace o confirmación del ciudadano. CIVIA guarda el texto; no verifica el soporte automáticamente.</p>{!assigned && <p className={styles.warning}>Completa primero la asignación.</p>}<form onSubmit={e => { e.preventDefault(); void save(() => API.cases.resolve(id, { resolution_note: resolution.trim(), resolved_by: user?.full_name || 'Responsable CIVIA' }), 'Solución guardada y caso cerrado.'); }}><fieldset disabled={busy || !assigned || !canClose}><label>Resultado y referencia de evidencia<textarea required minLength={20} value={resolution} onChange={e => setResolution(e.target.value)} rows={4} /></label><label className={styles.check}><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> Verifiqué la solución y su soporte.</label><button className="btn-primary">Guardar solución y cerrar</button></fieldset></form>{!canClose && <p className={styles.muted}>El cierre corresponde a Administración o Secretaría.</p>}</>}</section>
      </>}
      {tab === 'history' && <section className={styles.panel}><h2>Bitácora de seguimiento</h2><form onSubmit={async e => { e.preventDefault(); if (await save(() => API.cases.addNote(id, { note: note.trim(), author_name: user?.full_name || 'Operador CIVIA' }), 'Nota registrada.')) setNote(''); }}><fieldset disabled={busy}><label>Registrar avance<textarea required value={note} onChange={e => setNote(e.target.value)} placeholder="Actuación, resultado y próximo paso" /></label><button className="btn-primary">Guardar nota</button></fieldset></form><ul className={styles.history}>{(data.internal_notes || '').split('\n').filter(Boolean).reverse().map((line, i) => <li key={i}>{line}</li>)}</ul>{!data.internal_notes && <p className={styles.muted}>Todavía no hay notas registradas.</p>}</section>}
    </main><aside className={styles.summary}><section className={styles.panel}><h2>Resumen de atención</h2><dl><dt>Responsable</dt><dd>{data.assigned_to || 'Sin asignar'}</dd><dt>Entidad / equipo</dt><dd>{data.assigned_department || 'Sin asignar'}</dd><dt>Lugar registrado, por verificar</dt><dd>{data.location || 'No especificado'}</dd><dt>Emoción clasificada, por revisar</dt><dd>{data.sentiment || 'Sin clasificar'}</dd><dt>Respuesta</dt><dd>{data.public_response ? 'Borrador guardado' : 'Sin borrador'}</dd></dl>{(user?.role === 'ALCALDE' || user?.role === 'ADMIN') && <button className="btn-secondary" disabled={busy} onClick={() => void save(() => API.cases.togglePriority(id, !data.priority_action), 'Prioridad actualizada en CIVIA.')}>{data.priority_action ? 'Retirar prioridad especial' : 'Marcar prioridad especial'}</button>}</section></aside></div>
  </div>;
}
