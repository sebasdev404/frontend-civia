'use client';
import { useEffect, useState } from 'react';
import { ExternalLink, Newspaper, Plus, RefreshCw, Search, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API, type NewsFeed, type NewsSource } from '@/lib/api/client';
import { Pagination } from '@/components/ui/Pagination';
import { useSyncJob } from './useSyncJob';
import { SyncStatus } from './SyncStatus';
import styles from '@/app/publications/news.module.scss';

const topics = ['Seguridad','Salud','Servicios públicos','Infraestructura','Movilidad','Medio ambiente','Educación','Economía','Cultura y deporte','Gestión pública','General'];
const state = (s: NewsSource) => !s.enabled ? 'Monitoreo pausado' : s.status === 'available' ? 'Lectura autorizada' : s.status === 'missing_permissions' ? 'Permiso de Meta pendiente' : s.status === 'not_checked' ? 'Acceso por comprobar' : 'Acceso no disponible';
function dateLabel(value: string | null) {if (!value) return 'Fecha no disponible';const date = new Date(value);return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-CO', {dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'}).format(date);}

export function NewsMonitor() {
  const {user} = useAuth();
  const [sources,setSources] = useState<NewsSource[]>([]), [data,setData] = useState<NewsFeed|null>(null);
  const [sourceId,setSourceId] = useState(''), [priority,setPriority] = useState(''), [territory,setTerritory] = useState(''), [topic,setTopic] = useState('');
  const [order,setOrder] = useState('relevance');
  const [search,setSearch] = useState(''), [term,setTerm] = useState(''), [offset,setOffset] = useState(0), [size,setSize] = useState(12);
  const [revision,setRevision] = useState(0), [loading,setLoading] = useState(true), [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [adding,setAdding] = useState(false), [name,setName] = useState(''), [url,setUrl] = useState('');
  const sync = useSyncJob('news-monitor', Boolean(user));
  const canManage = user?.role === 'ADMIN' || user?.role === 'SECRETARIO';
  useEffect(() => {const t=setTimeout(() => {setTerm(search);setOffset(0);},300);return () => clearTimeout(t);},[search]);
  useEffect(() => {const c=new AbortController();API.publications.newsSources(c.signal).then(setSources).catch(e=>{if(!c.signal.aborted)setError(e.message);});return()=>c.abort();},[revision,sync.completion]);
  useEffect(() => {
    const c=new AbortController(), p=new URLSearchParams({limit:String(size),offset:String(offset),order});
    for(const [key,value] of Object.entries({source_id:sourceId,priority,territory,topic,search:term}))if(value)p.set(key,value);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- This effect owns the data request and loading lifecycle.
    setLoading(true);
    API.publications.news(p,c.signal).then(value=>{setData(value);setError('');}).catch(e=>{if(!c.signal.aborted)setError(e.message);}).finally(()=>{if(!c.signal.aborted)setLoading(false);});
    return()=>c.abort();
  },[sourceId,priority,territory,topic,term,offset,size,order,revision,sync.completion]);
  async function update(){setBusy(true);setError('');try{sync.track(await API.publications.updateNews());}catch(e){setError(e instanceof Error?e.message:'No se pudo iniciar la consulta.');}finally{setBusy(false);}}
  async function add(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await API.publications.createNewsSource({name,url});setAdding(false);setName('');setUrl('');setRevision(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'No se pudo registrar el medio.');}finally{setBusy(false);}}
  const blocked=sources.filter(s=>s.enabled&&s.status==='missing_permissions');
  return <section>
    <header className={styles.header}><div><span className={styles.eyebrow}>MONITOR DE ACTUALIDAD REGIONAL</span><h1>¿Qué está pasando en Neiva y Huila?</h1><p>Noticias de tus medios, organizadas por tema y prioridad sugerida por GPT‑4o mini.</p></div><div className={styles.actions}><button className="btn-secondary" disabled={loading||busy} onClick={()=>setRevision(v=>v+1)}><RefreshCw size={16}/>Recargar vista</button><button className="btn-primary" disabled={busy||sync.active||!sources.some(s=>s.enabled)} onClick={update}><Sparkles size={17}/>{sync.active?'Consultando y clasificando…':'Actualizar noticias y clasificar'}</button></div></header>
    <div className={styles.metrics}>{[['Medios registrados',sources.length],['Noticias capturadas',data?.summary.captured],['Prioridad alta',data?.summary.high],['Pendientes de IA',data?.summary.pending]].map(([label,value])=><div key={label}><span>{label}</span><strong>{loading&&label!=='Medios registrados'?'…':value??'—'}</strong></div>)}</div>
    <SyncStatus job={sync.job}/>
    {(error||sync.error)&&<p role="alert" className={styles.error}>{error||sync.error}</p>}
    {blocked.length>0&&<div className={styles.accessNotice}><strong>{blocked.length} {blocked.length===1?'medio requiere':'medios requieren'} autorización de Meta</strong><p>Las páginas están registradas, pero el acceso actual no permite leerlas. El administrador debe habilitar el acceso de la aplicación a páginas públicas o disponer de autorización de cada página. Las capturas existentes se conservan.</p></div>}
    <div className={styles.layout}>
      <aside className={styles.sources}><div className={styles.sectionHeading}><h2>Medios y acceso</h2>{canManage&&<button className="btn-secondary" onClick={()=>setAdding(!adding)} aria-expanded={adding}><Plus size={15}/>Agregar</button>}</div>
        {adding&&<form onSubmit={add} className={styles.sourceForm}><label>Nombre del medio<input required minLength={2} maxLength={160} value={name} onChange={e=>setName(e.target.value)}/></label><label>Página de Facebook<input type="url" required maxLength={350} placeholder="https://www.facebook.com/medio" value={url} onChange={e=>setUrl(e.target.value)}/></label><button className="btn-primary" disabled={busy}>Guardar medio</button></form>}
        {!sources.length&&<p>Agrega las páginas de los medios que quieres consultar.</p>}
        {sources.map(s=><article key={s.id} className={styles.source}><h3>{s.name}</h3><span className={styles.sourceStatus} data-blocked={s.status==='missing_permissions'}>{state(s)}</span><p>{s.posts_count.toLocaleString('es-CO')} publicaciones guardadas</p><a href={s.url} target="_blank" rel="noopener noreferrer">Ver página en Facebook <ExternalLink size={13}/></a><details><summary>Detalle del acceso</summary><p>{s.detail}</p>{s.checked_at&&<p>Última consulta: {dateLabel(s.checked_at)}</p>}</details>{canManage&&<button className="btn-secondary" disabled={busy||sync.active} onClick={async()=>{setBusy(true);try{await API.publications.setNewsSource(s.id,!s.enabled);setRevision(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'No se pudo actualizar el medio.');}finally{setBusy(false);}}}>{s.enabled?'Pausar fuente':'Activar fuente'}</button>}</article>)}
      </aside>
      <div className={styles.feed}><div className={styles.filters}>
        <label>Buscar noticia<div className={styles.search}><Search size={16}/><input maxLength={200} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tema, lugar o palabra clave…"/></div></label>
        <label>Medio<select value={sourceId} onChange={e=>{setSourceId(e.target.value);setOffset(0);}}><option value="">Todos los medios</option>{sources.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>Prioridad sugerida<select value={priority} onChange={e=>{setPriority(e.target.value);setOffset(0);}}><option value="">Todas</option>{['Alta','Media','Baja','Fuera de foco','Por revisar'].map(v=><option key={v}>{v}</option>)}</select></label>
        <label>Territorio<select value={territory} onChange={e=>{setTerritory(e.target.value);setOffset(0);}}><option value="">Todos</option>{['Neiva','Huila','Fuera de la región','Sin ubicación confirmada'].map(v=><option key={v}>{v}</option>)}</select></label>
        <label>Tema<select value={topic} onChange={e=>{setTopic(e.target.value);setOffset(0);}}><option value="">Todos</option>{topics.map(v=><option key={v}>{v}</option>)}</select></label>
        <label>Ordenar<select value={order} onChange={e=>{setOrder(e.target.value);setOffset(0);}}><option value="relevance">Más relevantes primero</option><option value="recent">Más recientes primero</option></select></label>
      </div><p className={styles.scope}>La prioridad indica relevancia regional; no mide apoyo o crítica a Johan. La información se atribuye al medio y la IA no verifica los hechos.</p>
        {loading&&!data?<p role="status">Consultando noticias guardadas…</p>:data?.items.length?<div className={styles.stories}>{data.items.map(item=><article key={item.id} className={styles.story} data-priority={item.analysis?.needs_review?'Por revisar':item.analysis?.priority}>
          <div className={styles.storyMeta}><strong>{item.source_name}</strong><time>{dateLabel(item.published_at)}</time></div><h2>{item.title}</h2>
          <div className={styles.tags}><span>{item.analysis?item.analysis.needs_review?'Requiere revisión':item.analysis.priority==='Fuera de foco'?'Fuera de foco':`Prioridad ${item.analysis.priority}`:'Pendiente de IA'}</span>{item.analysis&&<><span>{item.analysis.topic}</span><span>{item.analysis.territory}</span></>}</div>
          <p>{item.analysis?.summary||item.message||'Esta publicación no aporta texto suficiente para resumirla.'}</p>
          {item.analysis&&<div className={styles.reason}><strong>¿Por qué esta prioridad?</strong><p>{item.analysis.reason}</p>{item.analysis.place&&<small>Lugar mencionado: {item.analysis.place}</small>}</div>}
          {item.url&&<a className={styles.original} href={item.url} target="_blank" rel="noopener noreferrer">Leer publicación original <ExternalLink size={14}/></a>}
        </article>)}</div>:!error&&<div className={styles.empty}><Newspaper size={30}/><h2>{blocked.length?'Los medios están registrados; falta habilitar su lectura':'No hay noticias para esta selección'}</h2><p>{blocked.length?'Cuando Meta autorice el acceso, Actualizar noticias y clasificar traerá las publicaciones y GPT‑4o mini las organizará aquí.':'Actualiza los medios activos o cambia los filtros para consultar las noticias guardadas.'}</p></div>}
        <Pagination label="Páginas de noticias" itemLabel="noticias" page={Math.floor(offset/size)+1} pageSize={size} total={data?.total??0} disabled={loading} onPageChange={page=>setOffset((page-1)*size)} onPageSizeChange={v=>{setSize(v);setOffset(0);}}/>
      </div>
    </div>
  </section>;
}
