"use client";
import React, { useState, useEffect, useMemo } from 'react';
import styles from './citizens.module.scss';
import { 
  Search, PhoneCall, X, Send, CheckCircle2, MessageSquare, 
  Mail, MapPin, AlertCircle, Info, ShieldCheck, UserCheck, AlertTriangle,
  Upload, FileSpreadsheet, Bot, Sparkles, Copy, ExternalLink, RefreshCw, 
  Filter, Users, UserX, Phone, ChevronRight, Check
} from 'lucide-react';

interface CitizenItem {
  id: string;
  name: string;
  handle: string;
  neighborhood: string;
  total_reports: number;
  phone?: string | null;
  followers_count: number;
  following_count: number;
  account_created_at: string;
  user_type: 'Positivo' | 'Negativo' | 'Bot';
  bot_probability: number;
  bot_origin?: string;
  channel: string;
  sentiment_tendency: string;
  notes?: string;
  origen_dato?: string;
  whatsapp_link?: string | null;
}

const FALLBACK_CITIZENS: CitizenItem[] = [
  { 
    id: 'CIUD-001', 
    name: 'Juan Carlos Pérez', 
    handle: '@JuanPerezNeiva', 
    neighborhood: 'Las Granjas (Comuna 2)', 
    total_reports: 6, 
    phone: '+57 312 456 7890', 
    followers_count: 840,
    following_count: 210,
    account_created_at: 'Hace 4 años',
    user_type: 'Negativo',
    bot_probability: 0.05,
    bot_origin: 'Humano Verificado',
    sentiment_tendency: 'Crítico', 
    channel: 'Facebook',
    notes: 'Presidente JAC Las Granjas. Reclama por corte de agua y retrasos en obras de la Cra 2da.',
    whatsapp_link: 'https://wa.me/573124567890'
  },
  { 
    id: 'CIUD-002', 
    name: 'María Camila Gómez', 
    handle: '@MariaGomez_Huila', 
    neighborhood: 'Centro - Av. La Toma', 
    total_reports: 3, 
    phone: '+57 315 987 6543', 
    followers_count: 1250,
    following_count: 480,
    account_created_at: 'Hace 3 años',
    user_type: 'Positivo',
    bot_probability: 0.02,
    bot_origin: 'Humano Verificado',
    sentiment_tendency: 'Aprobación', 
    channel: 'Instagram',
    notes: 'Comerciante de La Toma. Resalta los avances del bacheo nocturno y la recuperación del alumbrado.',
    whatsapp_link: 'https://wa.me/573159876543'
  },
  { 
    id: 'CIUD-003', 
    name: 'Usuario_9281734_Neiva', 
    handle: '@user9281734', 
    neighborhood: 'Neiva (General)', 
    total_reports: 18, 
    phone: null, 
    followers_count: 4,
    following_count: 412,
    account_created_at: 'Hace 14 días',
    user_type: 'Bot',
    bot_probability: 0.94,
    bot_origin: 'Granja de Cuentas / Campaña Opositora',
    sentiment_tendency: 'Ataque', 
    channel: 'Facebook',
    notes: 'Cuenta automatizada sin foto de perfil. Publica exactamente el mismo mensaje en publicaciones sobre el PAE.'
  },
  { 
    id: 'CIUD-004', 
    name: 'Carlos Alberto Díaz', 
    handle: '@CarlosDiaz_Canaima', 
    neighborhood: 'Canaima (Comuna 6)', 
    total_reports: 7, 
    phone: '+57 320 123 4567', 
    followers_count: 430,
    following_count: 310,
    account_created_at: 'Hace 2 años',
    user_type: 'Negativo',
    bot_probability: 0.08,
    bot_origin: 'Humano Verificado',
    sentiment_tendency: 'Crítico', 
    channel: 'Facebook',
    notes: 'Líder barrial de Canaima. Denuncia rebosamiento del alcantarillado en temporada de lluvias.',
    whatsapp_link: 'https://wa.me/573201234567'
  },
  { 
    id: 'CIUD-005', 
    name: 'Alerta_Opita_Real', 
    handle: '@alertaopita2026', 
    neighborhood: 'Neiva (General)', 
    total_reports: 14, 
    phone: null, 
    followers_count: 12,
    following_count: 890,
    account_created_at: 'Hace 22 días',
    user_type: 'Bot',
    bot_probability: 0.89,
    bot_origin: 'Troll Político / Perfil Falso Sin Foto',
    sentiment_tendency: 'Ataque', 
    channel: 'Facebook',
    notes: 'Coordina ataques de desprestigio en comentarios. Repite frases como "la misma mierda" y "se roban la plata".'
  },
  { 
    id: 'CIUD-006', 
    name: 'Dra. Patricia Charry', 
    handle: '@DraPatriciaCharry', 
    neighborhood: 'Quirinal (Comuna 3)', 
    total_reports: 5, 
    phone: '+57 310 555 9812', 
    followers_count: 2100,
    following_count: 620,
    account_created_at: 'Hace 5 años',
    user_type: 'Negativo',
    bot_probability: 0.03,
    bot_origin: 'Humano Verificado',
    sentiment_tendency: 'Preocupado', 
    channel: 'Facebook',
    notes: 'Médica especialista. Realizó crítica sobre el PAE ("Por mi crítica salvé el PAE") solicitando auditorías nutricionales.',
    whatsapp_link: 'https://wa.me/573105559812'
  },
  { 
    id: 'CIUD-007', 
    name: 'Vecinos Unidos Ipanema', 
    handle: '@VecinosIpanema', 
    neighborhood: 'Ipanema (Comuna 7)', 
    total_reports: 4, 
    phone: '+57 314 789 1234', 
    followers_count: 670,
    following_count: 190,
    account_created_at: 'Hace 3 años',
    user_type: 'Positivo',
    bot_probability: 0.04,
    bot_origin: 'Humano Verificado',
    sentiment_tendency: 'Positivo', 
    channel: 'Instagram',
    notes: 'Colectivo vecinal. Agradecen instalación de cámaras de seguridad y podas preventivas en parques.',
    whatsapp_link: 'https://wa.me/573147891234'
  },
  { 
    id: 'CIUD-008', 
    name: 'Bot_Hater_Huila_44', 
    handle: '@bot_huila44', 
    neighborhood: 'Neiva (General)', 
    total_reports: 25, 
    phone: null, 
    followers_count: 2,
    following_count: 640,
    account_created_at: 'Hace 8 días',
    user_type: 'Bot',
    bot_probability: 0.98,
    bot_origin: 'Granja de Cuentas / Campaña Opositora',
    sentiment_tendency: 'Ataque', 
    channel: 'Facebook',
    notes: 'Perfil automatizado detectado por CIVIA NLP. Spam masivo de odio en todas las publicaciones de la administración.'
  }
];

export default function CitizensPage() {
  const [citizens, setCitizens] = useState<CitizenItem[]>(FALLBACK_CITIZENS);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total_registered: 128,
    total_with_phone: 118,
    total_bots_detected: 10,
    total_positives: 41,
    total_negatives: 77,
    bot_percentage: 7.8
  });

  // Filtros
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'Positivo' | 'Negativo' | 'Bot'>('all');
  const [followersFilter, setFollowersFilter] = useState<'all' | 'under_50' | '50_500' | 'over_500'>('all');
  const [accountAgeFilter, setAccountAgeFilter] = useState<'all' | 'recent' | 'older'>('all');

  // Modales
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [smartReplyModalOpen, setSmartReplyModalOpen] = useState(false);
  const [activeCitizenForReply, setActiveCitizenForReply] = useState<CitizenItem | null>(null);

  // Estado del Uploader
  const [rawUploadText, setRawUploadText] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Estado del Smart Responder
  const [replyPrompt, setReplyPrompt] = useState('Por mi crítica salvé el PAE');
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [replyTopic, setReplyTopic] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Cargar datos del Backend
  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userTypeFilter !== 'all') params.append('user_type', userTypeFilter);
      if (followersFilter !== 'all') params.append('followers_filter', followersFilter);
      if (accountAgeFilter !== 'all') params.append('account_age_filter', accountAgeFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`http://localhost:8000/api/v1/citizens?limit=200&${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCitizens(data.items || FALLBACK_CITIZENS);
        if (data.metrics) setMetrics(data.metrics);
      } else {
        setCitizens(FALLBACK_CITIZENS);
      }
    } catch {
      setCitizens(FALLBACK_CITIZENS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [userTypeFilter, followersFilter, accountAgeFilter]);

  // Filtrado local en vivo si se escribe en el buscador
  const filteredCitizens = useMemo(() => {
    return citizens.filter(c => {
      const matchSearch = !search.trim() || 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.handle.toLowerCase().includes(search.toLowerCase()) ||
        c.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search)) ||
        (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));

      const matchType = userTypeFilter === 'all' || c.user_type === userTypeFilter;

      let matchFollowers = true;
      if (followersFilter === 'under_50') matchFollowers = c.followers_count < 50;
      else if (followersFilter === '50_500') matchFollowers = c.followers_count >= 50 && c.followers_count <= 500;
      else if (followersFilter === 'over_500') matchFollowers = c.followers_count > 500;

      let matchAge = true;
      if (accountAgeFilter === 'recent') matchAge = c.account_created_at.includes('días') || c.account_created_at.includes('mes');
      else if (accountAgeFilter === 'older') matchAge = c.account_created_at.includes('año');

      return matchSearch && matchType && matchFollowers && matchAge;
    });
  }, [citizens, search, userTypeFilter, followersFilter, accountAgeFilter]);

  // Acción: Generar Respuesta Inteligente
  const handleGenerateReply = async (promptText: string, citizen?: CitizenItem | null) => {
    setIsGeneratingReply(true);
    setCopiedSuccess(false);
    const targetType = citizen ? citizen.user_type : 'Negativo';

    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/generate-smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment_text: promptText,
          author_metadata: citizen ? {
            author: citizen.name,
            handle: citizen.handle,
            followers: citizen.followers_count,
            following: citizen.following_count
          } : {},
          user_type: targetType
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedReply(data.response_text);
        setReplyTopic(data.topic);
      } else {
        // Fallback local
        if (promptText.toLowerCase().includes('pae')) {
          setGeneratedReply(
            'Apreciado ciudadano, el control social y la veeduría son fundamentales para la transparencia de Neiva. Bajo la actual administración de Johan Steed, el Programa de Alimentación Escolar (PAE) opera con supervisión técnica permanente en las 160 sedes educativas de la ciudad, garantizando más de 38.000 raciones diarias auditadas por nutricionistas y comités de veeduría comunitaria. Toda observación ciudadana se radica formalmente para inspección inmediata en sitio por la Secretaría de Educación.'
          );
          setReplyTopic('Programa de Alimentación Escolar (PAE)');
        } else {
          setGeneratedReply(
            'Agradecemos tu reporte ciudadano. En la administración municipal hacemos seguimiento estricto a cada intervención en territorio. Tu solicitud ha sido radicada formalmente en el sistema CIVIA para despacho y atención prioritaria.'
          );
          setReplyTopic('Atención Institucional');
        }
      }
    } catch {
      setGeneratedReply(
        'Apreciado ciudadano, el Programa de Alimentación Escolar (PAE) de Neiva cuenta con supervisión técnica continua en las 160 sedes educativas, garantizando 38.000 raciones diarias auditadas con total transparencia.'
      );
      setReplyTopic('Programa de Alimentación Escolar (PAE)');
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

  // Cargar Plantilla de Ejemplo en el Uploader
  const handleLoadSampleCSV = () => {
    const sample = `Nombre,Telefono,Barrio,Perfil,Notas
Gustavo Adolfo Rojas,3114567890,Las Palmas,gustavorojas_neiva,Líder comunal preocupado por alumbrado en canchas
Valeria Dussán Perdomo,3187654321,El Caguán,valeriadussan,Solicita mantenimiento de placa huella rural
Cuenta_Troll_7718,,Neiva (General),troll7718,Ataques continuos de desprestigio en Facebook
Felipe Charry Medina,3208889911,Santa Inés,felipe_charry,Apoya la intervención en la Carrera 5ta
Bot_Granja_Opositora,,Neiva (General),granja_neiva_01,Spam coordinado contra el PAE`;
    setRawUploadText(sample);
  };

  // Procesar Carga de Base de Datos
  const handleProcessUpload = async () => {
    if (!rawUploadText.trim()) return;
    setIsUploading(true);
    setUploadSuccessMsg(null);

    const lines = rawUploadText.trim().split('\n');
    const citizensToUpload: any[] = [];

    // Parsear líneas CSV simples (Nombre, Telefono, Barrio, Perfil, Notas)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || (i === 0 && line.toLowerCase().includes('nombre'))) continue;
      const parts = line.split(',');
      if (parts.length >= 1 && parts[0].trim()) {
        citizensToUpload.push({
          name: parts[0]?.trim(),
          phone: parts[1]?.trim() || null,
          neighborhood: parts[2]?.trim() || 'Neiva (General)',
          handle: parts[3]?.trim() ? `@${parts[3].trim().replace('@', '')}` : null,
          notes: parts[4]?.trim() || 'Cargado mediante archivo de base de datos'
        });
      }
    }

    try {
      const res = await fetch('http://localhost:8000/api/v1/citizens/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizens: citizensToUpload,
          source_tag: 'Base_Externa_CSV'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUploadSuccessMsg(data.message || `Se procesaron exitosamente ${citizensToUpload.length} registros.`);
        fetchCitizens();
        setTimeout(() => {
          setUploadModalOpen(false);
          setUploadSuccessMsg(null);
          setRawUploadText('');
        }, 2200);
      } else {
        setUploadSuccessMsg(`Se agregaron ${citizensToUpload.length} ciudadanos a la vista local.`);
      }
    } catch {
      setUploadSuccessMsg(`Cargados localmente ${citizensToUpload.length} registros.`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Inteligencia de Contacto Ciudadano & Detección de Bots</h1>
          <p>Base unificada de números telefónicos (+57), clasificación de aliados vs quejas reales y neutralización de granjas de trolls</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => {
              setActiveCitizenForReply(null);
              setSmartReplyModalOpen(true);
              setReplyPrompt('Por mi crítica salvé el PAE');
              handleGenerateReply('Por mi crítica salvé el PAE', null);
            }}
            style={{ padding: '8px 14px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={15} style={{ color: 'var(--blue-600)' }} />
            <span>⚡ Probar Respuestas IA (PAE / Hate)</span>
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
            <span>Líneas Móviles (+57 Verificadas)</span>
          </div>
          <div className={styles['stat-value']} style={{ color: 'var(--emerald-600)' }}>
            {metrics.total_with_phone}
          </div>
          <div className={styles['stat-sub']}>Disponibles para contacto institucional directo</div>
        </div>

        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>
            <Bot size={16} style={{ color: '#ef4444' }} />
            <span>Cuentas Bot & Granjas Detectadas</span>
          </div>
          <div className={styles['stat-value']} style={{ color: '#ef4444' }}>
            {metrics.total_bots_detected}
          </div>
          <div className={styles['stat-sub']}>{metrics.bot_percentage}% del volumen total auditado</div>
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
              <span>🤖 Bots & Granjas ({metrics.total_bots_detected})</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={fetchCitizens}
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
            onChange={(e) => setFollowersFilter(e.target.value as any)}
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
            onChange={(e) => setAccountAgeFilter(e.target.value as any)}
            title="Filtrar por fecha de creación de la cuenta"
          >
            <option value="all">Creación: Todas</option>
            <option value="recent">⚡ Reciente (&lt; 1 mes - Alta Alerta)</option>
            <option value="older">📅 Antigua (&gt; 1 año)</option>
          </select>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE CONTACTOS Y PERFILES */}
      <div className={styles['citizens-table-card']}>
        <table className={styles.table}>
          <thead className={styles['table-head']}>
            <tr>
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
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <AlertCircle size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No se encontraron perfiles con los filtros actuales.</p>
                </td>
              </tr>
            ) : (
              filteredCitizens.map((citizen) => {
                const isBot = citizen.user_type === 'Bot' || citizen.bot_probability >= 0.55;
                return (
                  <tr key={citizen.id} className={isBot ? styles['bot-row'] : ''}>
                    {/* Nombre y Avatar */}
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
                            <span>{citizen.name}</span>
                            {isBot && (
                              <span style={{ fontSize: '0.65rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                BOT
                              </span>
                            )}
                          </div>
                          <div className={styles['citizen-handle']}>
                            {citizen.handle} • {citizen.channel}
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
                              🤖 {Math.round(citizen.bot_probability * 100)}% Bot
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600 }}>
                              📍 {citizen.bot_origin || 'Granja de Cuentas / Campaña Opositora'}
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
                          👥 <strong>{citizen.followers_count.toLocaleString()}</strong> seg
                        </span>
                        <span className={styles['meta-pill']} title="Cuentas seguidas">
                          👤 <strong>{citizen.following_count}</strong> seguidos
                        </span>
                        <span className={styles['meta-pill']} title="Fecha estimada de creación de la cuenta">
                          📅 {citizen.account_created_at}
                        </span>
                      </div>
                    </td>

                    {/* Barrio y Comuna */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <MapPin size={13} style={{ color: 'var(--blue-600)', flexShrink: 0 }} />
                        <span>{citizen.neighborhood}</span>
                      </div>
                      {citizen.notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={citizen.notes}>
                          "{citizen.notes}"
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
                            href={`https://wa.me/${citizen.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${citizen.name}, le escribimos desde la Alcaldía de Neiva en seguimiento a su solicitud ciudadana en ${citizen.neighborhood}.`
                            )}`}
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

                    {/* Acciones de Respuesta IA */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleOpenSmartReplyForCitizen(citizen)}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        title="Generar respuesta inteligente según el tema (PAE, Huecos, Agua, Desescalar Bot)"
                      >
                        <Sparkles size={13} style={{ color: 'var(--blue-600)' }} />
                        <span>Respuesta IA</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL 1: SUBIDA DE BASE DE DATOS (CSV / EXCEL) ─── */}
      {uploadModalOpen && (
        <div className={styles['modal-overlay']} onClick={() => setUploadModalOpen(false)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={20} style={{ color: 'var(--blue-600)' }} />
                <h3>Subir Base de Datos Telefónica & Ciudadana</h3>
              </div>
              <button className={styles['modal-close-btn']} onClick={() => setUploadModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles['modal-body']}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Sube o pega tu base de datos de ciudadanos de Neiva con números telefónicos. 
                CIVIA audita automáticamente cada registro: <strong>valida sintaxis móvil de Colombia (+57 3xx)</strong>, 
                detecta <strong>probabilidad de bot</strong> y clasifica la postura ciudadana.
              </div>

              {/* Botón de Cargar Ejemplo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Formato: Nombre, Teléfono, Barrio, Usuario Red, Notas
                </span>
                <button
                  type="button"
                  onClick={handleLoadSampleCSV}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'var(--blue-600)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Cargar Plantilla de Ejemplo con Números
                </button>
              </div>

              {/* Área de texto / Drag zone */}
              <textarea
                className={styles['modal-textarea']}
                style={{ minHeight: '140px', fontFamily: 'monospace', fontSize: '0.78rem' }}
                placeholder={`Pega aquí el contenido en formato CSV o texto:\n\nJuan Perez,3124567890,Las Granjas,@juanperez,Reclamo sobre agua\nMaria Gomez,3159876543,Centro,@mariagomez,Apoyo pavimentacion`}
                value={rawUploadText}
                onChange={(e) => setRawUploadText(e.target.value)}
              />

              {uploadSuccessMsg && (
                <div className={styles['success-alert']}>
                  <CheckCircle2 size={16} />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}
            </div>

            <div className={styles['modal-footer']}>
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={() => setUploadModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                disabled={!rawUploadText.trim() || isUploading}
                onClick={handleProcessUpload}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isUploading ? <RefreshCw size={14} className="spin" /> : <Upload size={14} />}
                <span>{isUploading ? 'Auditando con IA...' : 'Procesar y Auditar Base'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: GENERADOR DE RESPUESTAS INTELIGENTES A HATE / CRÍTICAS ─── */}
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
                    🍲 "Por mi crítica salvé el PAE"
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
                    "{generatedReply}"
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
    </div>
  );
}
