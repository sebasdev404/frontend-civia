"use client";
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ExternalLink, Heart, MessageSquare, RefreshCw, Search, ShieldAlert, ThumbsUp } from 'lucide-react';
import { API, type PublicationSource, type PublicationSummary } from '@/lib/api/client';
import { Pagination } from '@/components/ui/Pagination';
import { SyncStatus } from '@/components/publications/SyncStatus';
import { useSyncJob } from '@/components/publications/useSyncJob';
import styles from './publications.module.scss';

function metric(value: number | null | undefined) { return value == null ? '—' : value.toLocaleString('es-CO'); }
function dateLabel(value: string | null) {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }).format(date);
}

function PublicationsContent() {
  const query = useSearchParams();
  const router = useRouter();
  const sourceId = query.get('source') || 'johan';
  const [ready, setReady] = useState(false);
  const [sources, setSources] = useState<PublicationSource[]>([]);
  const [posts, setPosts] = useState<PublicationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [network, setNetwork] = useState('all');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const sync = useSyncJob(sourceId === 'johan' ? 'connected' : `source:${sourceId}`, ready);
  const source = sources.find(item => item.id === sourceId);
  useEffect(() => setReady(true), []);
  useEffect(() => { const timer = setTimeout(() => { setTerm(search); setOffset(0); }, 250); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { setOffset(0); setNetwork('all'); setSearch(''); setPosts([]); setTotal(0); }, [sourceId]);
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    API.publications.sources(controller.signal).then(setSources).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, [ready, sync.completion, revision]);
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    setLoading(true);
    API.publications.list(new URLSearchParams({ source_id: sourceId, search: term, network, limit: String(size), offset: String(offset) }), controller.signal)
      .then(page => { setPosts(page.items); setTotal(page.total); setError(''); })
      .catch(e => { if (e.name !== 'AbortError') { setError(e.message); setPosts([]); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ready, sourceId, term, network, size, offset, sync.completion, revision]);
  useEffect(() => { if (!sync.active) return; const timer = setInterval(() => setRevision(value => value + 1), 6000); return () => clearInterval(timer); }, [sync.active]);

  async function start() {
    setStarting(true); setError('');
    try { sync.track(await API.publications.sync(sourceId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar la actualización.'); }
    finally { setStarting(false); }
  }

  return <div className="page">
    <header className={styles.pageHeader}><div><h1>Publicaciones</h1><p>Consulta publicaciones, comentarios y métricas por fuente, sin entrar a la gestión de casos.</p></div>
      <button type="button" className="btn-primary" disabled={starting || sync.active || !source} onClick={start}><RefreshCw size={16} />{starting ? 'Iniciando…' : sync.active ? 'Actualizando en segundo plano…' : sourceId === 'johan' ? 'Actualizar redes conectadas' : 'Comprobar acceso y actualizar'}</button>
    </header>
    <div className={styles.sources} role="group" aria-label="Fuente de publicaciones">{sources.map(item => <button type="button" key={item.id} aria-pressed={sourceId === item.id} onClick={() => router.push(`/publications?source=${encodeURIComponent(item.id)}`, { scroll: false })}>
      <strong>{item.name}</strong><span>{metric(item.posts_count)} publicaciones capturadas</span><small>{item.status === 'missing_permissions' ? 'Permisos de Meta pendientes' : item.status === 'not_checked' ? 'Acceso por comprobar' : item.status === 'connected' ? 'Redes conectadas a CIVIA' : item.status === 'available' ? 'Lectura autorizada por Meta' : 'Acceso no disponible'}</small>
    </button>)}</div>
    {source && sourceId !== 'johan' && <section className={styles.sourceNotice}><ShieldAlert size={21} /><div><strong>{source.name} · Estado de acceso</strong><p>{source.detail}</p><a href={source.url} target="_blank" rel="noopener noreferrer">Ver perfil aportado en Facebook <ExternalLink size={14} /></a></div></section>}
    <SyncStatus job={sync.job} />
    {(error || sync.error) && <p className={styles.error} role="alert">{error || sync.error}</p>}
    <div className={styles.filters}>
      <label>Red social<select value={network} onChange={e => { setNetwork(e.target.value); setOffset(0); }}><option value="all">Todas las redes disponibles</option><option value="Facebook">Facebook</option>{sourceId === 'johan' && <option value="Instagram">Instagram</option>}</select></label>
      <label>Buscar publicación<div className={styles.search}><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} maxLength={200} placeholder="Buscar por el texto de la publicación…" /></div></label>
      <button className="btn-secondary" type="button" onClick={() => setRevision(value => value + 1)}>Recargar vista</button>
    </div>
    <p className={styles.hint}>Se muestran datos ya guardados. “—” significa que Meta no entregó esa métrica. La sincronización consulta publicaciones recientes y no espera al análisis de IA.</p>
    <Pagination label="Páginas de publicaciones" itemLabel="publicaciones" page={Math.floor(offset / size) + 1} pageSize={size} total={total} disabled={loading} onPageChange={page => { setOffset((page - 1) * size); window.scrollTo({ top: 0, behavior: 'instant' }); }} onPageSizeChange={value => { setSize(value); setOffset(0); }} />
    {loading && !posts.length ? <p className={styles.empty} role="status">Cargando publicaciones guardadas…</p> : posts.length ? <div className={styles.grid}>{posts.map(post => <article className={styles.card} key={post.id}>
      <div className={styles.cover}>{post.thumbnail_url ? <img src={post.thumbnail_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <MessageSquare size={28} />}<span>{post.source} · {post.media_type === 'video' ? 'Video' : 'Publicación'}</span></div>
      <div className={styles.cardBody}><small>{dateLabel(post.published_at)}</small><h2>{post.title}</h2><p className={styles.preview}>{post.message}</p>
        <div className={styles.metrics}><div><ThumbsUp size={15} /><strong>{metric(post.likes_count)}</strong><span>Me gusta</span></div><div><Heart size={15} /><strong>{metric(post.reactions_count)}</strong><span>Reacciones</span></div><div><MessageSquare size={15} /><strong>{metric(post.total_comments)}</strong><span>Comentarios</span></div></div>
        <Link href={`/publications/${sourceId}/${encodeURIComponent(post.id)}`} className="btn-secondary">Ver publicación y comentarios <ArrowRight size={15} /></Link>
      </div>
    </article>)}</div> : <div className={styles.empty}><h2>{sourceId === 'johan' ? 'No hay publicaciones con estos filtros' : 'Todavía no hay capturas de esta fuente'}</h2><p>{sourceId === 'johan' ? 'Cambia la búsqueda o actualiza las redes conectadas.' : 'El perfil está registrado. Para importar sus publicaciones, Meta debe autorizar su lectura; el enlace público por sí solo no concede ese acceso.'}</p></div>}
    <Pagination label="Páginas inferiores de publicaciones" itemLabel="publicaciones" page={Math.floor(offset / size) + 1} pageSize={size} total={total} disabled={loading} onPageChange={page => { setOffset((page - 1) * size); window.scrollTo({ top: 0, behavior: 'instant' }); }} />
  </div>;
}

export default function PublicationsPage() { return <Suspense fallback={<div className="page">Cargando publicaciones…</div>}><PublicationsContent /></Suspense>; }
