'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, FolderPlus, Link2, MessageSquare, RefreshCw, Search } from 'lucide-react';
import { CommentAuthor } from '@/components/ui/CommentAuthor';
import type { ReviewComment } from './TriageReviewModal';
import styles from './CommentReviewQueue.module.scss';

export interface QueueComment extends ReviewComment {
  source: string; postTitle: string; dateTime: string;
  post_url?: string | null; comment_url?: string | null;
  author_picture_url?: string | null; author_is_protected?: boolean;
}

function safeUrl(value?: string | null) {
  try { const url = new URL(value || ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

export default function CommentReviewQueue({ comments, selectedIds, loading, error, onSelect, onReview, onRefresh }: {
  comments: QueueComment[]; selectedIds: string[]; loading: boolean; error: string | null;
  onSelect: (ids: string[]) => void;
  onReview: (ids: string[], mode: 'create' | 'associate') => void;
  onRefresh: () => void;
}) {
  const [query, setQuery] = useState('');
  const [network, setNetwork] = useState('all');
  const [postId, setPostId] = useState('all');
  const [page, setPage] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const selected = new Set(selectedIds);
  const posts = useMemo(() => [...new Map(comments.map(c => [c.post_id, c.postTitle])).entries()], [comments]);
  const filtered = useMemo(() => comments.filter(c => (network === 'all' || c.source === network)
    && (postId === 'all' || c.post_id === postId)
    && (!query.trim() || `${c.content} ${c.author} ${c.postTitle}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')))), [comments, network, postId, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * 10, currentPage * 10 + 10);
  const allVisible = visible.length > 0 && visible.every(c => selected.has(c.id));
  const someVisible = !allVisible && visible.some(c => selected.has(c.id));
  const toggle = (id: string) => onSelect(selected.has(id) ? selectedIds.filter(value => value !== id) : [...selectedIds, id]);
  const selectPage = () => onSelect(allVisible ? selectedIds.filter(id => !visible.some(c => c.id === id)) : [...new Set([...selectedIds, ...visible.map(c => c.id)])]);
  return <section className={styles.queue} aria-labelledby="review-queue-title">
    <header className={styles.intro}>
      <div><span className={styles.eyebrow}>DE COMENTARIO A SOLICITUD</span><h2 id="review-queue-title">¿Qué comentarios necesitan atención?</h2><p>Lee cada comentario y su publicación. Si plantea una solicitud concreta, crea un caso o vincúlalo a uno que ya estés atendiendo.</p></div>
      <button type="button" className="btn-secondary" disabled={loading} onClick={onRefresh}><RefreshCw size={16} />{loading ? 'Actualizando…' : 'Actualizar comentarios'}</button>
    </header>
    <ol className={styles.steps}>
      <li><span>1</span><div><strong>Lee el comentario</strong><p>Comprueba qué pide y revisa su contexto.</p></div></li>
      <li><span>2</span><div><strong>Elige cómo atenderlo</strong><p>Crea un caso o asócialo a uno existente.</p></div></li>
      <li><span>3</span><div><strong>Continúa en el caso</strong><p>Asigna un responsable y registra avances.</p></div></li>
    </ol>
    <div className={styles.explanation}><MessageSquare size={19} aria-hidden="true" /><p><strong>No todo comentario es una solicitud.</strong> Un saludo, agradecimiento u opinión no necesita convertirse en caso. <Link href="/opinion">Consultar opiniones <ArrowRight size={13} /></Link></p><button type="button" aria-expanded={helpOpen} aria-controls="review-help" onClick={() => setHelpOpen(value => !value)}>¿Cuándo crear un caso?</button></div>
    {helpOpen && <div id="review-help" className={styles.help}><p><strong>Crea un caso</strong> cuando identifiques una petición que requiere seguimiento: por ejemplo, reportar una fuga o solicitar reparar una luminaria.</p><p><strong>Vincula a un caso existente</strong> si ya estás atendiendo esa misma solicitud. Para reunir varios comentarios, marca solo los que traten el mismo problema.</p><p>La selección se guarda únicamente cuando confirmas en la siguiente ventana. No se asignan responsables ni se envían mensajes desde esta bandeja.</p></div>}
    <div className={styles.filters}>
      <label className={styles.search}><span>Buscar comentario o autor</span><div><Search size={16} aria-hidden="true" /><input value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Buscar en los comentarios cargados…" /></div></label>
      <label><span>Red social</span><select value={network} onChange={e => { setNetwork(e.target.value); setPage(0); }}><option value="all">Todas las redes</option>{[...new Set(comments.map(c => c.source))].map(source => <option key={source}>{source}</option>)}</select></label>
      <label className={styles.postFilter}><span>Publicación de origen</span><select value={postId} onChange={e => { setPostId(e.target.value); setPage(0); }}><option value="all">Todas las publicaciones cargadas</option>{posts.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>
    </div>
    <div className={styles.listHeader}><label><input type="checkbox" checked={allVisible} ref={element => { if (element) element.indeterminate = someVisible; }} disabled={!visible.length || loading} onChange={selectPage} />Seleccionar esta página</label><span>{filtered.length} de {comments.length} comentarios cargados · {selectedIds.length} seleccionados</span></div>
    {selectedIds.length > 0 && <aside className={styles.selection} aria-label="Acciones sobre comentarios seleccionados"><div><strong>{selectedIds.length} {selectedIds.length === 1 ? 'comentario seleccionado' : 'comentarios seleccionados'}</strong><span>Reúne varios solo si describen la misma solicitud.</span></div><div className={styles.bulkActions}><button type="button" className="btn-ghost" onClick={() => onSelect([])}>Limpiar selección</button><button type="button" className="btn-secondary" onClick={() => onReview(selectedIds, 'associate')}><Link2 size={15} />Vincular a un caso</button><button type="button" className="btn-primary" onClick={() => onReview(selectedIds, 'create')}><FolderPlus size={15} />Crear caso con selección</button></div></aside>}
    {error && <div className={styles.error} role="alert"><strong>No se pudieron actualizar los comentarios.</strong><p>{error}</p><button type="button" className="btn-secondary" disabled={loading} onClick={onRefresh}>Reintentar</button></div>}
    {loading && comments.length === 0 ? <p role="status" className={styles.empty}>Cargando comentarios…</p> : !visible.length && !error ? <div className={styles.empty}><MessageSquare size={28} /><h3>{comments.length ? 'No hay coincidencias con estos filtros' : 'No hay comentarios pendientes en esta consulta'}</h3><p>{comments.length ? 'Prueba otro texto o restablece los filtros.' : 'Actualiza la captura si esperabas nuevos comentarios. La consulta no representa todo el histórico de Meta.'}</p>{comments.length > 0 && <button type="button" className="btn-secondary" onClick={() => { setQuery(''); setNetwork('all'); setPostId('all'); setPage(0); }}>Restablecer filtros</button>}</div> : null}
    <div className={styles.cards} aria-busy={loading}>{visible.map(comment => {
      const origin = safeUrl(comment.post_url);
      return <article key={comment.id} className={`${styles.card} ${selected.has(comment.id) ? styles.selected : ''}`}>
        <header className={styles.cardHeader}><div className={styles.identity}><input type="checkbox" aria-label={`Seleccionar comentario de ${comment.author}`} checked={selected.has(comment.id)} onChange={() => toggle(comment.id)} /><CommentAuthor name={comment.author} source={comment.source} pictureUrl={comment.author_picture_url} protectedProfile={comment.author_is_protected} /></div><div className={styles.meta}><span>{comment.source}</span><span>{comment.dateTime}</span></div></header>
        <div className={styles.origin}><span>En la publicación</span><strong>{comment.postTitle}</strong>{origin && <a href={origin} target="_blank" rel="noopener noreferrer">Ver publicación <ExternalLink size={13} /></a>}</div>
        <blockquote>{comment.content}</blockquote>
        <footer className={styles.cardFooter}><span>Sin caso vinculado</span><div><button type="button" className="btn-secondary" onClick={() => onReview([comment.id], 'associate')}><Link2 size={15} />Vincular a un caso</button><button type="button" className="btn-primary" onClick={() => onReview([comment.id], 'create')}><FolderPlus size={15} />Crear caso</button></div></footer>
      </article>;
    })}</div>
    {filtered.length > 10 && <nav className={styles.pagination} aria-label="Páginas de comentarios cargados"><button type="button" className="btn-secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</button><span>Página {currentPage + 1} de {pages}</span><button type="button" className="btn-secondary" disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Siguiente</button></nav>}
    <p className={styles.scope}>Se consultan hasta 50 comentarios sin caso de las 200 publicaciones capturadas más recientes. Aquí no se presupone que exista un problema ni un análisis de IA confirmado.</p>
  </section>;
}
