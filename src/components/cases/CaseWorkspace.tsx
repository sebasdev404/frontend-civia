'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, ClipboardList, Copy, ExternalLink, FileSearch, History, MessageSquare, ShieldAlert, UserRound, Wrench } from 'lucide-react';
import { API, ApiError, type CaseConflictReview } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import { CaseProvenanceNote } from './CaseProvenanceNote';
import { CaseConsolidationPanel } from './CaseConsolidationPanel';
import { CaseCorrectionPanel } from './CaseCorrectionPanel';
import { CaseReopenPanel } from './CaseReopenPanel';
import { CaseRegistrationPanel, type Registration } from './CaseRegistrationPanel';
import styles from './CaseWorkspace.module.scss';

const DEPARTMENTS = ['Las Ceibas - Empresas Públicas de Neiva E.S.P.', 'Secretaría de Infraestructura y Vías', 'Secretaría de Movilidad y Tránsito', 'Secretaría de Salud Municipal', 'Secretaría de Medio Ambiente y Desarrollo Rural', 'Secretaría de Gobierno y Convivencia Ciudadana', 'Dirección de Gestión del Riesgo', 'Secretaría de Educación'];
type Tab = 'comment' | 'attention' | 'history' | 'audit';
type Task = 'assignment' | 'response' | 'resolution';
interface CaseData {
  id: string; title: string; content: string; author: string; source: string; category: string; priority: string; status: string;
  provenance_status?: string | null; provenance_reason?: string | null; provenance_conflict?: CaseConflictReview | null;
  duplicate_of?: string | null; location?: string; date_time?: string; sentiment?: string; institutional_radicado?: string;
  assigned_department?: string; assigned_to?: string; public_response?: string; internal_notes?: string;
  resolution_note?: string; resolved_by?: string; comment_url?: string; priority_action?: boolean;
  post_data?: { title: string; message?: string; cover_image?: string; permalink_url?: string };
  linked_comments?: { post_id: string; comment_id: string; original_case_id?: string; comment: { author?: string; content?: string; message?: string; permalink_url?: string } }[];
  workflow_revision: string;
  registrations?: Registration[];
  workflow_events?: { id: string; event_type: string; actor_id: string; actor_name: string; created_at: string; note: string; evidence_reference?: string | null;
    before_state?: { status?: string; resolution_note?: string | null; resolved_by?: string | null; assigned_to?: string | null; assigned_department?: string | null; public_response?: string | null } }[];
}

export function CaseWorkspace({ id, backHref = '/cases?view=cases' }: { id: string; backHref?: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<Tab>('comment');
  const [auditVisited, setAuditVisited] = useState(false);
  const [task, setTask] = useState<Task>('assignment');
  const [choice, setChoice] = useState<'attention' | 'general' | ''>('');
  const [confirmGeneral, setConfirmGeneral] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [department, setDepartment] = useState('');
  const [assignee, setAssignee] = useState('');
  const [instruction, setInstruction] = useState('');
  const [response, setResponse] = useState('');
  const [resolution, setResolution] = useState('');
  const [evidence, setEvidence] = useState('');
  const [generalReason, setGeneralReason] = useState('');
  const [note, setNote] = useState('');
  const tabsRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    API.cases.getById(id).then((item: CaseData) => {
      if (!active) return;
      setData(item); setDepartment(item.assigned_department || ''); setAssignee(item.assigned_to || '');
      setResponse(item.public_response || ''); setResolution(item.resolution_note || '');
    }).catch((e: Error) => { if (active) setError(e.message || 'No se pudo cargar el caso.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  function navigate(next: Tab, nextTask?: Task) {
    setTab(next); setConfirmGeneral(false);
    if (next === 'audit') setAuditVisited(true);
    if (nextTask) setTask(nextTask);
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      contentRef.current?.focus({ preventScroll: true });
    });
  }
  async function refresh() {
    const updated: CaseData = await API.cases.getById(id);
    setData(updated); setDepartment(updated.assigned_department || ''); setAssignee(updated.assigned_to || '');
    if ((data?.status === 'Resuelto' || data?.status === 'No requiere gestión') && (updated.status === 'Pendiente' || updated.status === 'En Gestión')) {
      setResponse(updated.public_response || ''); setResolution(updated.resolution_note || ''); setEvidence(''); setInstruction('');
      setReviewed(false); setConfirmed(false); setChoice(''); setConfirmGeneral(false); setGeneralReason(''); setTask('assignment'); setTab('comment');
    }
    if (updated.duplicate_of) setTab('comment');
  }
  async function save(action: () => Promise<unknown>, message: string) {
    if (busy) return false;
    setBusy(true); setError(''); setNotice('');
    try {
      await action();
      setNotice(message);
      try { await refresh(); }
      catch { setError('El cambio se guardó, pero no se pudo recargar el expediente. Actualiza para consultar su estado.'); }
      return true;
    }
    catch (e) { setError(e instanceof ApiError ? e.message : 'No se pudo confirmar el resultado. Actualiza el expediente antes de volver a guardar.'); return false; }
    finally { setBusy(false); }
  }
  function tabKeys(event: KeyboardEvent<HTMLElement>) {
    const buttons = Array.from(tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') || []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault(); buttons[next]?.focus(); buttons[next]?.click();
  }

  if (loading) return <div className={styles.workspace} role="status"><div className={styles.loading}><MessageSquare size={24} /><p>Cargando comentario y expediente…</p></div></div>;
  if (!data) return <div className={styles.workspace}><Link href="/cases?view=cases">← Volver a la bandeja</Link><p role="alert">{error || 'Caso no disponible.'}</p><button className="btn-secondary" onClick={() => window.location.reload()}>Reintentar</button></div>;

  const readOnly = Boolean(data.duplicate_of);
  const noRequest = data.status === 'No requiere gestión';
  const resolved = data.status === 'Resuelto';
  const closed = resolved || noRequest || readOnly;
  const assigned = Boolean(data.assigned_department && data.assigned_to);
  const canClose = user?.role === 'ADMIN' || user?.role === 'SECRETARIO';
  const canWrite = canClose || user?.role === 'OPERADOR';
  const hasTest = Boolean(data.internal_notes?.toLowerCase().includes('despacho de prueba'));
  const needsAudit = hasTest || data.provenance_status === 'needs_review' || readOnly;
  const sourceLink = data.comment_url || data.post_data?.permalink_url;
  const history = (data.internal_notes || '').split('\n').filter(line => line.trim() && !['[CIVIA ', '[Ordenemos a Neiva '].some(marker => line.includes(marker)) && !/^\[(Post ID|Comment ID|Publicación de Origen|Enlace en Facebook|Canal)\]:/.test(line)).reverse();
  const eventLabels: Record<string, string> = { registration_recorded: 'Radicado externo registrado', registration_cancelled: 'Referencia externa retirada', created: 'Expediente creado', created_from_comments: 'Caso creado desde comentarios', comments_linked: 'Comentarios vinculados', assigned: 'Responsable asignado', note_added: 'Avance registrado', response_drafted: 'Borrador guardado', resolved: 'Solución documentada', no_request: 'Conversación sin solicitud', reopened: 'Caso reabierto para revisión', priority_changed: 'Prioridad especial revisada', classified: 'Clasificación revisada' };
  const tabs: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
    { id: 'comment', label: 'Comentario', icon: MessageSquare },
    ...(!readOnly && !noRequest ? [{ id: 'attention' as Tab, label: 'Atención', icon: ClipboardList }] : []),
    { id: 'history', label: 'Historial', icon: History },
    { id: 'audit', label: 'Datos y origen', icon: FileSearch },
  ];

  return <div className={styles.workspace}>
    <div className={styles.casebar}>
      <Link href={backHref} className={styles.back}><ArrowLeft size={17} /> Bandeja de casos</Link>
      <span className={styles.casecode}>{data.id}<button title="Copiar identificador" aria-label="Copiar identificador del caso" onClick={async () => { try { await navigator.clipboard.writeText(data.id); setNotice('Identificador copiado.'); } catch { setError('No se pudo copiar el identificador.'); } }}><Copy size={14} /></button></span>
    </div>
    <header className={styles.hero}>
      <div><p className={styles.eyebrow}>GESTIÓN CIUDADANA <span> / {data.source}</span></p>
        <h1>{readOnly ? 'Expediente vinculado' : noRequest ? 'Comentario sin solicitud' : resolved ? 'Caso resuelto' : assigned ? 'Atender caso' : 'Revisar comentario'}</h1>
        <p className={styles.subtitle}>{readOnly ? 'La evidencia se conserva aquí. El seguimiento continúa en el caso principal.' : noRequest ? 'El comentario y la decisión permanecen en el historial.' : resolved ? 'Consulta el resultado y las actuaciones registradas.' : assigned ? 'Consulta el mensaje, registra avances y prepara la respuesta.' : 'Lee el mensaje y decide si necesita atención o es conversación general.'}</p>
      </div>
      <div className={styles.heroTools}><span className={`${styles.status} ${resolved || noRequest ? styles.finished : ''}`}><span />{readOnly ? 'Duplicado conservado' : data.status}</span>
        {!closed && <button className={styles.mobileDecision} onClick={() => {
          if (hasTest) navigate('audit');
          else { const node = document.getElementById('case-decision'); node?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); node?.focus({ preventScroll: true }); }
        }}>{hasTest ? 'Revisar asignación' : assigned ? 'Ver siguiente acción' : 'Tomar decisión'}<ArrowRight size={15} /></button>}
      </div>
    </header>
    {error && <div className={styles.error} role="alert">{error}<button className={styles.retry} onClick={() => void refresh().then(() => { setError(''); setNotice('Expediente actualizado. Revisa los datos antes de volver a guardar.'); }).catch(() => setError('No se pudo actualizar el expediente.'))}>Actualizar expediente</button><button aria-label="Cerrar mensaje de error" onClick={() => setError('')}>×</button></div>}
    {notice && <div className={styles.notice} role="status"><CheckCircle2 size={17} />{notice}<button aria-label="Cerrar confirmación" onClick={() => setNotice('')}>×</button></div>}

    <div className={styles.layout}>
      <div className={styles.main}>
        <nav ref={tabsRef} role="tablist" aria-label="Contenido del expediente" className={styles.tabs} onKeyDown={tabKeys}>
          {tabs.map(item => <button key={item.id} id={`tab-${item.id}`} role="tab" type="button" aria-selected={tab === item.id} aria-controls="case-content" tabIndex={tab === item.id ? 0 : -1} onClick={() => { setTab(item.id); setConfirmGeneral(false); if (item.id === 'audit') setAuditVisited(true); }}><item.icon size={16} />{item.label}{item.id === 'audit' && needsAudit && <span className={styles.attentionDot} aria-label="Hay datos por revisar" />}</button>)}
        </nav>
        <section id="case-content" ref={contentRef} role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={-1} className={`${styles.content} ${tab === 'comment' ? styles.evidence : ''}`}>
          {tab === 'comment' && <>
            <article className={styles.message}>
              <div className={styles.author}><div className={styles.avatar}><UserRound size={22} /></div><div><strong>{data.author || 'Autor no disponible'}</strong><p>{data.source}<span>·</span>{data.date_time || 'Fecha no disponible'}</p></div><span className={styles.originLabel}>COMENTARIO ORIGINAL</span></div>
              <blockquote>{data.content || 'No hay texto capturado para este registro.'}</blockquote>
              <div className={styles.messageFooter}>{sourceLink ? <a href={sourceLink} target="_blank" rel="noopener noreferrer">Abrir en {data.source.includes('Instagram') ? 'Instagram' : 'la red social'} <ExternalLink size={14} /></a> : <span>Enlace de origen no disponible</span>}<span>Autor tal como aparece en la captura</span></div>
            </article>
            <details className={styles.source}>
              <summary><span className={styles.sourceIcon}><MessageSquare size={18} /></span><span><small>PUBLICACIÓN DE ORIGEN</small><strong>{data.post_data?.title || 'Contexto no disponible en la captura'}</strong></span><ChevronDown size={18} /></summary>
              <div className={styles.sourceBody}>{data.post_data?.cover_image && <img src={data.post_data.cover_image} alt="Imagen de la publicación de origen" loading="lazy" decoding="async" />}
                <div><p className={styles.pre}>{data.post_data?.message || 'No hay una publicación vinculada disponible para comprobar el contexto completo.'}</p>{data.post_data?.permalink_url && <a href={data.post_data.permalink_url} target="_blank" rel="noopener noreferrer">Ver publicación original <ExternalLink size={14} /></a>}</div>
              </div>
            </details>
            {needsAudit && <div className={styles.contextAlert}><ShieldAlert size={18} /><div><strong>{hasTest ? 'Hay un despacho de prueba en la bitácora' : readOnly ? `Este expediente está vinculado a ${data.duplicate_of}` : 'El origen de este registro necesita revisión'}</strong><p>{hasTest ? 'Comprueba esa asignación antes de continuar la atención.' : 'Consulta la evidencia disponible y las relaciones con otros expedientes.'}</p></div><button onClick={() => navigate('audit')}>Revisar <ArrowRight size={15} /></button></div>}
            {!!data.linked_comments?.length && <details className={styles.related}><summary>Otros comentarios y vínculos conservados ({data.linked_comments.length})<ChevronDown size={17} /></summary>{data.linked_comments.map(link => <article key={`${link.post_id}:${link.comment_id}`}><strong>{link.comment.author || 'Autor no disponible'}</strong><p>{link.comment.content || link.comment.message}</p>{link.original_case_id && link.original_case_id !== data.id && <Link href={`/cases/${encodeURIComponent(link.original_case_id)}`}>Conservado en {link.original_case_id}</Link>}{link.comment.permalink_url && <a href={link.comment.permalink_url} target="_blank" rel="noopener noreferrer">Abrir comentario <ExternalLink size={13} /></a>}</article>)}</details>}
            {resolved && <div className={styles.outcome}><CheckCircle2 size={20} /><div><h2>Resultado registrado</h2><p className={styles.pre}>{data.resolution_note || 'No hay una nota de solución disponible.'}</p><small>Responsable del cierre: {data.resolved_by || 'No registrado'}</small></div></div>}
          </>}

          {tab === 'attention' && !readOnly && !noRequest && <div className={styles.editor}>
            <div className={styles.sectionHeading}><p className={styles.eyebrow}>ATENCIÓN DEL CASO</p><h2>{task === 'assignment' ? '¿Quién lo va a atender?' : task === 'response' ? 'Preparar una respuesta' : 'Documentar el resultado'}</h2></div>
            <div className={styles.taskNav} aria-label="Acciones de atención">{([['assignment', 'Asignación'], ['response', 'Respuesta'], ['resolution', 'Solución y cierre']] as const).map(([key, label]) => <button type="button" key={key} aria-pressed={task === key} onClick={() => setTask(key)}>{label}</button>)}</div>
            {task === 'assignment' && <form onSubmit={e => { e.preventDefault(); void save(() => API.cases.dispatch(data.id, { assigned_department: department, assigned_to: assignee.trim(), note: instruction.trim(), confirmed_review: reviewed, expected_revision: data.workflow_revision }), 'Responsable y próxima actuación guardados.'); }}>
              <p className={styles.hint}>La asignación se registra en Ordenemos a Neiva. No envía oficios ni notificaciones externas.</p><fieldset disabled={busy || closed || !canClose}>
                <label>Entidad o equipo<select required value={department} onChange={e => setDepartment(e.target.value)}><option value="">Selecciona el equipo responsable</option>{[...new Set([...DEPARTMENTS, ...(data.assigned_department ? [data.assigned_department] : [])])].map(value => <option key={value}>{value}</option>)}</select></label>
                <label>Persona responsable<input required value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="Nombre del responsable" autoComplete="off" /></label>
                <label>Próxima actuación<textarea required minLength={10} maxLength={10000} value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="Qué se hará y qué información hace falta" rows={4} /></label>
                <label className={styles.check}><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} required />Revisé el comentario y corresponde dar atención.</label>
                <div className={styles.formFooter}><button className="btn-primary">{busy ? 'Guardando…' : 'Guardar asignación'}<ArrowRight size={16} /></button><button type="button" className="btn-ghost" onClick={() => navigate('comment')}>Volver al comentario</button></div>
              </fieldset>
            </form>}
            {task === 'response' && <form onSubmit={e => { e.preventDefault(); void save(() => API.cases.savePublicResponse(data.id, response.trim(), data.workflow_revision), 'Borrador guardado. No se publicó en redes.'); }}>
              <p className={styles.hint}>Este es un borrador interno. Guardar o copiar no publica mensajes en redes.</p>
              <fieldset disabled={busy || closed || !canWrite}><label>Respuesta al ciudadano<textarea required rows={8} value={response} onChange={e => setResponse(e.target.value)} placeholder="Escribe una respuesta basada en las actuaciones que sí se hayan realizado." /></label>
                <button className={styles.textButton} type="button" onClick={() => { setResponse('Hola, gracias por compartir tu comentario. Recibimos tu mensaje y revisaremos la información para determinar el siguiente paso. Si hace falta, por favor amplía los detalles del lugar y de la situación.'); }}>Usar texto inicial editable</button>
                <div className={styles.formFooter}><button className="btn-primary">Guardar borrador</button><button type="button" className="btn-secondary" disabled={!response.trim()} onClick={async () => { try { await navigator.clipboard.writeText(response); setNotice('Respuesta copiada.'); } catch { setError('No se pudo copiar la respuesta.'); } }}><Copy size={15} />Copiar</button></div>
              </fieldset>
            </form>}
            {task === 'resolution' && <>
              {resolved ? <div className={styles.outcome}><CheckCircle2 size={22} /><div><p className={styles.pre}>{data.resolution_note || 'Sin nota de solución registrada.'}</p><small>Registró {data.resolved_by || 'Responsable no disponible'}</small>{data.workflow_events?.find(event => event.event_type === 'resolved')?.evidence_reference && <p>Soporte registrado: {data.workflow_events.find(event => event.event_type === 'resolved')?.evidence_reference}</p>}</div></div> : <form onSubmit={e => { e.preventDefault(); void save(() => API.cases.resolve(data.id, { resolution_note: resolution.trim(), evidence_reference: evidence.trim(), confirmed_resolution: confirmed, expected_revision: data.workflow_revision }), 'Solución documentada y caso cerrado.'); }}>
                <p className={styles.hint}>Describe lo realizado e incluye una referencia del soporte: visita, enlace o confirmación del ciudadano.</p>
                {!assigned && <p className={styles.inlineWarning}>Asigna un equipo y una persona antes de cerrar.</p>}
                <fieldset disabled={busy || !assigned || !canClose}><label>Resultado de la atención<textarea required minLength={20} maxLength={10000} rows={5} value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Qué se hizo y cuál fue el resultado" /></label>
                  <label>Referencia del soporte<input required minLength={5} maxLength={2000} value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="Enlace, acta, documento o referencia de la verificación" /></label>
                  <p className={styles.hint}>Registra una referencia real. Ordenemos a Neiva conserva lo declarado y quién lo confirmó; no verifica automáticamente el documento.</p>
                  <label className={styles.check}><input required type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Verifiqué la solución y su soporte.</label><button className="btn-primary">Guardar solución y cerrar</button>
                </fieldset>{!canClose && <p className={styles.hint}>El cierre corresponde a Administración o Secretaría.</p>}
              </form>}
            </>}
          </div>}

          {tab === 'history' && <div className={styles.editor}>
            <div className={styles.sectionHeading}><p className={styles.eyebrow}>SEGUIMIENTO</p><h2>Lo que se ha registrado</h2></div>
            {!closed && canWrite && <form className={styles.noteForm} onSubmit={async e => { e.preventDefault(); if (await save(() => API.cases.addNote(data.id, { note: note.trim(), expected_revision: data.workflow_revision }), 'Avance añadido al historial.')) setNote(''); }}>
              <label>Registrar un avance<textarea required rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Actuación realizada, resultado y próximo paso" disabled={busy} /></label><button className="btn-primary" disabled={busy || !note.trim()}>Guardar avance</button>
            </form>}
            {Boolean(data.workflow_events?.length) && <ol className={styles.timeline}>{data.workflow_events?.map(event => <li key={event.id}>
              <span className={styles.timelineDot} /><strong>{eventLabels[event.event_type] || 'Actuación registrada'}</strong><p>{event.note}</p>
              {event.evidence_reference && <p>Soporte: {event.evidence_reference}</p>}
              {event.event_type === 'reopened' && event.before_state && <details className={styles.rawNotes}>
                <summary>Decisión anterior conservada</summary>
                <p>Estado anterior: {event.before_state.status || 'No registrado'}</p>
                {event.before_state.resolution_note && <p>Resultado anterior: {event.before_state.resolution_note}</p>}
                {event.before_state.resolved_by && <p>Registró el cierre: {event.before_state.resolved_by}</p>}
                {event.before_state.assigned_to && <p>Responsable anterior: {event.before_state.assigned_to}</p>}
                {event.before_state.assigned_department && <p>Equipo anterior: {event.before_state.assigned_department}</p>}
                {event.before_state.public_response && <p>Borrador anterior: {event.before_state.public_response}</p>}
              </details>}
              <small>{event.actor_name} · {new Date(event.created_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</small>
            </li>)}</ol>}
            {history.length > 0 && <details className={styles.rawNotes}><summary>Bitácora histórica</summary><p>Estas entradas conservan el texto anterior; no se les atribuyeron actores ni soportes nuevos.</p><ol className={styles.timeline}>{history.map((line, index) => <li key={`${index}:${line}`}><span className={styles.timelineDot} /><p>{line}</p></li>)}</ol></details>}
            {!history.length && !data.workflow_events?.length && <div className={styles.empty}><History size={25} /><h3>Aún no hay actuaciones registradas</h3><p>Los avances que guardes aparecerán aquí.</p></div>}
            <details className={styles.rawNotes}><summary>Ver bitácora original y referencias técnicas</summary><pre>{data.internal_notes || 'Sin notas registradas.'}</pre></details>
          </div>}

          {auditVisited && <div hidden={tab !== 'audit'} className={styles.audit}>
            <div className={styles.sectionHeading}><p className={styles.eyebrow}>DATOS Y ORIGEN</p><h2>Comprobar el registro</h2><p>Aquí puedes revisar el origen, los datos históricos y las relaciones con otros expedientes.</p></div>
            <CaseProvenanceNote status={data.provenance_status} reason={data.provenance_reason} conflict={data.provenance_conflict} duplicateOf={data.duplicate_of} />
            {hasTest && <CaseCorrectionPanel key={`correction-${data.id}`} caseId={data.id} onChanged={refresh} />}
            <CaseConsolidationPanel key={data.id} caseId={data.id} relatedIds={data.provenance_conflict?.related_case_ids || []} onChanged={refresh} />
            <div className={styles.recordDetails}><h3>Datos registrados, sujetos a revisión</h3><dl>{[['Título original', data.title], ['Categoría', data.category], ['Emoción clasificada', data.sentiment], ['Lugar registrado', data.location]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'No registrado'}</dd></div>)}</dl><p>Las clasificaciones históricas no sustituyen la revisión del comentario.</p></div>
            <CaseRegistrationPanel id={data.id} revision={data.workflow_revision} records={data.registrations||[]} legacy={data.institutional_radicado} editable={canClose&&!readOnly} busy={busy} save={save}/>
            <details className={styles.rawNotes}><summary>Consultar bitácora completa</summary><pre>{data.internal_notes || 'Sin notas registradas.'}</pre></details>
          </div>}
        </section>
      </div>

      <aside className={styles.rail} aria-label="Decisión y seguimiento">
        <section id="case-decision" tabIndex={-1} className={styles.decision}>
          <p className={styles.eyebrow}>{closed ? 'ESTADO DEL EXPEDIENTE' : assigned ? 'SIGUIENTE ACCIÓN' : 'TU DECISIÓN'}</p>
          {readOnly ? <><h2>Atender desde el principal</h2><p>Este registro se conserva como duplicado.</p><Link className="btn-primary" href={`/cases/${encodeURIComponent(data.duplicate_of!)}`}>Abrir {data.duplicate_of}<ArrowRight size={16} /></Link><button className={styles.textButton} onClick={() => navigate('audit')}>Consultar o deshacer la relación</button></>
          : noRequest ? <><span className={styles.outcomeIcon}><Check size={22} /></span><h2>Sin solicitud de atención</h2><p>El comentario permanece disponible. No se registra como un problema resuelto.</p><button className="btn-secondary" onClick={() => navigate('history')}>Ver historial</button></>
          : resolved ? <><span className={styles.outcomeIcon}><CheckCircle2 size={23} /></span><h2>Atención finalizada</h2><p>Consulta la solución y las actuaciones que quedaron documentadas.</p><button className="btn-secondary" onClick={() => navigate('history')}>Ver actuaciones</button></>
          : hasTest ? <><span className={styles.testIcon}><Wrench size={23} /></span><h2>Revisar despacho de prueba</h2><p>Hay una asignación de prueba registrada. Comprueba su efecto antes de continuar.</p><button className="btn-primary" onClick={() => navigate('audit')}>Revisar y corregir<ArrowRight size={16} /></button></>
          : assigned ? <><h2>Continuar el seguimiento</h2><p>Registra lo realizado y el próximo paso del caso.</p><button className="btn-primary" onClick={() => navigate('history')}>Registrar avance<ArrowRight size={16} /></button><button className="btn-secondary" onClick={() => navigate('attention', 'response')}>Preparar respuesta</button><button className={styles.textButton} onClick={() => navigate('attention', 'resolution')}>Documentar solución y cierre</button></>
          : <><h2>¿Necesita atención?</h2><p>Decide a partir del comentario y su contexto.</p><div className={styles.choices}>
              {!canClose && <p role="status">La decisión y la asignación requieren Administración o Secretaría.</p>}
              <label className={choice === 'attention' ? styles.chosen : ''}><input type="radio" name="review-decision" value="attention" checked={choice === 'attention'} onChange={() => { setChoice('attention'); setConfirmGeneral(false); }} /><span><strong>Sí, requiere atención</strong><small>Asignar un responsable y dar seguimiento.</small></span></label>
              <label className={choice === 'general' ? styles.chosen : ''}><input type="radio" name="review-decision" value="general" checked={choice === 'general'} onChange={() => { setChoice('general'); setConfirmGeneral(false); }} /><span><strong>Es conversación general</strong><small>Opinión, saludo o agradecimiento sin solicitud.</small></span></label>
            </div>
            {confirmGeneral ? <div className={styles.confirmDecision}><strong>Conservar sin abrir atención</strong><p>Quedará como «No requiere gestión». Se conservarán el comentario y su historial.</p><label>Motivo de la decisión<textarea minLength={20} maxLength={10000} value={generalReason} onChange={e => setGeneralReason(e.target.value)} rows={3} placeholder="Explica por qué el comentario no contiene una solicitud de atención." /></label><button className="btn-primary" disabled={busy || !canClose || generalReason.trim().length < 20} onClick={async () => { if (await save(() => API.cases.markNoRequest(data.id, { reason: generalReason.trim(), confirmed_review: true, expected_revision: data.workflow_revision }), 'Comentario conservado como conversación sin solicitud de atención.')) setConfirmGeneral(false); }}>Confirmar: sin solicitud</button><button className="btn-ghost" disabled={busy} onClick={() => setConfirmGeneral(false)}>Volver a revisar</button></div>
            : <button className="btn-primary" disabled={!choice || busy || !canClose} onClick={() => { if (choice === 'general') setConfirmGeneral(true); else { setReviewed(true); navigate('attention', 'assignment'); } }}>{choice === 'attention' ? 'Asignar responsable' : choice === 'general' ? 'Revisar decisión' : 'Selecciona una opción'}<ArrowRight size={16} /></button>}
          </>}
        </section>

        {(resolved || noRequest) && !readOnly && (canClose ? <CaseReopenPanel busy={busy} onReopen={async (reason, confirmedReopening) => {
          const saved = await save(() => API.cases.reopen(data.id, { reason, confirmed_reopening: confirmedReopening, expected_revision: data.workflow_revision }), 'Caso reabierto y pendiente de revisión. La decisión anterior se conserva en el historial.');
          if (saved) navigate('comment');
          return saved;
        }} /> : <p className={styles.railNote}>La reapertura requiere Administración o Secretaría.</p>)}
        <section className={styles.caseInfo}><h2>Seguimiento actual</h2><dl><div><dt>Responsable</dt><dd><UserRound size={15} />{data.assigned_to || 'Sin asignar'}</dd></div>{data.assigned_department && <div><dt>Entidad o equipo registrado</dt><dd>{data.assigned_department}</dd></div>}<div><dt>Prioridad registrada</dt><dd><span className={`${styles.priorityDot} ${data.priority === 'Alta' ? styles.high : ''}`} />{data.priority}</dd></div><div><dt>Respuesta</dt><dd>{data.public_response ? 'Borrador guardado' : 'Sin borrador'}</dd></div></dl>
          <details className={styles.moreActions}><summary>Más acciones<ChevronDown size={15} /></summary><button onClick={() => navigate('audit')}>Revisar datos y origen</button>{!closed && (user?.role === 'ADMIN' || user?.role === 'ALCALDE') && <button disabled={busy} onClick={() => void save(() => API.cases.togglePriority(data.id, !data.priority_action, data.workflow_revision), 'Prioridad especial actualizada.')}>{data.priority_action ? 'Retirar prioridad especial' : 'Marcar prioridad especial'}</button>}</details>
        </section>
        <p className={styles.railNote}>Los cambios se guardan en Ordenemos a Neiva. Publicar respuestas o notificar a una entidad requiere una acción externa.</p>
      </aside>
    </div>
  </div>;
}
