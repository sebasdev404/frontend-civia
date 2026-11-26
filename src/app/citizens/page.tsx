"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './citizens.module.scss';
import { 
  Search, PhoneCall, X, Send, CheckCircle2, MessageSquare, 
  Mail, MapPin, AlertCircle, Info, ShieldCheck, UserCheck, AlertTriangle,
  Upload, FileSpreadsheet, Bot, Sparkles, Copy, ExternalLink, RefreshCw, 
  Filter, Users, UserX, Phone, ChevronRight, Check, Trash2
} from 'lucide-react';
import CitizenImportModal from '@/components/citizens/CitizenImportModal';
import CitizenSourceModal from '@/components/citizens/CitizenSourceModal';
import CitizenDeleteModal, { type CitizenDeleteTarget } from '@/components/citizens/CitizenDeleteModal';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api/client';
import { getEmotionConfig } from '@/lib/emotions';

function getCitizenSocialLink(name?: string, handle?: string, channel?: string) {
  if (!['Facebook', 'Instagram'].includes(channel || '')) return null;
  const cleanName = (name || '').trim();
  const rawHandle = (handle || '').replace(/[@\s]/g, '').trim();
  const isInstagram = (channel || '').toLowerCase().includes('instagram') || rawHandle.startsWith('ig_') || rawHandle.includes('insta');

  if (isInstagram) {
    const isSynthetic = /bot|troll|user\d+/i.test(rawHandle);
    const searchUrl = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(cleanName || rawHandle)}`;
    const normalizedHandle = rawHandle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._]/g, '');
    const directUrl = (!isSynthetic && normalizedHandle.length > 2 && !normalizedHandle.includes('pagina') && !normalizedHandle.includes('cuenta')) 
      ? `https://www.instagram.com/${normalizedHandle}/` 
      : null;

    return {
      channel: 'Instagram',
      url: directUrl || searchUrl,
      label: directUrl ? 'Ver Perfil IG' : 'Buscar en Instagram',
      shortLabel: 'Perfil IG',
      tooltip: `Buscar o ver perfil oficial de ${cleanName || 'ciudadano'} en Instagram`,
      color: '#E1306C',
      bg: 'rgba(225, 48, 108, 0.12)',
      border: 'rgba(225, 48, 108, 0.28)'
    };
  }

  // Para Facebook:
  const searchUrl = "https://www.facebook.com/search/top?q=" + encodeURIComponent(cleanName || rawHandle);

  return {
    channel: 'Facebook',
    url: searchUrl,
    label: 'Buscar en FB',
    shortLabel: 'Buscar FB',
    tooltip: "Buscar publicaciones y perfil de " + (cleanName || 'ciudadano') + " en Facebook",
    color: '#1877F2',
    bg: 'rgba(24, 119, 242, 0.12)',
    border: 'rgba(24, 119, 242, 0.28)'
  };
}

interface CitizenItem {
  id: string;
  name: string;
  handle: string;
  neighborhood: string | null;
  zone?: string | null;
  has_source_data?: boolean;
  total_reports: number;
  phone?: string | null;
  followers_count: number;
  following_count: number;
  account_created_at: string | null;
  user_type: 'Positivo' | 'Negativo' | 'Bot' | 'Sin clasificar';
  bot_probability: number;
  bot_origin?: string;
  channel: string;
  sentiment_tendency: string;
  notes?: string;
  origen_dato?: string;
  whatsapp_link?: string | null;
  whatsapp_username?: string | null;
}

interface CitizenHistoryComment { case_id:string; author:string; comment_text:string; title:string; sentiment:string; category:string; location:string; date_time:string; status:string; public_response?:string; workflow_revision:string; ai_suggestion?:{suggested_reply?:string;tone?:string;talking_points:string[]}|null; post:{cover_image:string|null;source:string;published_at:string|null;title:string;permalink_url:string|null} }
interface CitizenHistory {citizen:CitizenItem;total_comments:number;comments:CitizenHistoryComment[];relationship_status:string;relationship_note:string}
export default function CitizensPage() {
  const { user } = useAuth();
  const canDelete = user?.role === 'ADMIN' || user?.role === 'ALCALDE';
  const canWriteDraft = user?.role === 'ADMIN' || user?.role === 'SECRETARIO' || user?.role === 'OPERADOR';
  const [citizens, setCitizens] = useState<CitizenItem[]>([]);
  const [selectedCitizens, setSelectedCitizens] = useState<Map<string, CitizenDeleteTarget>>(new Map());
  const [deleteTargets, setDeleteTargets] = useState<CitizenDeleteTarget[] | null>(null);
  const [deleteNotice, setDeleteNotice] = useState('');
  const listRequest = useRef(0);
  const listAbort = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total_registered: 0,
    total_unclassified: 0,
    total_with_phone: 0,
    total_bots_detected: 0,
    total_positives: 0,
    total_negatives: 0,
    bot_percentage: 0
  });

  // Filtros
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'Positivo' | 'Negativo' | 'Bot' | 'Sin clasificar'>('all');
  const [followersFilter, setFollowersFilter] = useState<'all' | 'under_50' | '50_500' | 'over_500'>('all');
  const [accountAgeFilter, setAccountAgeFilter] = useState<'all' | 'recent' | 'older'>('all');

  // Modales
  const [sourceCitizenId, setSourceCitizenId] = useState<string | null>(null);
  const [listError, setListError] = useState('');
  const [totalMatched, setTotalMatched] = useState(0);
  const [offset, setOffset] = useState(0);
  const pageSize = 50;
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [smartReplyModalOpen, setSmartReplyModalOpen] = useState(false);
  const [activeCitizenForReply, setActiveCitizenForReply] = useState<CitizenItem | null>(null);

  // Modal 3: Expediente de Comentarios y Posts
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedCitizenHistory, setSelectedCitizenHistory] = useState<CitizenHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [savingReplyId, setSavingReplyId] = useState<string | null>(null);
  const [savedReplySuccess, setSavedReplySuccess] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState('');
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);

  const handleOpenCitizenHistory = async (citizen: CitizenItem) => {
    setCommentsModalOpen(true);
    setLoadingHistory(true);
    setSelectedCitizenHistory(null);
    setHistoryError('');
    setSavedReplySuccess(null);
    try {
      const data = await API.citizens.getComments(citizen.id);
      setSelectedCitizenHistory(data);
      const drafts: Record<string, string> = {};
      data.comments?.forEach((c: { case_id: string; public_response?: string; ai_suggestion?: { suggested_reply?: string } }) => {
        drafts[c.case_id] = c.public_response || c.ai_suggestion?.suggested_reply || '';
      });
      setReplyDrafts(drafts);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : 'No se pudo cargar el historial.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveCitizenReply = async (caseId: string) => {
    if (!selectedCitizenHistory?.citizen?.id) return;
    setSavingReplyId(caseId);
    setHistoryError('');
    setSavedReplySuccess(null);
    try {
      const current = selectedCitizenHistory.comments?.find((item: { case_id: string }) => item.case_id === caseId);
      const saved = await API.citizens.saveReply(selectedCitizenHistory.citizen.id, {
        case_id: caseId, reply_text: replyDrafts[caseId] || '', expected_revision: current?.workflow_revision || '',
      });
      setSelectedCitizenHistory((previous) => {
        if (!previous || previous.citizen.id !== selectedCitizenHistory.citizen.id) return previous;
        return { ...previous, comments: previous.comments.map((item) => item.case_id === caseId ? { ...item, workflow_revision: saved.workflow_revision, public_response: saved.public_response } : item) };
      });
      setSavedReplySuccess(caseId);
      setTimeout(() => setSavedReplySuccess(null), 3000);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : 'No se pudo guardar el borrador.');
    } finally {
      setSavingReplyId(null);
    }
  };

  const handleCopyReplyText = (caseId: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedCommentId(caseId);
    setTimeout(() => setCopiedCommentId(null), 2000);
  };

  // Estado del Smart Responder
  const [replyPrompt, setReplyPrompt] = useState('Por mi crítica salvé el PAE');
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [replyTopic, setReplyTopic] = useState<string | null>(null);
  const [replyError, setReplyError] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Cargar datos del Backend
  const fetchCitizens = useCallback(async (signal?: AbortSignal) => {
    const request = ++listRequest.current;
    listAbort.current?.abort();
    const controller = new AbortController();
    listAbort.current = controller;
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    setLoading(true);
    setListError('');
    try {
      const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset), user_type: userTypeFilter, followers_filter: followersFilter, account_age_filter: accountAgeFilter, search: search.trim() });
      const data = await API.citizens.getAll(params, controller.signal);
      if (controller.signal.aborted || request !== listRequest.current) return;
      setCitizens(data.items || []);
      setTotalMatched(data.total);
      if (data.metrics) setMetrics(data.metrics);
    } catch (e) {
      if (controller.signal.aborted || request !== listRequest.current) return;
      setCitizens([]);
      setTotalMatched(0);
      setListError(e instanceof Error ? e.message : 'No se pudo cargar Ciudadanos');
    } finally {
      signal?.removeEventListener('abort', abort);
      if (!controller.signal.aborted && request === listRequest.current) setLoading(false);
    }
  }, [offset, userTypeFilter, followersFilter, accountAgeFilter, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset transient controls when the external route, permission or capture scope changes.
  useEffect(() => { setOffset(0); setSelectedCitizens(new Map()); }, [userTypeFilter, followersFilter, accountAgeFilter, search]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset transient controls when the external route, permission or capture scope changes.
  useEffect(() => { if (!canDelete) { setSelectedCitizens(new Map()); setDeleteTargets(null); } }, [canDelete]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => fetchCitizens(controller.signal), 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [fetchCitizens]);

  const filteredCitizens = citizens;
  const pageSelected = citizens.length > 0 && citizens.every(citizen => selectedCitizens.has(citizen.id));
  const pagePartiallySelected = !pageSelected && citizens.some(citizen => selectedCitizens.has(citizen.id));
  const toggleCitizen = (citizen: CitizenItem) => {
    setDeleteNotice('');
    setSelectedCitizens(current => {
      const next = new Map(current);
      if (next.has(citizen.id)) next.delete(citizen.id);
      else if (next.size < 500) next.set(citizen.id, { id: citizen.id, name: citizen.name });
      return next;
    });
  };
  const togglePage = () => {
    setDeleteNotice('');
    setSelectedCitizens(current => {
      const next = new Map(current);
      citizens.forEach(citizen => {
        if (pageSelected) next.delete(citizen.id);
        else if (next.size < 500) next.set(citizen.id, { id: citizen.id, name: citizen.name });
      });
      return next;
    });
  };
  const closeDelete = useCallback(() => setDeleteTargets(null), []);
  const handleDeletedCitizens = (ids: string[]) => {
    ++listRequest.current;
    listAbort.current?.abort();
    const removed = new Set(ids);
    setCitizens(current => current.filter(citizen => !removed.has(citizen.id)));
    setSelectedCitizens(current => new Map([...current].filter(([id]) => !removed.has(id))));
    setDeleteTargets(null);
    if (sourceCitizenId && removed.has(sourceCitizenId)) setSourceCitizenId(null);
    const remaining = Math.max(0, totalMatched - ids.length);
    setTotalMatched(remaining);
    setDeleteNotice(ids.length === 1 ? 'Ciudadano eliminado correctamente.' : `${ids.length} ciudadanos eliminados correctamente.`);
    const nextOffset = Math.min(offset, Math.max(0, Math.ceil(remaining / pageSize) - 1) * pageSize);
    if (nextOffset !== offset) { setLoading(true); setOffset(nextOffset); }
    else fetchCitizens();
  };

  const handleGenerateReply = async (promptText: string, citizen?: CitizenItem | null) => {
    setIsGeneratingReply(true);
    setCopiedSuccess(false);
    const targetType = citizen ? citizen.user_type : 'Negativo';

    try {
      setReplyError('');
      setGeneratedReply(null);
      const data = await API.ai.generateReply({
        comment_text: promptText, user_type: targetType,
        author_metadata: citizen ? { author: citizen.name, handle: citizen.handle, followers: citizen.followers_count, following: citizen.following_count } : {},
      });
      setGeneratedReply(data.response_text);
      setReplyTopic(data.topic);
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : 'No se pudo preparar el borrador.');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleOpenSmartReplyForCitizen = (citizen: CitizenItem) => {
    setActiveCitizenForReply(citizen);
    setSmartReplyModalOpen(true);
    const defaultText = citizen.notes || (citizen.user_type === 'Bot' ? 'la misma mierda no hacen nada corruptos' : 'Por mi crítica salvé el PAE');
    setReplyPrompt(defaultText);
    handleGenerateReply(defaultText, citizen);
  };

  const handleCopyReply = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Ciudadanos y contactos</h1>
          <p>Consulta los contactos registrados, importa tu base de datos y revisa la información de origen.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={() => {
              setActiveCitizenForReply(null);
              setSmartReplyModalOpen(true);
              setReplyPrompt('Por mi crítica salvé el PAE');
              handleGenerateReply('Por mi crítica salvé el PAE', null);
            }}
            className={styles['assistant-button']}
          >
            <Sparkles size={16} />
            <span>Asistente de Respuestas IA</span>
          </button>

          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => setUploadModalOpen(true)}
            style={{ padding: '8px 16px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Upload size={15} />
            <span>📤 Subir Base de Datos (CSV / Excel)</span>
          </button>
        </div>
      </div>

      {/* METRICAS SUPERIORES DE AUDITORIA */}
      <div className={styles['stats-grid']}>
        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>
            <Users size={16} style={{ color: 'var(--blue-600)' }} />
            <span>Total Ciudadanos Registrados</span>
          </div>
          <div className={styles['stat-value']}>{metrics.total_registered}</div>
          <div className={styles['stat-sub']}>Perfiles únicos en Facebook, Instagram y Bases</div>
        </div>

        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>
            <Phone size={16} style={{ color: 'var(--emerald-600)' }} />
            <span>Contactos con teléfono</span>
          </div>
          <div className={styles['stat-value']} style={{ color: 'var(--emerald-600)' }}>
            {metrics.total_with_phone}
          </div>
          <div className={styles['stat-sub']}>Números aportados en la base de datos</div>
        </div>

        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>
            <Bot size={16} style={{ color: '#ef4444' }} />
            <span>Clasificaciones históricas por revisar</span>
          </div>
          <div className={styles['stat-value']} style={{ color: '#ef4444' }}>
            {metrics.total_bots_detected}
          </div>
          <div className={styles['stat-sub']}>Indicadores previos; no confirman bots ni identidad</div>
        </div>

        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>
            <UserCheck size={16} style={{ color: 'var(--blue-600)' }} />
            <span>Balance Aliados vs Críticos</span>
          </div>
          <div className={styles['stat-value']} style={{ fontSize: '1.45rem' }}>
            🟢 {metrics.total_positives} / 🔴 {metrics.total_negatives}
          </div>
          <div className={styles['stat-sub']}>Segmentados para facilitar vocería y respuesta</div>
        </div>
      </div>

      {/* TOOLBAR: PESTAÑAS DE CLASIFICACION Y FILTROS */}
      <div className={styles.toolbar}>
        <div className={styles['toolbar-header']}>
          <div className={styles['type-tabs']}>
            <button
              type="button"
              className={[styles['type-tab-btn'], userTypeFilter === 'all' ? styles.active : ''].join(' ')}
              onClick={() => setUserTypeFilter('all')}
            >
              <span>Todos ({metrics.total_registered})</span>
            </button>
            <button type="button" className={[styles['type-tab-btn'], userTypeFilter === 'Sin clasificar' ? styles.active : ''].join(' ')} onClick={() => setUserTypeFilter('Sin clasificar')}><span>Sin clasificar ({metrics.total_unclassified})</span></button>

            <button
              type="button"
              className={[styles['type-tab-btn'], userTypeFilter === 'Positivo' ? styles['active-pos'] : ''].join(' ')}
              onClick={() => setUserTypeFilter('Positivo')}
            >
              <span>🟢 Ciudadanos Positivos ({metrics.total_positives})</span>
            </button>
            <button
              type="button"
              className={[styles['type-tab-btn'], userTypeFilter === 'Negativo' ? styles.active : ''].join(' ')}
              onClick={() => setUserTypeFilter('Negativo')}
            >
              <span>🔴 Críticos / Quejas Reales ({metrics.total_negatives})</span>
            </button>
            <button
              type="button"
              className={[styles['type-tab-btn'], userTypeFilter === 'Bot' ? styles['active-bot'] : ''].join(' ')}
              onClick={() => setUserTypeFilter('Bot')}
            >
              <Bot size={14} />
              <span>Señales históricas por revisar ({metrics.total_bots_detected})</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => fetchCitizens()}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
            title="Recargar datos"
          >
            <RefreshCw size={14} />
            <span>Actualizar</span>
          </button>
        </div>

        <div className={styles['filter-controls-row']}>
          {/* Búsqueda */}
          <div className={styles['search-wrap']}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, teléfono (+57), barrio, @usuario o notas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro de Seguidores */}
          <select 
            className={styles['filter-select']}
            value={followersFilter}
            onChange={(e) => setFollowersFilter(e.target.value as typeof followersFilter)}
            title="Filtrar por número de seguidores del perfil"
          >
            <option value="all">Seguidores: Todos</option>
            <option value="under_50">🚨 &lt; 50 Seguidores (Sospecha Bot)</option>
            <option value="50_500">50 a 500 Seguidores</option>
            <option value="over_500">&gt; 500 Seguidores (Influyente)</option>
          </select>

          {/* Filtro de Antigüedad de la Cuenta */}
          <select 
            className={styles['filter-select']}
            value={accountAgeFilter}
            onChange={(e) => setAccountAgeFilter(e.target.value as typeof accountAgeFilter)}
            title="Filtrar por fecha de creación de la cuenta"
          >
            <option value="all">Creación: Todas</option>
            <option value="recent">⚡ Reciente (&lt; 1 mes - Alta Alerta)</option>
            <option value="older">📅 Antigua (&gt; 1 año)</option>
          </select>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE CONTACTOS Y PERFILES */}
      {deleteNotice && <p role="status" style={{ color: 'var(--emerald-600)' }}>{deleteNotice}</p>}
      {canDelete && <div className={styles['selection-toolbar']}>
        <span>{selectedCitizens.size ? `${selectedCitizens.size} ciudadanos seleccionados, incluidas otras páginas${selectedCitizens.size >= 500 ? ' (máximo por lote)' : ''}` : 'Marca las casillas para eliminar uno o varios ciudadanos.'}</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {selectedCitizens.size > 0 && <button type="button" className="btn-ghost" onClick={() => setSelectedCitizens(new Map())}>Limpiar selección</button>}
          <button type="button" className={styles['delete-btn']} disabled={loading || selectedCitizens.size === 0} onClick={() => setDeleteTargets([...selectedCitizens.values()])}><Trash2 size={15} />Eliminar seleccionados ({selectedCitizens.size})</button>
        </div>
      </div>}
      <div className={styles['citizens-table-card']} role="region" aria-label="Directorio de ciudadanos" aria-describedby="citizens-table-scroll-hint" tabIndex={0} data-horizontal-scroll>
        <p id="citizens-table-scroll-hint" className="table-scroll-hint">Desliza la tabla para consultar todas las columnas y acciones.</p>
        <table className={styles.table}>
          <thead className={styles['table-head']}>
            <tr>
              {canDelete && <th style={{ width: 44, paddingInline: 12 }}><input type="checkbox" className={styles['selection-checkbox']} aria-label={`Seleccionar los ${citizens.length} ciudadanos de esta página`} aria-checked={pagePartiallySelected ? 'mixed' : pageSelected} ref={element => { if (element) element.indeterminate = pagePartiallySelected; }} checked={pageSelected} disabled={loading || citizens.length === 0} onChange={togglePage} /></th>}
              <th>Ciudadano / Perfil</th>
              <th>Clasificación IA & Origen</th>
              <th>Métricas Perfil</th>
              <th>Barrio / Comuna</th>
              <th>Teléfono de Contacto</th>
              <th style={{ textAlign: 'right' }}>Acciones de Respuesta</th>
            </tr>
          </thead>
          <tbody className={styles['table-body']}>
            {filteredCitizens.length === 0 ? (
              <tr>
                <td colSpan={canDelete ? 7 : 6} style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
                  <ShieldCheck size={42} style={{ color: '#38bdf8', margin: '0 auto 12px' }} />
                  <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                    {loading ? 'Cargando ciudadanos…' : listError ? 'No se pudo cargar la base' : 'No hay ciudadanos con estos filtros'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8', maxWidth: '580px', marginInline: 'auto', lineHeight: 1.5 }}>
                    {listError || (loading ? 'Consultando los registros guardados.' : 'Ajusta la búsqueda o sube un archivo con el botón «Subir Base de Datos».')}
                  </p>
                </td>
              </tr>
            ) : (
              filteredCitizens.map((citizen) => {
                const isBot = citizen.user_type === 'Bot' || citizen.bot_probability >= 0.55;
                return (
                  <tr key={citizen.id} aria-selected={selectedCitizens.has(citizen.id)} className={[isBot ? styles['bot-row'] : '', selectedCitizens.has(citizen.id) ? styles['selected-row'] : ''].join(' ')}>
                    {canDelete && <td style={{ paddingInline: 12 }}><input type="checkbox" className={styles['selection-checkbox']} aria-label={`Seleccionar a ${citizen.name}`} checked={selectedCitizens.has(citizen.id)} disabled={loading || (!selectedCitizens.has(citizen.id) && selectedCitizens.size >= 500)} onChange={() => toggleCitizen(citizen)} /></td>}
                    {/* Nombre, Red Social y De Dónde Pertenece */}
                    <td>
                      <div className={styles['citizen-info']}>
                        <div className={[
                          styles['citizen-avatar'],
                          isBot ? styles.bot : citizen.user_type === 'Positivo' ? styles.pos : ''
                        ].join(' ')}>
                          {isBot ? <Bot size={18} /> : citizen.name.charAt(0)}
                        </div>
                        <div>
                          <div className={styles['citizen-name']}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{citizen.name}</span>
                            {isBot && (
                              <span style={{ fontSize: '0.65rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                BOT
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600 }}>{citizen.whatsapp_username || (citizen.handle.startsWith("contact:") ? "Contacto importado" : citizen.handle)}</span>
                            <span style={{ color: 'var(--text-muted)' }}>({citizen.channel})</span>
{(() => {
                              const sLink = getCitizenSocialLink(citizen.name, citizen.handle, citizen.channel);
                              if (!sLink) return null;
                              return (
                                <a
                                  href={sLink.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '0.67rem',
                                    color: sLink.color,
                                    background: sLink.bg,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    border: `1px solid ${sLink.border}`
                                  }}
                                  title={sLink.tooltip}
                                >
                                  <span>{sLink.label}</span>
                                  <ExternalLink size={10} />
                                </a>
                              );
                            })()}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} style={{ color: '#ef4444', flexShrink: 0 }} />
                            <span>{citizen.neighborhood || citizen.zone || 'No especificada'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Clasificación e Identificación de Origen */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        {isBot ? (
                          <>
                            <span className={styles['bot-origin-badge']}>
                              Clasificación previa por revisar
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600 }}>
                              Automatización sin verificar
                            </span>
                          </>
                        ) : citizen.user_type === 'Positivo' ? (
                          <>
                            <span className={styles['verified-human-badge']}>
                              🟢 Ciudadano Aliado
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#047857' }}>
                              ✓ Apoyo y propuestas constructivas
                            </span>
                          </>
                        ) : citizen.user_type === 'Sin clasificar' ? (
                          <span className="badge-media">Sin clasificar</span>
                        ) : (
                          <>
                            <span className="badge-alta" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                              🔴 Reclamo Crítico Real
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              ✓ Ciudadano huilense con queja directa
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Métricas de Perfil (Seguidores, Seguidos, Fecha Creación) */}
                    <td>
                      <div className={styles['profile-meta-pills']}>
                        <span className={styles['meta-pill']} title="Seguidores en la red social">
                          👥 <strong suppressHydrationWarning>{Number(citizen.followers_count || 0).toLocaleString('es-CO')}</strong> seg
                        </span>
                        <span className={styles['meta-pill']} title="Cuentas seguidas">
                          👤 <strong suppressHydrationWarning>{Number(citizen.following_count || 0).toLocaleString('es-CO')}</strong> seguidos
                        </span>
                        <span className={styles['meta-pill']} title="Fecha estimada de creación de la cuenta">
                          📅 {citizen.account_created_at || 'No disponible'}
                        </span>
                      </div>
                    </td>

                    {/* Barrio y Comuna */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <MapPin size={13} style={{ color: 'var(--blue-600)', flexShrink: 0 }} />
                        <span>{citizen.neighborhood || citizen.zone || 'No especificada'}</span>
                      </div>
                      {citizen.notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={citizen.notes}>
                          &quot;{citizen.notes}&quot;
                        </div>
                      )}
                    </td>

                    {/* Teléfono y WhatsApp */}
                    <td>
                      {citizen.phone ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                          <span className={styles['phone-badge']}>
                            📞 {citizen.phone}
                          </span>
                          <a
                            href={citizen.whatsapp_link || `https://wa.me/${citizen.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles['whatsapp-btn']}
                            title="Abrir chat directo de WhatsApp"
                          >
                            <MessageSquare size={13} />
                            <span>Contactar WhatsApp</span>
                          </a>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Sin teléfono registrado
                        </span>
                      )}
                    </td>

                    {/* Acciones de Historial y Respuesta */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {canDelete && <button type="button" className={styles['delete-btn']} disabled={loading} aria-label={`Eliminar a ${citizen.name}`} onClick={() => setDeleteTargets([{ id: citizen.id, name: citizen.name }])}><Trash2 size={14} />Eliminar</button>}
                        {citizen.has_source_data && <button type="button" className="btn-ghost" onClick={() => setSourceCitizenId(citizen.id)} style={{ padding: '6px 10px', fontSize: '.75rem' }}>Datos importados</button>}

{(() => {
                          const sLink = getCitizenSocialLink(citizen.name, citizen.handle, citizen.channel);
                          if (!sLink) return null;
                          return (
                            <a
                              href={sLink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost"
                              style={{
                                padding: '6px 10px',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: sLink.color
                              }}
                              title={sLink.tooltip}
                            >
                              <span>{sLink.shortLabel}</span>
                              <ExternalLink size={11} />
                            </a>
                          );
                        })()}
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={citizen.total_reports === 0}
                          onClick={() => handleOpenCitizenHistory(citizen)}
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          title="Ver en qué publicaciones comentó, qué respondió y qué podemos responder"
                        >
                          <MessageSquare size={13} />
                          <span>Ver Comentarios ({citizen.total_reports})</span>
                        </button>
                        <button
                          type="button"
                          disabled={citizen.total_reports === 0}
                          onClick={() => handleOpenSmartReplyForCitizen(citizen)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.18) 100%)',
                            border: '1px solid rgba(147, 51, 234, 0.38)',
                            borderRadius: '6px',
                            color: '#d8b4fe',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(147, 51, 234, 0.32) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.7)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.18) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.38)';
                            e.currentTarget.style.color = '#d8b4fe';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                          title="Generar propuesta de respuesta institucional con IA"
                        >
                          <Sparkles size={13} style={{ color: '#c084fc' }} />
                          <span>IA</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {listError && <p role="alert" style={{ color: 'var(--red-600)' }}>{listError}</p>}
      <nav aria-label="Paginación de ciudadanos" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', marginBlock: 16 }}>
        <span>{totalMatched ? offset + 1 : 0} a {Math.min(offset + citizens.length, totalMatched)} de {totalMatched}</span>
        <button type="button" className="btn-ghost" disabled={loading || offset === 0} onClick={() => setOffset(value => Math.max(0, value - pageSize))}>Anterior</button>
        <button type="button" className="btn-ghost" disabled={loading || offset + pageSize >= totalMatched} onClick={() => setOffset(value => value + pageSize)}>Siguiente</button>
      </nav>

      {/* ─── MODAL 1: SUBIDA DE BASE DE DATOS (CSV / EXCEL) ─── */}
      {uploadModalOpen && <CitizenImportModal onClose={() => setUploadModalOpen(false)} onImported={() => { setOffset(0); fetchCitizens(); }} />}
      {sourceCitizenId && <CitizenSourceModal id={sourceCitizenId} onClose={() => setSourceCitizenId(null)} />}
      {deleteTargets && <CitizenDeleteModal citizens={deleteTargets} onClose={closeDelete} onDeleted={handleDeletedCitizens} />}

      {smartReplyModalOpen && (
        <div className={styles['modal-overlay']} onClick={() => setSmartReplyModalOpen(false)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--blue-600)' }} />
                <h3>Generador de Respuesta Inteligente Institucional</h3>
              </div>
              <button className={styles['modal-close-btn']} onClick={() => setSmartReplyModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles['modal-body']}>
              {activeCitizenForReply && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>Destinatario:</strong> {activeCitizenForReply.name} ({activeCitizenForReply.handle})
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                      Tipo: {activeCitizenForReply.user_type} • Barrio: {activeCitizenForReply.neighborhood}
                    </div>
                  </div>
                  {activeCitizenForReply.phone && (
                    <span className="badge-tag" style={{ fontSize: '0.7rem' }}>
                      📞 {activeCitizenForReply.phone}
                    </span>
                  )}
                </div>
              )}

              {/* Botones de Escenarios Rápidos */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Seleccionar Escenario / Crítica de Neiva:
                </span>
                <div className={styles['quick-templates']}>
                  <button
                    type="button"
                    className={[styles['template-chip'], replyPrompt.includes('PAE') ? styles.active : ''].join(' ')}
                    onClick={() => {
                      const text = 'Por mi crítica salvé el PAE';
                      setReplyPrompt(text);
                      handleGenerateReply(text, activeCitizenForReply);
                    }}
                  >
                    🍲 &quot;Por mi crítica salvé el PAE&quot;
                  </button>
                  <button
                    type="button"
                    className={[styles['template-chip'], replyPrompt.includes('hueco') ? styles.active : ''].join(' ')}
                    onClick={() => {
                      const text = 'Puros huecos en la vía de La Toma y la Cra 5ta, no pavimentan nada';
                      setReplyPrompt(text);
                      handleGenerateReply(text, activeCitizenForReply);
                    }}
                  >
                    🚧 Malla Vial & Huecos
                  </button>
                  <button
                    type="button"
                    className={[styles['template-chip'], replyPrompt.includes('agua') ? styles.active : ''].join(' ')}
                    onClick={() => {
                      const text = 'Llevamos 3 días sin agua en Las Granjas y el recibo de Las Ceibas carísimo';
                      setReplyPrompt(text);
                      handleGenerateReply(text, activeCitizenForReply);
                    }}
                  >
                    💧 Acueducto Las Ceibas
                  </button>
                  <button
                    type="button"
                    className={[styles['template-chip'], replyPrompt.includes('mierda') ? styles.active : ''].join(' ')}
                    onClick={() => {
                      const text = 'la misma mierda politiqueros corruptos se roban la plata';
                      setReplyPrompt(text);
                      handleGenerateReply(text, activeCitizenForReply);
                    }}
                  >
                    🤖 Neutralizar Bot / Troll
                  </button>
                </div>
              </div>

              {/* Campo para editar la crítica del usuario */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Comentario o Crítica a Responder:
                </label>
                <textarea
                  className={styles['modal-textarea']}
                  style={{ minHeight: '65px' }}
                  value={replyPrompt}
                  onChange={(e) => setReplyPrompt(e.target.value)}
                  placeholder="Escribe el comentario del usuario aquí..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isGeneratingReply || !replyPrompt.trim()}
                  onClick={() => handleGenerateReply(replyPrompt, activeCitizenForReply)}
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                >
                  <Sparkles size={13} />
                  <span>{isGeneratingReply ? 'Generando respuesta...' : 'Regenerar Respuesta'}</span>
                </button>
              </div>

              {/* Respuesta Generada por IA */}
              {replyError && <p role="alert">{replyError}</p>}
              {generatedReply && (
                <div style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge-blue" style={{ fontSize: '0.7rem' }}>
                        Tema: {replyTopic || 'Gestión Institucional'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--emerald-600)', fontWeight: 700 }}>
                        ✓ Argumento Verificado
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyReply}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: copiedSuccess ? '#10b981' : 'var(--bg-muted)',
                        color: copiedSuccess ? '#fff' : 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      {copiedSuccess ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedSuccess ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                    &quot;{generatedReply}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className={styles['modal-footer']}>
              <button type="button" className="btn-ghost" onClick={() => setSmartReplyModalOpen(false)}>
                Cerrar
              </button>

              {activeCitizenForReply?.phone && generatedReply && (
                <a
                  href={`https://wa.me/${activeCitizenForReply.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(generatedReply)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles['whatsapp-btn']}
                >
                  <MessageSquare size={14} />
                  <span>Enviar por WhatsApp</span>
                </a>
              )}

              <button 
                type="button" 
                className="btn-primary"
                onClick={handleCopyReply}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedSuccess ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSuccess ? '¡Copiado al Portapapeles!' : 'Copiar para Facebook / Redes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EXPEDIENTE DE COMENTARIOS, POSTS Y QUÉ PODEMOS RESPONDER ─── */}
      {commentsModalOpen && (
        <div className={styles['modal-overlay']} onClick={() => setCommentsModalOpen(false)}>
          <div 
            className={styles['modal-card']} 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '920px', width: '92vw', maxHeight: '88dvh' }}
            role="dialog" aria-modal="true" aria-labelledby="citizen-history-title"
          >
            {/* Header del Expediente Ciudadano */}
            <div className={styles['modal-header']} style={{ background: 'rgba(15, 23, 42, 0.75)' }}>
              <div className={styles['history-identity']}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: selectedCitizenHistory?.citizen?.user_type === 'Bot' ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedCitizenHistory?.citizen?.user_type === 'Bot' ? '#ef4444' : '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: '1px solid var(--border)'
                }}>
                  {selectedCitizenHistory?.citizen?.user_type === 'Bot' ? <Bot size={22} /> : (selectedCitizenHistory?.citizen?.name ? selectedCitizenHistory.citizen.name.charAt(0).toUpperCase() : 'C')}
                </div>
                <div className={styles['history-details']}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 id="citizen-history-title" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {selectedCitizenHistory?.citizen?.name || 'Expediente de Comentarios'}
                    </h3>
                    <code style={{ fontSize: '0.78rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {selectedCitizenHistory?.citizen?.handle}
                    </code>
                    {selectedCitizenHistory?.citizen?.user_type === 'Bot' ? (
                      <span className="badge-alta" style={{ fontSize: '0.68rem', padding: '1px 8px' }}>🤖 Bot / Troll</span>
                    ) : (
                      <span className="badge-baja" style={{ fontSize: '0.68rem', padding: '1px 8px' }}>
                        {selectedCitizenHistory?.citizen?.user_type === 'Positivo' ? '🟢 Ciudadano Favorable' : '🟡 Ciudadano Crítico'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>📍 {selectedCitizenHistory?.citizen?.neighborhood || 'Neiva'}</span>
                    <span style={{ margin: '0 6px' }}>•</span>
                    <span>Canal: <strong>{selectedCitizenHistory?.citizen?.channel || 'Facebook'}</strong></span>
                    {selectedCitizenHistory?.citizen?.phone && (
                      <>
                        <span style={{ margin: '0 6px' }}>•</span>
                        <span style={{ color: '#10b981' }}>📞 {selectedCitizenHistory.citizen.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                className={styles['modal-close-btn']} 
                onClick={() => setCommentsModalOpen(false)}
                title="Cerrar expediente"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo con Historial de Posts, Comentarios y Propuestas de Respuesta */}
            <div className={styles['modal-body']} style={{ padding: '20px 24px', overflowY: 'auto' }}>
              {historyError && <p role="alert">{historyError} Reabre el historial para revisar la versión actual antes de guardar.</p>}
              {loadingHistory ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--blue-500)' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Consultando publicaciones y generando propuestas de respuesta con IA...</p>
                </div>
              ) : selectedCitizenHistory?.comments?.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
                  <p>No se encontraron comentarios registrados para este perfil.</p>
                </div>
              ) : (
                <>
                  <div style={{ 
                    padding: '10px 14px', 
                    background: 'rgba(59, 130, 246, 0.08)', 
                    border: '1px solid rgba(59, 130, 246, 0.25)', 
                    borderRadius: '8px', 
                    marginBottom: '18px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <span>
                      📊 <strong>{selectedCitizenHistory?.total_comments} expedientes coincidentes</strong>. {selectedCitizenHistory?.relationship_note}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
{(() => {
                        const cit = selectedCitizenHistory?.citizen;
                        const sLink = getCitizenSocialLink(cit?.name, cit?.handle, cit?.channel);
                        if (!sLink) return null;
                        return (
                          <a 
                            href={sLink.url}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-ghost"
                            style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: sLink.color }}
                            title={sLink.tooltip}
                          >
                            <span>{sLink.label}</span>
                            <ExternalLink size={12} />
                          </a>
                        );
                      })()}
                      {selectedCitizenHistory?.citizen?.whatsapp_link && (
                        <a 
                          href={selectedCitizenHistory.citizen.whatsapp_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-primary"
                          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <MessageSquare size={12} />
                          <span>WhatsApp Directo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(!selectedCitizenHistory?.comments || selectedCitizenHistory.comments.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <Info size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', display: 'inline-block' }} />
                        <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--text-primary)' }}>Sin expedientes coincidentes</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '450px', marginInline: 'auto' }}>
                          {selectedCitizenHistory?.relationship_note || 'La información disponible no permite vincular comentarios a este contacto.'}
                        </p>
                      </div>
                    ) : (
                      selectedCitizenHistory.comments.map((item, idx) => (
                      <div 
                        key={item.case_id || idx}
                        data-case-id={item.case_id}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        {/* 1. SECCIÓN: INFORMACIÓN DE LA PUBLICACIÓN DE META */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '12px 16px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderBottom: '1px solid var(--border)'
                        }}>
                          <HistoryPostImage key={item.post.cover_image || 'missing'} src={item.post.cover_image} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{ 
                                fontSize: '0.67rem', 
                                padding: '1px 8px', 
                                borderRadius: '4px', 
                                background: item.post.source === 'Instagram' ? '#E1306C' : '#1877F2', 
                                color: '#fff', 
                                fontWeight: 700 
                              }}>
                                {item.post.source}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Publicado: {item.post.published_at || 'Fecha no disponible'}
                              </span>
                            </div>
                            <h4 style={{ 
                              margin: 0, 
                              fontSize: '0.85rem', 
                              color: 'var(--text-primary)', 
                              lineHeight: 1.3,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis' 
                            }}>
                              {item.post.title}
                            </h4>
                          </div>
                          {item.post.permalink_url && (
                            <a 
                              href={item.post.permalink_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn-ghost"
                              style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                              title="Abrir post en Meta"
                            >
                              <span>Ver Post</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>

                        {/* 2. SECCIÓN: LO QUE RESPONDIÓ / COMENTÓ EL CIUDADANO */}
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                                💬 Comentario de {item.author || selectedCitizenHistory?.citizen?.name}:
                              </span>
{(() => {
                                const authorName = item.author || selectedCitizenHistory?.citizen?.name;
                                const cit = selectedCitizenHistory?.citizen;
                                const authorHandle = (authorName === cit?.name) ? cit?.handle : undefined;
                                const sLink = getCitizenSocialLink(authorName, authorHandle, item.post.source || cit?.channel);
                                if (!sLink) return null;
                                return (
                                  <a
                                    href={sLink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      color: sLink.color,
                                      background: sLink.bg,
                                      border: `1px solid ${sLink.border}`,
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      textDecoration: 'none'
                                    }}
                                    title={sLink.tooltip}
                                  >
                                    <span>{sLink.label} ({authorHandle})</span>
                                    <ExternalLink size={10} />
                                  </a>
                                );
                              })()}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {(() => {
                                const emo = getEmotionConfig(item.sentiment);
                                return (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    background: emo.bg,
                                    border: `1px solid ${emo.border}`,
                                    color: emo.color,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <span>{emo.emoji}</span>
                                    <span>{item.sentiment || `${emo.primary}: ${emo.sub}`}</span>
                                  </span>
                                );
                              })()}
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {item.date_time}
                              </span>
                            </div>
                          </div>

                          <div style={{
                            padding: '12px 14px',
                            background: 'rgba(15, 23, 42, 0.5)',
                            borderLeft: `4px solid ${getEmotionConfig(item.sentiment).color}`,
                            borderRadius: '0 8px 8px 0',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            lineHeight: 1.5,
                            fontStyle: 'italic'
                          }}>
                            &quot;{item.comment_text}&quot;
                          </div>

                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>Categoría: <strong style={{ color: 'var(--text-secondary)' }}>{item.category}</strong></span>
                            <span>Ubicación: <strong style={{ color: 'var(--text-secondary)' }}>{item.location}</strong></span>
                            <span>Estado Caso: <strong style={{ color: item.status === 'Resuelto' ? '#10b981' : item.status === 'En Gestión' ? '#38bdf8' : '#f59e0b' }}>{item.status}</strong></span>
                          </div>
                        </div>

                        {/* 3. SECCIÓN: QUÉ PODEMOS RESPONDER (RESPUESTA INTELIGENTE IA) */}
                        <div style={{ padding: '14px 16px', background: 'rgba(59, 130, 246, 0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Sparkles size={14} style={{ color: 'var(--blue-500)' }} />
                              <strong style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                                Borrador interno de respuesta
                              </strong>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                              {item.ai_suggestion?.tone ? `Tono propuesto: ${item.ai_suggestion.tone}` : 'Edición manual'}
                            </span>
                          </div>

                          <textarea
                            rows={3}
                            readOnly={!canWriteDraft || !['Pendiente', 'En Gestión'].includes(item.status)}
                            value={replyDrafts[item.case_id] ?? (item.public_response || item.ai_suggestion?.suggested_reply || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReplyDrafts(prev => ({ ...prev, [item.case_id]: val }));
                            }}
                            placeholder="Redacta o edita la respuesta institucional aquí..."
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              fontSize: '0.8125rem',
                              lineHeight: 1.45,
                              resize: 'vertical',
                              boxSizing: 'border-box'
                            }}
                          />

                          {/* Puntos de Apoyo sugeridos */}
                          {Boolean(item.ai_suggestion?.talking_points?.length) && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                              {item.ai_suggestion?.talking_points.map((pt: string, pidx: number) => (
                                <span key={pidx} style={{ fontSize: '0.67rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.04)', padding: '1px 6px', borderRadius: '3px' }}>
                                  ✓ {pt}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Botones de Acción de Respuesta */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={() => handleSaveCitizenReply(item.case_id)}
                                disabled={savingReplyId === item.case_id || !canWriteDraft || !['Pendiente', 'En Gestión'].includes(item.status) || !(replyDrafts[item.case_id] || '').trim()}
                                style={{ fontSize: '0.75rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              >
                                {savingReplyId === item.case_id ? (
                                  <>
                                    <RefreshCw size={12} className="spin" />
                                    <span>Guardando...</span>
                                  </>
                                ) : savedReplySuccess === item.case_id ? (
                                  <>
                                    <Check size={12} style={{ color: '#10b981' }} />
                                    <span>Borrador guardado</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={12} />
                                    <span>Guardar borrador</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => handleCopyReplyText(item.case_id, replyDrafts[item.case_id] || item.ai_suggestion?.suggested_reply || '')}
                                style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              >
                                {copiedCommentId === item.case_id ? (
                                  <>
                                    <Check size={12} style={{ color: '#10b981' }} />
                                    <span style={{ color: '#10b981' }}>¡Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>Copiar para Pegar en Redes</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              {selectedCitizenHistory?.citizen?.phone && (
                                <a
                                  href={`https://wa.me/${selectedCitizenHistory.citizen.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(replyDrafts[item.case_id] || item.ai_suggestion?.suggested_reply || '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-secondary"
                                  style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                  title="Enviar esta respuesta al WhatsApp del ciudadano"
                                >
                                  <MessageSquare size={12} />
                                  <span>Enviar WhatsApp</span>
                                </a>
                              )}
                              {item.post.permalink_url && (
                                <a
                                  href={item.post.permalink_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-ghost"
                                  style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  title="Abrir post en Meta para responder directamente"
                                >
                                  <span>Responder en Red</span>
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}</div>
                </>
              )}
            </div>

            {/* Footer del Modal */}
            <div className={styles['modal-footer']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                CIVIA Social Intelligence • Alcaldía de Neiva 2026
              </div>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setCommentsModalOpen(false)}
                style={{ padding: '6px 18px', fontSize: '0.8125rem' }}
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function HistoryPostImage({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  return src && !failed
    ? <img src={src} alt="Portada original disponible" style={{ width: 85, height: 56, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={() => setFailed(true)} />
    : <span style={{ width: 85, fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>Sin imagen disponible</span>;
}
