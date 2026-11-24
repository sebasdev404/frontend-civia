"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { API, type PublicationDetail } from '@/lib/api/client';
import { CommentAuthor } from '@/components/ui/CommentAuthor';
import { Pagination } from '@/components/ui/Pagination';
import { SyncStatus } from '@/components/publications/SyncStatus';
import { useSyncJob } from '@/components/publications/useSyncJob';
import styles from '../../publications.module.scss';

const metric = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString('es-CO');
const reactionLabels: Record<string, string> = { LIKE: 'Me gusta', LOVE: 'Me encanta', CARE: 'Me importa', HAHA: 'Me divierte', WOW: 'Me asombra', SAD: 'Me entristece', ANGRY: 'Me enoja' };

export default function PublicationDetailPage() {
  const params = useParams<{ source: string; id: string }>();
  const sourceId = params.source;
  const postId = params.id;
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<PublicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [tab, setTab] = useState<'comments' | 'reactions'>('comments');
  const [offset, setOffset] = useState(0);
  const [reactionsOffset, setReactionsOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [signalsOnly, setSignalsOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sync = useSyncJob(`post:${sourceId}:${postId}`, ready);
  useEffect(() => setReady(true), []);
  useEffect(() => { setData(null); setOffset(0); setReactionsOffset(0); setSearch(''); setSignalsOnly(false); }, [sourceId, postId]);
  useEffect(() => { const timer = setTimeout(() => { setTerm(search); setOffset(0); }, 250); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    setLoading(true);
    API.publications.detail(sourceId, postId, new URLSearchParams({ offset: String(offset), reactions_offset: String(reactionsOffset), limit: '5', search: term, signals_only: String(signalsOnly) }), controller.signal)
      .then(value => { setData(value); setError(''); })
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ready, sourceId, postId, offset, reactionsOffset, term, signalsOnly, sync.completion]);

  async function refresh() {
    setStarting(true); setError('');
    try { sync.track(await API.publications.refresh(sourceId, postId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar la actualización.'); }
    finally { setStarting(false); }
  }

  async function exportComments() {
    setExporting(true);
    try {
      const blob = await API.publications.exportComments(sourceId, postId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'comentarios-capturados.csv'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo exportar.'); }
    finally { setExporting(false); }
  }

  return <div className="page">
    <Link href={`/publications?source=${encodeURIComponent(sourceId)}`} className={styles.back}><ArrowLeft size={16} />Volver a publicaciones de esta fuente</Link>
    <header className={styles.pageHeader}><div><h1>Detalle de publicación</h1><p>Comentarios, reacciones y señales observables de la captura disponible.</p></div><button type="button" className="btn-primary" disabled={starting || sync.active || !data} onClick={refresh}><RefreshCw size={16} />{sync.active ? 'Actualizando en segundo plano…' : 'Actualizar esta publicación'}</button></header>
    <SyncStatus job={sync.job} />
    {(error || sync.error) && <p className={styles.error} role="alert">{error || sync.error}</p>}
    {!data ? <p className={styles.empty} role="status">{error ? 'La publicación no está disponible.' : 'Cargando captura guardada…'}</p> : <div className={styles.detailGrid}>
      <aside className={styles.panel}><h2>{data.title}</h2><p className={styles.hint}>{data.source} · {data.published_at || 'Fecha no disponible'}</p>
        {data.cover_image && <img className={styles.postImage} src={data.cover_image} alt="Imagen de la publicación original" referrerPolicy="no-referrer" onError={event => { event.currentTarget.style.display = 'none'; }} />}
        <p className={styles.postText}>{data.message}</p>
        <div className={styles.metrics}><div><strong>{metric(data.likes_count)}</strong><span>Me gusta</span></div><div><strong>{metric(data.reactions_count)}</strong><span>Reacciones totales</span></div><div><strong>{metric(data.shares_count)}</strong><span>Compartidos</span></div></div>
        <p className={styles.hint}>{data.metrics_detail}</p>
        <p className={styles.hint}>{data.captured_comments} comentarios capturados · {metric(data.total_comments)} reportados por Meta. Los conteos pueden diferir por respuestas y disponibilidad.</p>
        {data.permalink_url && <a className="btn-secondary" href={data.permalink_url} target="_blank" rel="noopener noreferrer">Ver publicación original <ExternalLink size={15} /></a>}
        {sourceId === 'johan' && data.source === 'Facebook' && <Link className={styles.back} href={`/opinion?post=${encodeURIComponent(postId)}`}>Analizar opinión sobre Johan</Link>}
      </aside>
      <section className={styles.panel}>
        <div className={styles.tabs} role="group" aria-label="Información de la publicación"><button type="button" aria-pressed={tab === 'comments'} onClick={() => setTab('comments')}>Comentarios ({data.captured_comments})</button><button type="button" aria-pressed={tab === 'reactions'} onClick={() => setTab('reactions')}>Identidades disponibles de reacciones ({data.reaction_people_total})</button></div>
        <p className={styles.hint}>{data.identity_note}</p>
        {tab === 'comments' ? <>
          <div className={styles.filters} style={{ gridTemplateColumns: '1fr' }}><label>Buscar comentario o nombre visible<div className={styles.search}><Search size={16} /><input value={search} maxLength={200} onChange={event => setSearch(event.target.value)} placeholder="Buscar dentro de los comentarios capturados…" /></div></label></div>
          <div className={styles.toolbar}><label><input type="checkbox" checked={signalsOnly} onChange={event => { setSignalsOnly(event.target.checked); setOffset(0); }} />Solo comentarios con señales para revisar</label><button type="button" className="btn-secondary" disabled={exporting || !data.captured_comments} onClick={exportComments}><Download size={15} />{exporting ? 'Exportando…' : 'Exportar captura CSV'}</button></div>
          <Pagination label="Páginas de comentarios de la publicación" page={Math.floor(offset / 5) + 1} pageSize={5} total={data.comments_total} disabled={loading} onPageChange={page => setOffset((page - 1) * 5)} />
          {loading ? <p className={styles.empty} role="status">Actualizando vista…</p> : data.comments.length ? data.comments.map(comment => <article className={styles.comment} key={comment.id}>
            <div className={styles.commentHead}><CommentAuthor name={comment.author} pictureUrl={comment.author_picture_url} protectedProfile={comment.author_is_protected} source={data.source} /><small>{comment.time}</small></div>
            {comment.parent_content && <blockquote>En respuesta a: {comment.parent_content}</blockquote>}
            <p>{comment.content}</p><div className={styles.commentMeta}><span>Me gusta del comentario: {metric(comment.likes_count)}</span>{comment.permalink_url && <a href={comment.permalink_url} target="_blank" rel="noopener noreferrer">Ver comentario original <ExternalLink size={12} /></a>}</div>
            <div className={`${styles.signal} ${comment.automation.status === 'review' ? styles.review : ''}`}><strong>{comment.automation.label}</strong>{comment.automation.signals.length > 0 && <ul>{comment.automation.signals.map(signal => <li key={signal}>{signal}</li>)}</ul>}<div>{comment.automation.explanation}</div></div>
          </article>) : <p className={styles.empty}>No hay comentarios para esta selección. Un perfil protegido o un comentario crítico no se consideran evidencia de bot.</p>}
          <Pagination label="Páginas inferiores de comentarios de la publicación" page={Math.floor(offset / 5) + 1} pageSize={5} total={data.comments_total} disabled={loading} onPageChange={page => setOffset((page - 1) * 5)} />
        </> : <>
          <div className={styles.sourceNotice}><div><strong>Disponibilidad de nombres</strong><p>{data.reaction_people_detail}</p><p>No es una lista garantizada de todas las personas que dieron “Me gusta”. Los nombres visibles tampoco verifican identidad ni permiten determinar si alguien es un bot.</p></div></div>
          <Pagination label="Páginas de identidades de reacciones" itemLabel="identidades entregadas" page={Math.floor(reactionsOffset / 5) + 1} pageSize={5} total={data.reaction_people_total} disabled={loading} onPageChange={page => setReactionsOffset((page - 1) * 5)} />
          {data.reaction_people.length ? <table className={styles.people}><thead><tr><th>Nombre visible en Meta</th><th>Reacción</th><th>Identidad</th></tr></thead><tbody>{data.reaction_people.map(person => <tr key={person.id}><td>{person.name || 'Nombre no entregado'}</td><td>{reactionLabels[person.type || ''] || person.type || 'No disponible'}</td><td>Sin verificar</td></tr>)}</tbody></table> : <p className={styles.empty}>No hay identidades disponibles en esta captura. Eso no significa que la publicación no tenga reacciones.</p>}
        </>}
      </section>
    </div>}
  </div>;
}
