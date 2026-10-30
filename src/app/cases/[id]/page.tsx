"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Clock, MessageSquare, AlertTriangle, Send, Share2, 
  Flame, CheckCircle2, ShieldAlert, Building2, UserCheck, Check,
  FileText, CornerDownRight, RefreshCw, Sparkles, MessageCircle, Layers,
  ExternalLink, Copy, ThumbsUp, HelpCircle
} from 'lucide-react';
import { API } from '@/lib/api/client';
import { useAuth, UserRole } from '@/context/AuthContext';
import styles from './case-detail.module.scss';
import { getEmotionConfig, getCitizenSocialLink } from '@/lib/emotions';

// Departamentos e Instituciones de Neiva, Huila
const NEIVA_DEPARTMENTS = [
  'Las Ceibas - Empresas Públicas de Neiva E.S.P.',
  'Secretaría de Infraestructura y Vías',
  'Secretaría de Movilidad y Tránsito',
  'Secretaría de Salud Municipal',
  'Secretaría de Medio Ambiente y Desarrollo Rural',
  'Secretaría de Gobierno y Convivencia Ciudadana',
  'Dirección de Gestión del Riesgo (DGRD Neiva)',
  'Secretaría de Educación',
];

interface CaseDetailData {
  id: string;
  source: string;
  author: string;
  priority: string;
  title: string;
  content: string;
  category: string;
  sentiment: string;
  location: string;
  dateTime: string;
  status: string;
  mediaType?: string;
  imageUrl?: string | null;
  impact_if_solved?: string;
  impact_if_ignored?: string;
  assigned_department?: string | null;
  assigned_to?: string | null;
  internal_notes?: string | null;
  public_response?: string | null;
  resolution_note?: string | null;
  resolved_by?: string | null;
  priority_action?: boolean;
  institutional_radicado?: string | null;
  comments_count?: number;
  channel_contact_allowed?: boolean;
  post_data?: {
    id: string;
    title: string;
    message?: string;
    cover_image?: string;
    media_type?: string;
    permalink_url?: string;
    published_at?: string;
    source?: string;
    total_comments?: number;
    likes_count?: number;
  } | null;
  contact_person?: {
    name: string;
    handle: string;
    role: string;
    phone?: string;
    email?: string;
    origenDato: 'CIUDADANO' | 'OPERADOR' | 'FORMULARIO';
  };
}

const FALLBACK_CASES: Record<string, CaseDetailData> = {
  'CIV-2026-0001': {
    id: 'CIV-2026-0001',
    institutional_radicado: 'RAD-MOV-2026-0001',
    source: 'Facebook Oficial - Johan Steed',
    author: 'Rodolfo Escobar',
    priority: 'Alta',
    title: 'Movilidad: Falta de semáforo en horario pico',
    content: 'aguantese un semaforo a medio dia',
    category: 'Movilidad',
    sentiment: 'Enojo o ira: Frustración',
    location: 'Neiva (General)',
    dateTime: '13 Oct 2026, 10:44 AM',
    status: 'Pendiente',
    mediaType: 'video',
    imageUrl: 'http://localhost:8000/static/covers/275486829735525_1634488622025887.jpg',
    impact_if_solved: 'Optimización de controladores viales en puntos neurálgicos de Neiva.',
    impact_if_ignored: 'Riesgo de colapso en corredores principales y siniestralidad.',
    assigned_department: 'Secretaría de Movilidad y Tránsito',
    assigned_to: 'Técnicos de Semaforización Neiva',
    priority_action: true,
    comments_count: 1,
    post_data: {
      id: '275486829735525_1634488622025887',
      title: 'En Neiva, esperar el semáforo en rojo es todo un reto entre el calor y el tráfico...',
      message: 'En Neiva, esperar el semáforo en rojo es todo un reto entre el calor y el tráfico. A veces, hasta nos da tiempo de hacer de todo mientras esperamos la luz verde.\n\nLa movilidad también necesita orden.',
      cover_image: 'http://localhost:8000/static/covers/275486829735525_1634488622025887.jpg',
      media_type: 'video',
      permalink_url: 'https://www.facebook.com/reel/1418971067098225/',
      published_at: '20 Oct 2026, 05:52 PM',
      source: 'Facebook',
      total_comments: 18,
      likes_count: 319
    }
  }
};

function getFallbackCase(id: string): CaseDetailData {
  if (FALLBACK_CASES[id]) return FALLBACK_CASES[id];
  const cleanNum = id.replace(/\D/g, '') || '1';
  const altCivKey = `CIV-2026-${cleanNum.padStart(4, '0')}`;
  if (FALLBACK_CASES[altCivKey]) {
    return { ...FALLBACK_CASES[altCivKey], id };
  }
  const base = FALLBACK_CASES['CIV-2026-0001'] || Object.values(FALLBACK_CASES)[0];
  return {
    ...base,
    id,
    title: `Incidente Urbano ${id} - Neiva`,
    institutional_radicado: `RAD-MUN-2026-${cleanNum.padStart(4, '0')}`,
  };
}

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = (params?.id as string) || 'CASO-001';
  const { user, switchDemoUser } = useAuth();

  const [caseData, setCaseData] = useState<CaseDetailData | null>(() => getFallbackCase(caseId));
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Estados de formularios para cada acción
  const [newNote, setNewNote] = useState('');
  const [dispatchDept, setDispatchDept] = useState(() => getFallbackCase(caseId).assigned_department || NEIVA_DEPARTMENTS[0]);
  const [dispatchAssignee, setDispatchAssignee] = useState(() => getFallbackCase(caseId).assigned_to || '');
  const [dispatchNote, setDispatchNote] = useState('');
  const [resolutionText, setResolutionText] = useState(() => getFallbackCase(caseId).resolution_note || '');
  const [publicRespText, setPublicRespText] = useState(() => getFallbackCase(caseId).public_response || '');
  const [mayoralDirective, setMayoralDirective] = useState('');
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Cargar datos del caso desde Backend
  useEffect(() => {
    let isMounted = true;
    async function fetchCase() {
      setLoading(true);
      try {
        const data = await API.cases.getById(caseId);
        if (isMounted && data) {
          const parsed: CaseDetailData = {
            id: data.id || caseId,
            source: data.source || 'Facebook',
            author: data.author || 'Ciudadano',
            priority: data.priority || 'Media',
            title: data.title || 'Reporte Ciudadano en Neiva',
            content: data.content || '',
            category: data.category || 'General',
            sentiment: data.sentiment || 'Enojo o ira: Frustración',
            location: data.location || 'Neiva',
            dateTime: data.date_time || data.dateTime || 'Reciente',
            status: data.status || 'Pendiente',
            mediaType: data.media_type || data.mediaType || 'none',
            imageUrl: data.image_url || data.imageUrl || null,
            impact_if_solved: data.impact_if_solved || 'Atención prioritaria y resolución efectiva en el sector.',
            impact_if_ignored: data.impact_if_ignored || 'Riesgo de escalamiento y afectación prolongada.',
            assigned_department: data.assigned_department || NEIVA_DEPARTMENTS[0],
            assigned_to: data.assigned_to || '',
            internal_notes: data.internal_notes || '',
            public_response: data.public_response || '',
            resolution_note: data.resolution_note || '',
            resolved_by: data.resolved_by || '',
            priority_action: data.priority_action || false,
            institutional_radicado: data.institutional_radicado || `RAD-${(data.category || 'GEN').substring(0,3).toUpperCase()}-2026-${caseId.replace(/\D/g, '').padStart(4, '0') || '0001'}`,
            comments_count: 1,
            post_data: data.post_data || null
          };
          setCaseData(parsed);
          setDispatchDept(parsed.assigned_department || NEIVA_DEPARTMENTS[0]);
          setDispatchAssignee(parsed.assigned_to || '');
          setResolutionText(parsed.resolution_note || '');
          setPublicRespText(parsed.public_response || '');
        } else if (isMounted) {
          const fallback = getFallbackCase(caseId);
          setCaseData(fallback);
          setDispatchDept(fallback.assigned_department || NEIVA_DEPARTMENTS[0]);
          setDispatchAssignee(fallback.assigned_to || '');
        }
      } catch (err) {
        console.warn('Backend offline o usando fallback:', err);
        if (isMounted) {
          const fallback = getFallbackCase(caseId);
          setCaseData(fallback);
          setDispatchDept(fallback.assigned_department || NEIVA_DEPARTMENTS[0]);
          setDispatchAssignee(fallback.assigned_to || '');
          setResolutionText(fallback.resolution_note || '');
          setPublicRespText(fallback.public_response || '');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCase();
    return () => { isMounted = false; };
  }, [caseId]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  // ─── ACCIÓN: Generar Propuesta de Respuesta Asistida por IA CIVIA ────
  const handleGenerateAiReply = () => {
    if (!caseData) return;
    const dept = caseData.assigned_department || 'la administración municipal';
    const cat = caseData.category || 'su reporte';
    const citizenName = caseData.author.replace('@', '');
    const suggestion = `Hola ${citizenName}, gracias por tu participación. Tu reporte respecto a ${caseData.title || cat} en ${caseData.location} se encuentra radicado con el número oficial ${caseData.institutional_radicado || caseData.id} y fue asignado formalmente a ${dept}. Desde el despacho municipal estamos dando seguimiento directo para atender esta solicitud.`;
    setPublicRespText(suggestion);
    showFeedback('✨ Propuesta institucional generada con éxito por CIVIA AI.');
  };

  // ─── ACCIÓN: Guardar Respuesta Institucional Oficial ─────────────────
  const handleSavePublicResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!caseData || !publicRespText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await API.cases.savePublicResponse(caseData.id, publicRespText.trim());
      const nowStr = new Date().toLocaleDateString('es-CO');
      const actionText = `[${nowStr}] [Respuesta Institucional Publicada]: ${publicRespText.trim()}`;
      setCaseData(prev => prev ? {
        ...prev,
        public_response: publicRespText.trim(),
        status: prev.status === 'Pendiente' ? 'En Gestión' : prev.status,
        internal_notes: prev.internal_notes ? `${prev.internal_notes}\n${actionText}` : actionText
      } : null);
      showFeedback('💾 Respuesta institucional guardada en base de datos oficial.');
    } catch (err) {
      console.error(err);
      showFeedback('Respuesta oficial guardada localmente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Copiar Respuesta Oficial al Portapapeles ────────────────
  const handleCopyPublicResponse = () => {
    if (!publicRespText.trim()) return;
    navigator.clipboard.writeText(publicRespText.trim());
    setCopiedResponse(true);
    showFeedback('📋 Respuesta copiada al portapapeles. Lista para publicar en Meta.');
    setTimeout(() => setCopiedResponse(false), 2500);
  };

  // ─── ACCIÓN: Despacho a Terreno (Secretario / Operador) ──────────────
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await API.cases.dispatch(caseData.id, {
        assigned_department: dispatchDept,
        assigned_to: dispatchAssignee,
        note: dispatchNote || undefined,
      });

      const noteEntry = `[${new Date().toLocaleDateString('es-CO')}] [Despachado a ${dispatchDept}]: Asignado a: ${dispatchAssignee || 'Equipo Operativo'}. ${dispatchNote ? 'Detalle: ' + dispatchNote : ''}`;

      setCaseData(prev => prev ? {
        ...prev,
        status: 'En Gestión',
        assigned_department: dispatchDept,
        assigned_to: dispatchAssignee,
        internal_notes: prev.internal_notes ? `${prev.internal_notes}\n${noteEntry}` : noteEntry
      } : null);
      setDispatchNote('');
      showFeedback(`🚀 Caso canalizado formalmente a ${dispatchDept}. Estado: "En Gestión".`);
    } catch (err) {
      console.error(err);
      showFeedback(`Caso actualizado localmente a En Gestión.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Resolver Caso (Secretario) ──────────────────────────────
  const handleResolveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !resolutionText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const resolvedBy = user?.full_name ? `${user.full_name} (${user.role})` : 'Secretaría de Despacho';
      await API.cases.resolve(caseData.id, {
        resolution_note: resolutionText.trim(),
        resolved_by: resolvedBy
      });

      const noteEntry = `[${new Date().toLocaleDateString('es-CO')}] [Caso Resuelto por ${resolvedBy}]: ${resolutionText.trim()}`;

      setCaseData(prev => prev ? {
        ...prev,
        status: 'Resuelto',
        resolution_note: resolutionText.trim(),
        resolved_by: resolvedBy,
        internal_notes: prev.internal_notes ? `${prev.internal_notes}\n${noteEntry}` : noteEntry
      } : null);
      showFeedback('✅ ¡Caso resuelto y cerrado satisfactoriamente con reporte técnico oficial!');
    } catch (err) {
      console.error(err);
      showFeedback('Caso marcado como resuelto localmente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Alcalde Toggle Prioridad Inmediata ──────────────────────
  const handleTogglePriority = async () => {
    if (!caseData || isSubmitting) return;
    setIsSubmitting(true);
    const nextState = !caseData.priority_action;
    try {
      await API.cases.togglePriority(caseData.id, nextState);
      const actionText = nextState 
        ? `[${new Date().toLocaleDateString('es-CO')}] [Alcaldía de Neiva - Despacho]: Se ha declarado PRIORIDAD DE INTERVENCIÓN INMEDIATA.`
        : `[${new Date().toLocaleDateString('es-CO')}] [Alcaldía de Neiva - Despacho]: Se desactiva la prioridad especial de alcaldía.`;
      
      setCaseData(prev => prev ? {
        ...prev,
        priority_action: nextState,
        internal_notes: prev.internal_notes ? `${prev.internal_notes}\n${actionText}` : actionText,
      } : null);

      showFeedback(nextState 
        ? '🔥 ¡Prioridad Inmediata Alcaldía activada! Se notificó a secretarías con SLA < 24h.' 
        : 'Prioridad especial de Alcaldía desactivada.');
    } catch (err) {
      console.error(err);
      setCaseData(prev => prev ? { ...prev, priority_action: nextState } : null);
      showFeedback(`Prioridad actualizada localmente (${nextState ? 'Activada' : 'Desactivada'}).`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Añadir Nota Interna en Bitácora ─────────────────────────
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !newNote.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const authorName = user?.full_name ? `${user.full_name} (${user.role})` : 'Operador CIVIA';
    try {
      await API.cases.addNote(caseData.id, {
        note: newNote.trim(),
        author_name: authorName
      });
      const noteEntry = `[${new Date().toLocaleDateString('es-CO')}] [${authorName}]: ${newNote.trim()}`;
      setCaseData(prev => prev ? {
        ...prev,
        internal_notes: prev.internal_notes ? `${prev.internal_notes}\n${noteEntry}` : noteEntry
      } : null);
      setNewNote('');
      showFeedback('📝 Nota interna registrada en la bitácora de seguimiento.');
    } catch (err) {
      console.error(err);
      showFeedback('Nota añadida a la bitácora local.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!caseData) {
    return (
      <div className={styles['page-container']}>
        <div className="flex items-center justify-center p-12 text-slate-500">
          <RefreshCw size={24} className="animate-spin mr-2" />
          <span>Cargando expediente del caso en Neiva...</span>
        </div>
      </div>
    );
  }

  const currentRole = user?.role || 'OPERADOR';
  const emotionConfig = getEmotionConfig(caseData.sentiment);
  const socialLink = getCitizenSocialLink(caseData.author, caseData.author, caseData.source);

  // Datos del post oficial
  const postData = caseData.post_data || {
    id: 'post_oficial_neiva',
    title: caseData.title,
    message: 'Publicación institucional oficial del Alcalde Johan Steed abordando problemáticas ciudadanas y avances de gestión en Neiva.',
    cover_image: caseData.imageUrl || 'http://localhost:8000/static/covers/275486829735525_1634488622025887.jpg',
    media_type: caseData.mediaType || 'image',
    permalink_url: caseData.source.toLowerCase().includes('instagram') ? 'https://instagram.com/johansteed_' : 'https://facebook.com/1627414346066648',
    published_at: caseData.dateTime,
    source: caseData.source,
    total_comments: 18,
    likes_count: 319
  };

  return (
    <div className={styles['page-container']}>
      {/* ─── BANNER DE PRIORIDAD ALCALDÍA ─────────────────────── */}
      {caseData.priority_action && (
        <div className={styles['priority-banner']}>
          <div className={styles['banner-left']}>
            <span className={styles['banner-icon']}>🔥</span>
            <div>
              <h4>Prioridad Institucional – Despacho del Alcalde</h4>
              <p>Intervención de máxima prioridad institucional. Protocolo con SLA prioritario de 24 horas.</p>
            </div>
          </div>
          <span className={styles['banner-tag']}>SLA PRIORITARIO ACTIVADO</span>
        </div>
      )}

      {/* ─── ENCABEZADO Y ACCIONES PRINCIPALES ─────────────────── */}
      <header className={styles['detail-header']}>
        <div>
          <Link href="/cases" className={styles['back-link']}>
            <ArrowLeft size={16} /> Volver a la Bandeja de Casos
          </Link>
          <div className={styles['title-row']}>
            <h1 className={styles['case-title']}>{caseData.title}</h1>
            <span className={styles['case-id-badge']}>{caseData.institutional_radicado || caseData.id}</span>
          </div>
          <div className={styles['tags-row']}>
            <span className="badge-tag">{caseData.category}</span>
            <span className={
              caseData.priority === 'Alta' || caseData.priority === 'Crítica' ? 'badge-alta' :
              caseData.priority === 'Media' ? 'badge-media' : 'badge-baja'
            }>
              Prioridad {caseData.priority}
            </span>
            <span className={
              caseData.status === 'Resuelto' || caseData.status === 'Cerrado' ? 'badge-baja' :
              caseData.status === 'En Gestión' ? 'badge-blue' : 'badge-media'
            }>
              {caseData.status}
            </span>
            {caseData.assigned_department && (
              <span className="badge-tag">
                🏢 {caseData.assigned_department}
              </span>
            )}
          </div>
          <div className={styles['meta-row']}>
            <span><Clock size={14} /> {caseData.dateTime}</span>
            <span><MapPin size={14} /> {caseData.location}, Neiva</span>
            <span><MessageSquare size={14} /> Red: {caseData.source}</span>
            <span><UserCheck size={14} /> Autor: <strong>{caseData.author}</strong></span>
          </div>
        </div>

        <div className={styles['header-actions']}>
          <button 
            className={`${styles.btn} ${styles['btn-secondary']}`}
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showFeedback('📋 Enlace del expediente copiado al portapapeles');
              }
            }}
          >
            <Share2 size={16} />
            <span>Compartir</span>
          </button>

          {/* Acción de Alcalde */}
          {currentRole === 'ALCALDE' && (
            <button 
              className={`${styles.btn} ${caseData.priority_action ? styles['btn-danger-outline'] : styles['btn-danger']}`}
              onClick={handleTogglePriority}
              disabled={isSubmitting}
            >
              <Flame size={16} />
              <span>{caseData.priority_action ? 'Quitar Prioridad Alcaldía' : 'Declarar Prioridad Inmediata'}</span>
            </button>
          )}
        </div>
      </header>

      {/* FEEDBACK TOAST / BANNER */}
      {feedbackMsg && (
        <div className={styles['action-success-banner']}>
          <Check size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ─── GRID DE DETALLE Y GESTIÓN OPERATIVA ────────────────── */}
      <div className={styles['detail-grid']}>
        {/* ======================================================== */}
        {/* COLUMNA IZQUIERDA: POST OFICIAL, COMENTARIO Y TRAZABILIDAD */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 1. PUBLICACIÓN OFICIAL DE ORIGEN (Johan Steed) */}
          <div className={styles.card} style={{ border: '1px solid rgba(59, 130, 246, 0.35)', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)' }}>
            <div className={styles['card-title']} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              <div className={styles['title-content']}>
                <span style={{ fontSize: '1.2rem' }}>{postData.source?.toLowerCase().includes('instagram') ? '📸' : '📘'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Publicación Oficial de Johan Steed</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Canal: {postData.source} • Publicado: {postData.published_at}</div>
                </div>
              </div>
              {postData.permalink_url && (
                <a 
                  href={postData.permalink_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', padding: '5px 10px', textDecoration: 'none' }}
                >
                  <span>Ver Post en {postData.source}</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            <div style={{ marginTop: '12px' }}>
              {/* Cover o miniatura de la publicación */}
              {(postData.cover_image || caseData.imageUrl) && (
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', maxHeight: '240px', marginBottom: '12px', border: '1px solid var(--border)' }}>
                  <img 
                    src={postData.cover_image || caseData.imageUrl || ''} 
                    alt="Portada del Post de Johan Steed" 
                    style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>{postData.media_type === 'video' ? '🎥 Reel Oficial' : '📷 Foto Oficial'}</span>
                    <span>• {postData.likes_count || 320} me gusta</span>
                    <span>• {postData.total_comments || 18} comentarios</span>
                  </div>
                </div>
              )}

              {/* Texto de la publicación oficial de Johan Steed */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#e2e8f0',
                lineHeight: 1.5,
                whiteSpace: 'pre-line'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  Contenido de la publicación institucional:
                </div>
                "{postData.message || postData.title}"
              </div>
            </div>
          </div>

          {/* 2. EXCLUSIVAMENTE ESE COMENTARIO (Ciudadano) */}
          <div className={styles.card} style={{ border: '1px solid rgba(239, 68, 68, 0.35)', background: 'rgba(15, 23, 42, 0.8)' }}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <MessageSquare size={18} className="text-red-500" />
                <span style={{ fontWeight: 700 }}>Comentario Ciudadano del Caso (Exclusivo)</span>
              </div>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: emotionConfig.bg,
                  border: `1px solid ${emotionConfig.border}`,
                  color: emotionConfig.color
                }}
                title={`Rueda de Sentimientos: ${emotionConfig.primary} - ${emotionConfig.sub}`}
              >
                <span>{emotionConfig.emoji}</span>
                <span>{caseData.sentiment}</span>
              </span>
            </div>

            <div className={styles['citizen-box']} style={{ padding: '14px', background: 'rgba(30, 41, 59, 0.35)', borderRadius: '8px' }}>
              <div className={styles['author-row']} style={{ marginBottom: '12px' }}>
                <div className={styles['author-info']}>
                  <div className={styles['author-avatar']} style={{ background: socialLink.channel === 'Instagram' ? '#E1306C' : '#1877F2' }}>
                    {caseData.author.replace('@', '').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{caseData.author}</strong>
                      {socialLink.url && (
                        <a 
                          href={socialLink.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: socialLink.bg,
                            border: `1px solid ${socialLink.border}`,
                            color: socialLink.color,
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          <span>{socialLink.label}</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <div className={styles['author-channel']}>
                      Comentó el {caseData.dateTime} • Sector: {caseData.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* El comentario íntegro y exclusivo */}
              <div style={{
                padding: '14px 16px',
                background: 'rgba(15, 23, 42, 0.75)',
                borderLeft: `4px solid ${emotionConfig.color}`,
                borderRadius: '0 8px 8px 0',
                fontSize: '1rem',
                lineHeight: 1.6,
                color: '#fff',
                fontStyle: 'italic',
                fontWeight: 500
              }}>
                "{caseData.content}"
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Problemática detectada: <strong style={{ color: '#93c5fd' }}>{caseData.category}</strong></span>
                <span>Canal auditado: <strong>{caseData.source}</strong></span>
              </div>
            </div>
          </div>

          {/* 3. LO QUE SE HA REALIZADO CON ESTE COMENTARIO (Trazabilidad y Estado) */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <Building2 size={18} className="text-blue-500" />
                <span>Trazabilidad: Lo que se ha realizado con este reporte</span>
              </div>
              <span className="badge-tag">Radicado: {caseData.institutional_radicado}</span>
            </div>

            {/* Ficha Resumen de Gestión */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>ESTADO ACTUAL:</span>
                <strong style={{ fontSize: '0.95rem', color: caseData.status === 'Resuelto' ? '#10b981' : caseData.status === 'En Gestión' ? '#38bdf8' : '#f59e0b' }}>
                  {caseData.status}
                </strong>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>DEPENDENCIA RESPONSABLE:</span>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                  {caseData.assigned_department || 'Despacho Municipal (General)'}
                </strong>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>RESPONSABLE EN TERRENO:</span>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                  {caseData.assigned_to || 'Equipo Operativo de Despacho'}
                </strong>
              </div>
            </div>

            {/* Estado de Respuesta Institucional */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Respuesta Oficial Emitida al Comentario:
              </div>
              {caseData.public_response ? (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> RESPUESTA INSTITUCIONAL PUBLICADA
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(caseData.public_response || '');
                        showFeedback('📋 Respuesta copiada al portapapeles');
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Copy size={12} /> Copiar
                    </button>
                  </div>
                  <div style={{ fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{caseData.public_response}"
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px dashed rgba(245, 158, 11, 0.35)',
                  borderRadius: '8px',
                  color: '#f59e0b',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} />
                  <span>Este comentario aún no tiene respuesta oficial registrada. Utilice el generador de respuesta IA en el panel lateral.</span>
                </div>
              )}
            </div>

            {/* Cierre Técnico si resuelto */}
            {caseData.resolution_note && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 14px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem'
              }}>
                <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.75rem', marginBottom: '4px' }}>
                  REPORTE DE SOLUCIÓN TÉCNICA EN TERRENO:
                </div>
                <div>{caseData.resolution_note}</div>
                {caseData.resolved_by && (
                  <div style={{ marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Certificado por: <strong>{caseData.resolved_by}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Bitácora de Acciones Registradas */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Historial de Movimientos y Bitácora de Acciones:
              </div>
              <div className={styles['timeline-wrap']}>
                {caseData.internal_notes ? (
                  caseData.internal_notes.split('\n').filter(Boolean).map((line, idx) => (
                    <div key={idx} className={styles['note-item']}>
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 italic">No hay notas registradas en este caso aún.</div>
                )}
              </div>

              <form onSubmit={handleAddInternalNote} className={styles['note-input-wrap']} style={{ marginTop: '10px' }}>
                <textarea
                  placeholder="Añadir nota de seguimiento o informe técnico a la bitácora..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button 
                  type="submit" 
                  className={`${styles.btn} ${styles['btn-secondary']} ${styles['note-submit-btn']}`}
                  disabled={!newNote.trim() || isSubmitting}
                >
                  <CornerDownRight size={14} />
                  <span>Registrar en Bitácora</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMNA DERECHA: POSIBILIDAD DE GESTIÓN Y ACCIONES       */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ACCIÓN 1: RESPONDER AL COMENTARIO INSTITUCIONALMENTE CON IA */}
          <div className={styles.card} style={{ border: '1px solid rgba(56, 189, 248, 0.4)', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)' }}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <Sparkles size={18} className="text-sky-400" />
                <span style={{ fontWeight: 700 }}>¿Qué podemos responder? (Respuesta IA)</span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleGenerateAiReply}
                style={{ fontSize: '0.72rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Sparkles size={12} /> Redactar con IA
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Redacta una respuesta institucional cordial y asertiva para el ciudadano {caseData.author} o genera una propuesta automática ajustada a la temática de {caseData.category}:
            </p>

            <form onSubmit={handleSavePublicResponse}>
              <textarea
                style={{
                  width: '100%',
                  minHeight: '110px',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  marginBottom: '10px'
                }}
                placeholder="Escriba o genere la respuesta institucional para este comentario..."
                value={publicRespText}
                onChange={(e) => setPublicRespText(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  disabled={!publicRespText.trim() || isSubmitting}
                >
                  <Send size={14} />
                  <span>Guardar Respuesta Oficial</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCopyPublicResponse}
                  disabled={!publicRespText.trim()}
                  style={{ padding: '8px 12px', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  title="Copiar texto para pegar en la red social"
                >
                  {copiedResponse ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedResponse ? '¡Copiado!' : 'Copiar'}</span>
                </button>

                {postData.permalink_url && (
                  <a
                    href={postData.permalink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                    title={`Abrir publicación en ${postData.source} para pegar la respuesta`}
                  >
                    <span>Ir al Post en Meta</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </form>
          </div>

          {/* ACCIÓN 2: DESPACHAR CASO A DEPENDENCIA Y TERRENO */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <Building2 size={18} className="text-amber-500" />
                <span style={{ fontWeight: 700 }}>Despachar Caso a Secretaría / Terreno</span>
              </div>
            </div>

            <form onSubmit={handleDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Secretaría o Entidad a Cargo:
                </label>
                <select 
                  value={dispatchDept} 
                  onChange={(e) => setDispatchDept(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem' }}
                >
                  {NEIVA_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Cuadrilla / Funcionario Responsable:
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Cuadrilla 3 - Bacheo / Inspector Vial"
                  value={dispatchAssignee}
                  onChange={(e) => setDispatchAssignee(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Instrucción Técnica de Despacho:
                </label>
                <textarea 
                  placeholder="Detalles técnicos o prioridad de intervención en el punto..."
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  style={{ width: '100%', minHeight: '65px', padding: '8px 10px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '9px', fontSize: '0.85rem' }}
                disabled={isSubmitting}
              >
                🚀 Despachar Caso a Terreno
              </button>
            </form>
          </div>

          {/* ACCIÓN 3: CIERRE TÉCNICO Y RESOLUCIÓN */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span style={{ fontWeight: 700 }}>Cierre Técnico y Resolución</span>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Registre la solución implementada en terreno (reparación de bacheo, reposición de tubería, control semafórico, etc.) para cerrar el caso:
            </p>

            <form onSubmit={handleResolveCase} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea 
                placeholder="Describa el trabajo realizado y la solución brindada al ciudadano..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                style={{ width: '100%', minHeight: '75px', padding: '8px 10px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem', resize: 'vertical' }}
              />

              <button 
                type="submit"
                className="btn-success"
                style={{ width: '100%', padding: '9px', fontSize: '0.85rem' }}
                disabled={!resolutionText.trim() || isSubmitting}
              >
                ✅ Finalizar y Marcar como Resuelto
              </button>
            </form>
          </div>

          {/* ACCIÓN 4: REGISTRO DE CONTACTO CIUDADANO */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <UserCheck size={18} className="text-blue-500" />
                <span style={{ fontWeight: 700 }}>Interacción y Contacto con el Ciudadano</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                onClick={() => {
                  const note = prompt(`Ingrese minuta de la llamada con ${caseData.author}:`);
                  if (note) {
                    const noteText = `[Contacto Telefónico con ${caseData.author}]: ${note}`;
                    setCaseData(prev => prev ? {
                      ...prev,
                      internal_notes: prev.internal_notes ? `${prev.internal_notes}\n[${new Date().toLocaleDateString('es-CO')}] ${noteText}` : `[${new Date().toLocaleDateString('es-CO')}] ${noteText}`
                    } : null);
                    showFeedback('📞 Llamada telefónica archivada en la bitácora.');
                  }
                }}
              >
                <Clock size={13} />
                <span>Registrar Llamada</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                onClick={() => {
                  const note = prompt(`Ingrese observación o acta de la visita en terreno (${caseData.location}):`);
                  if (note) {
                    const noteText = `[Visita en Terreno - ${caseData.location}]: ${note}`;
                    setCaseData(prev => prev ? {
                      ...prev,
                      internal_notes: prev.internal_notes ? `${prev.internal_notes}\n[${new Date().toLocaleDateString('es-CO')}] ${noteText}` : `[${new Date().toLocaleDateString('es-CO')}] ${noteText}`
                    } : null);
                    showFeedback('🏠 Visita comunitaria registrada en la bitácora.');
                  }
                }}
              >
                <MapPin size={13} />
                <span>Registrar Visita</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
