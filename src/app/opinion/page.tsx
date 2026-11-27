"use client";
import {useHydrated} from '@/hooks/useHydrated';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, MessageSquare, RefreshCw, Search, Sparkles, Video, X } from 'lucide-react';
import { API, type ConversationOverview, type PublicationContext } from '@/lib/api/client';
import { ConversationBadge } from '@/components/ui/ConversationBadge';
import { CommentAuthor } from '@/components/ui/CommentAuthor';
import { Pagination } from '@/components/ui/Pagination';
import styles from './opinion.module.scss';

const sourceLabels: Record<string, string> = { transcript: 'Transcripción aportada', summary: 'Resumen aportado', post_text: 'Texto de la publicación', missing: 'Falta contexto del video' };
const emptyContext: PublicationContext = { title: '', caption: '', summary: '', transcript: '', ready: false, is_video: false, source: 'missing' };

function analysisStatus(data: ConversationOverview) {
  if (!data.ai_available) return 'La IA no está disponible.';
  if (!data.automatic_analysis) return 'El análisis automático está desactivado.';
  if (data.analysis_status === 'running' || data.analysis_status === 'queued') return 'Análisis automático en curso.';
  if (['failed', 'partial', 'interrupted'].includes(data.analysis_status)) return 'El último lote automático quedó incompleto. Ordenemos a Neiva volverá a intentarlo.';
  return 'Análisis automático activo.';
}

function OpinionContent() {
  const query = useSearchParams();
  const router = useRouter();
  const postId = query.get('post') || '';
  const setPostId = (id: string) => {
    router.push(id ? `/opinion?post=${encodeURIComponent(id)}` : '/opinion', { scroll: false });
  };
  const authReady = useHydrated();
  const [month, setMonth] = useState('all');
  const [stance, setStance] = useState('');
  const [theme, setTheme] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [data, setData] = useState<ConversationOverview | null>(null);
  const [posts, setPosts] = useState<ConversationOverview['posts']>([]);
  const [months, setMonths] = useState<{ key: string; label: string }[]>([]);
  const [context, setContext] = useState<PublicationContext>(emptyContext);
  const [savedContext, setSavedContext] = useState<PublicationContext>(emptyContext);
  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const requestSequence = useRef(0);
  const [topic, narrative] = theme.split('|');
  const contextDirty = Boolean(postId && (context.summary !== savedContext.summary || context.transcript !== savedContext.transcript));
  const hasFilters = Boolean(postId || month !== 'all' || stance || theme || search);
  const selectedPost = posts.find(post => post.id === postId);
  const automatic = data?.automatic_analysis && data.ai_available;
  const automaticRunning = automatic && (data.analysis_status === 'queued' || data.analysis_status === 'running');

  function clearFilters() {
    setPostId(''); setMonth('all'); setStance(''); setTheme(''); setSearch(''); setDebouncedSearch(''); setOffset(0); setNotice('');
  }

  function showComments(filter: string) {
    setStance(filter); setOffset(0);
    document.getElementById('opinion-comments')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start',
    });
  }

  function changePage(page: number) {
    setOffset((page - 1) * pageSize);
    document.getElementById('opinion-comments')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset transient controls when the external route, permission or capture scope changes.
  useEffect(() => { setOffset(0); setTheme(''); }, [postId]);

  // La sesión por defecto se guarda en el efecto del AuthProvider durante el montaje.

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setOffset(0); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!authReady) return;
    const controller = new AbortController();
    API.conversation.getOverview(new URLSearchParams({ month, limit: '1' }), controller.signal)
      .then(result => setPosts(result.posts)).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, [authReady, month, revision]);

  useEffect(() => {
    API.meta.getMonths().then(setMonths).catch(() => setMonths([{ key: 'all', label: 'Todos los meses' }]));
  }, []);

  useEffect(() => {
    if (!automatic || busy) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') setRevision(value => value + 1);
    }, 30_000);
    return () => clearInterval(timer);
  }, [automatic, busy]);

  const params = useCallback(() => {
    const value = new URLSearchParams({ month, offset: String(offset), limit: String(pageSize) });
    if (postId) value.set('post_id', postId);
    if (stance) value.set('stance', stance);
    if (topic) value.set('topic', topic);
    if (narrative) value.set('narrative', narrative);
    if (debouncedSearch) value.set('search', debouncedSearch);
    return value;
  }, [month, offset, pageSize, postId, stance, topic, narrative, debouncedSearch]);

  useEffect(() => {
    if (!authReady) return;
    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- The effect owns this asynchronous request and its loading lifecycle.
    setLoading(true);
    API.conversation.getOverview(params(), controller.signal).then(result => {
      if (sequence === requestSequence.current) {
        const lastOffset = Math.max(0, (Math.ceil(result.total / pageSize) - 1) * pageSize);
        if (offset > lastOffset) { setOffset(lastOffset); return; }
        setData(result); setError('');
      }
    }).catch(e => { if (e.name !== 'AbortError') { setError(e.message); setData(null); } })
      .finally(() => { if (sequence === requestSequence.current) setLoading(false); });
    return () => controller.abort();
  }, [authReady, params, revision, offset, pageSize]);

  useEffect(() => {
    if (!authReady) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset transient controls when the external route, permission or capture scope changes.
    setContext(emptyContext);
    if (!postId) { setContextLoading(false); return; }
    const controller = new AbortController();
    setContextLoading(true);
    API.conversation.getContext(postId, controller.signal).then(value => { setContext(value); setSavedContext(value); })
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setContextLoading(false); });
    return () => controller.abort();
  }, [authReady, postId]);

  async function saveContext() {
    setBusy(true); setError(''); setNotice('');
    try {
      const saved = await API.conversation.saveContext(postId, { summary: context.summary, transcript: context.transcript });
      setContext(saved); setSavedContext(saved);
      setNotice(automatic
        ? 'Contexto guardado. El análisis automático retomará los comentarios pendientes de esta publicación.'
        : 'Contexto guardado. Pulsa Analizar comentarios pendientes para actualizar los resultados.');
      setRevision(r => r + 1);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar el contexto.'); }
    finally { setBusy(false); }
  }

  async function analyze() {
    setBusy(true); setError(''); setNotice('');
    try {
      const scope = new URLSearchParams({ month, limit: '20' });
      if (postId) scope.set('post_id', postId);
      const result = await API.conversation.analyze(scope);
      setNotice(result.detail); setRevision(r => r + 1);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar el análisis.'); }
    finally { setBusy(false); }
  }

  const summary = data?.summary;
  const readyToAnalyze = summary?.pending_with_context ?? 0;
  const waitingForContext = (summary?.pending ?? 0) - readyToAnalyze;
  const hasAnalyses = Boolean(summary?.analyzed);
  const cards = [
    { title: 'Comentarios capturados', value: summary?.captured, detail: 'Comentarios disponibles en Ordenemos a Neiva', filter: '', kind: '' },
    { title: 'A favor de Johan', value: hasAnalyses ? summary?.stances.support ?? 0 : undefined, detail: hasAnalyses ? `${summary?.anger_in_support ?? 0} expresan rabia y respaldan su postura` : 'Pendiente de análisis', filter: 'support', kind: 'support' },
    { title: 'Críticas a Johan', value: hasAnalyses ? summary?.stances.criticism ?? 0 : undefined, detail: hasAnalyses ? 'Cuestionan a Johan o su argumento' : 'Pendiente de análisis', filter: 'criticism', kind: 'criticism' },
    { title: 'Por revisar', value: summary?.review, detail: 'Falta contexto, análisis o hay ambigüedad', filter: 'review', kind: 'review' },
  ];

  return (
    <div className={`page ${styles.page}`}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>CENTRO DE ANÁLISIS DE COMENTARIOS</span><h1>Opinión sobre Johan</h1>
          <p>Todos los comentarios, apoyos, críticas y temas sobre Johan, en un solo lugar.</p><span className={styles.source}>Fuente actual: Facebook</span></div>
        <div className={styles.actions}>
          <button className="btn-secondary" type="button" disabled={busy || loading} onClick={() => setRevision(r => r + 1)}><RefreshCw size={16} /> Actualizar</button>
          <button className="btn-primary" type="button" disabled={busy || loading || contextLoading || contextDirty || !data?.ai_available || !readyToAnalyze || automaticRunning} onClick={analyze}><Sparkles size={18} /> {busy || automaticRunning ? 'Procesando comentarios…' : 'Analizar comentarios pendientes'}</button>
        </div>
      </header>

      {data && <div className={styles.actionHint} role="status">
        <strong>{analysisStatus(data)}</strong>{' '}
        {readyToAnalyze.toLocaleString('es-CO')} listos para analizar · {waitingForContext.toLocaleString('es-CO')} esperan contexto.
        {contextDirty && <p>Guarda el contexto que estás editando antes de analizar.</p>}
      </div>}

      {error && <div className={styles.error} role="alert">{error}</div>}
      {notice && <div className={styles.notice} role="status">{notice}</div>}

      <section className={styles.filters} id="opinion-filters" aria-label="Filtrar opinión sobre Johan">
        <label>Período<select value={month} disabled={busy} onChange={e => { setMonth(e.target.value); setPostId(''); setOffset(0); setTheme(''); }}><option value="all">Todos los meses</option>{months.filter(m => m.key !== 'all').map(m => <option key={m.key} value={m.key}>{m.label}</option>)}</select></label>
        <label>Publicación<select value={postId} disabled={busy} onChange={e => { setPostId(e.target.value); setOffset(0); setTheme(''); setNotice(''); }}><option value="">Todas las publicaciones</option>{posts.map(p => <option key={p.id} value={p.id}>{p.context_ready ? '' : '⚠ '}{p.title}</option>)}</select></label>
        <label>Buscar comentario<div className={styles.search}><Search size={16} /><input value={search} maxLength={200} onChange={e => setSearch(e.target.value)} placeholder="Ej. solo critica, robos, vías…" /></div></label>
      </section>

      <div className={styles.scope}><div><strong>{postId ? 'Viendo una publicación' : 'Viendo todas las publicaciones de Facebook'}</strong>{selectedPost && <p>{selectedPost.title}</p>}</div>
        {hasFilters && <button type="button" className="btn-secondary" disabled={busy} onClick={clearFilters}><X size={16} /> Quitar filtros y ver todo</button>}
      </div>

      <div className={styles.cards} aria-busy={loading}>
        {cards.map(card => <button type="button" key={card.title} className={`${styles.metric} ${card.kind ? styles[card.kind] : ''}`} onClick={() => showComments(card.filter)} aria-pressed={stance === card.filter}>
          <span>{card.title}</span><strong>{loading ? '…' : card.value ?? '—'}</strong><small>{card.detail}</small><span className={styles.metricAction}>Ver comentarios <ArrowRight size={15} /></span>
        </button>)}
      </div>
      <div className={styles.caption}>Los indicadores y temas corresponden al período y la publicación seleccionados. Apoyos y críticas excluyen comentarios pendientes o ambiguos. Se muestran {summary?.captured ?? '—'} capturados de {summary?.reported ?? '—'} reportados por Meta; las cifras pueden diferir por respuestas y disponibilidad.</div>

      <section className={styles.explainer}>
        <MessageSquare size={22} /><div><strong>Rabia por el problema puede ser apoyo a la denuncia.</strong><p>“Sí, es verdad, las ratas de este pueblo solamente roban” puede expresar enojo y darle la razón a Johan cuando denuncia inseguridad. La emoción y la postura se leen por separado.</p></div>
      </section>

      <div className={styles.layout}>
        <aside className={`${styles.panel} ${styles.themesPanel}`}>
          <h2 id="recurring-themes-title">Temas que se repiten</h2><p>Qué respalda o cuestiona la comunidad.</p>
          <button type="button" className={styles.theme} aria-pressed={!theme} onClick={() => { setTheme(''); setOffset(0); }}><span>Todos los temas</span><strong>{summary?.captured ?? 0}</strong></button>
          <div className={styles.themeList} role="region" aria-labelledby="recurring-themes-title" tabIndex={0}>
          {data?.themes.map(t => <button type="button" key={`${t.topic}|${t.narrative}`} className={styles.theme} aria-pressed={theme === `${t.topic}|${t.narrative}`} onClick={() => { setTheme(`${t.topic}|${t.narrative}`); setOffset(0); }}><span>{t.label}<small>{t.topic}</small></span><strong>{t.count}</strong></button>)}
          {!loading && !data?.themes.length && <p className={styles.empty}>Los temas aparecerán al analizar comentarios con contexto suficiente.</p>}
          </div>
          <div className={styles.coverage}><BookOpen size={18} /><strong>{summary?.posts_missing_context ?? 0} publicaciones sin contexto suficiente</strong><p>Selecciona una publicación para aportar lo que dice Johan en el video.</p></div>
        </aside>

        <div className={styles.main}>
          {postId ? <section className={styles.panel} aria-busy={contextLoading}>
            <button type="button" className={styles.backButton} disabled={busy} onClick={() => { setPostId(''); setOffset(0); setTheme(''); }}><ArrowLeft size={17} /> Volver a todas las publicaciones</button>
            <div className={styles.sectionTitle}><h2><Video size={18} /> Contexto de la publicación</h2><span className={styles.tag}>{contextLoading ? 'Cargando…' : sourceLabels[context.source]}</span></div>
            <p>Describe el problema que denuncia Johan, su postura y a quién cuestiona. Para videos, aporta un resumen o la transcripción: Ordenemos a Neiva no reproduce ni escucha el video automáticamente.</p>
            {context.caption && <details className={styles.original}><summary>Ver texto original de la publicación</summary><p>{context.caption}</p></details>}
            <label className={styles.field}>Resumen del contenido<textarea disabled={busy || contextLoading} maxLength={6000} rows={3} value={context.summary} onChange={e => setContext({ ...context, summary: e.target.value })} placeholder="Johan denuncia los robos en Neiva y pide…" /></label>
            <details className={styles.original}><summary>Aportar transcripción del video</summary><label className={styles.field}>Transcripción (hasta 24.000 caracteres)<textarea disabled={busy || contextLoading} rows={6} maxLength={24000} value={context.transcript} onChange={e => setContext({ ...context, transcript: e.target.value })} /></label></details>
            <button className="btn-primary" type="button" disabled={busy || contextLoading || (!context.summary.trim() && !context.transcript.trim())} onClick={saveContext}>{busy ? 'Procesando…' : 'Guardar resumen y contexto'}</button>
            {contextDirty && <p role="status">Guarda los cambios de contexto antes de analizar.</p>}
          </section> : <section className={styles.contextHint}><BookOpen size={20} /><p>Selecciona una publicación para consultar o completar el contexto que utiliza el análisis.</p></section>}

          <section id="opinion-comments" className={`${styles.panel} ${styles.commentSection}`}>
            <div className={styles.sectionTitle}><h2>Comentarios sobre Johan</h2><span aria-live="polite">{data?.total ?? 0} resultados</span></div>
            <div className={styles.tabs} role="group" aria-label="Postura frente a Johan">
              {[['', 'Todos'], ['support', 'A favor'], ['criticism', 'Críticas a Johan'], ['mixed', 'Mixtos'], ['neutral', 'Sin postura'], ['review', 'Por revisar']].map(([value, label]) => <button type="button" key={value} aria-pressed={stance === value} onClick={() => { setStance(value); setOffset(0); }}>{label}</button>)}
            </div>
            <Pagination label="Paginación superior de comentarios" page={Math.floor(offset / pageSize) + 1} pageSize={pageSize} total={data?.total ?? 0} disabled={loading || busy} onPageChange={changePage} onPageSizeChange={size => { setPageSize(size); setOffset(0); }} />
            {loading ? <p className={styles.empty} role="status">Cargando comentarios…</p> : data?.items.length ? <div className={styles.comments}>{data.items.map(comment => <article className={styles.comment} key={`${comment.post_id}:${comment.id}`}>
              <div className={styles.sectionTitle}><CommentAuthor name={comment.author} source="Facebook" /><small>{comment.time}</small></div>
              <Link className={styles.postLink} href={`/opinion?post=${encodeURIComponent(comment.post_id)}`} scroll={false}>Ver publicación: {comment.post_title} <ArrowRight size={14} /></Link>
              {comment.parent && <blockquote>En respuesta a: {comment.parent}</blockquote>}
              <p className={styles.commentText}>{comment.content}</p>
              <ConversationBadge analysis={comment} />
              <div className={styles.tags}><span className={styles.tag}>Se dirige a: {comment.target}</span><span className={styles.tag}>{comment.topic}</span><span className={styles.tag}>{sourceLabels[comment.context_source]}</span></div>
              <p className={styles.reason}>{comment.explanation}{comment.status === 'analyzed' && <> · Confianza del modelo: {Math.round(comment.confidence * 100)}%</>}</p>
              {(comment.permalink_url || comment.post_url) && <a className={styles.external} href={comment.permalink_url || comment.post_url!} target="_blank" rel="noopener noreferrer">Ver en Facebook <ExternalLink size={13} /></a>}
            </article>)}</div> : <div className={styles.empty}><strong>No hay comentarios para esta selección.</strong><p>Prueba otro período, cambia la postura o vuelve a ver todo Facebook.</p><div className={styles.actions}><button type="button" className="btn-secondary" onClick={clearFilters}>Quitar filtros</button><Link className="btn-secondary" href="/cases?view=posts">Ir a publicaciones <ArrowRight size={16} /></Link></div></div>}
            <Pagination label="Paginación inferior de comentarios" page={Math.floor(offset / pageSize) + 1} pageSize={pageSize} total={data?.total ?? 0} disabled={loading || busy} onPageChange={changePage} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default function OpinionPage() {
  return <Suspense fallback={<div className="page" role="status">Cargando opinión sobre Johan…</div>}><OpinionContent /></Suspense>;
}
