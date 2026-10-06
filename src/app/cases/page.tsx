"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, LayoutGrid, List as ListIcon, Menu, Table as TableIcon,
  Video, CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw, ChevronDown,
  Tag, Radio, ShieldAlert, Building2, Flame, FolderOpen, MessageSquare,
  Layers, CheckSquare, Sparkles, PlusCircle, Check
} from 'lucide-react';
import { API } from '@/lib/api/client';
import styles from './cases.module.scss';

const MOCK_RAW_COMMENTS = [
  {
    id: 'COMM-101',
    source: 'Facebook' as const,
    author: '@vecinolimonar',
    postTitle: 'Publicación: Plan de Intervención Vial 2026',
    content: 'La calle 39 del barrio Limonar está totalmente destruida, los carros ya no pueden pasar y los taxistas se niegan a entrar.',
    detectedIntent: 'Reporte',
    detectedLocation: 'El Limonar (Comuna 6)',
    detectedCategory: 'Infraestructura Vial',
    aiConfidence: 93,
    dateTime: 'Hace 25 min',
  },
  {
    id: 'COMM-102',
    source: 'Instagram' as const,
    author: '@maria_limonar',
    postTitle: 'Reel: Alcaldía en tu Comuna',
    content: 'En el Limonar tenemos el mismo problema con el pavimento, huecos gigantes en la 39 con carrera 28.',
    detectedIntent: 'Queja',
    detectedLocation: 'El Limonar (Comuna 6)',
    detectedCategory: 'Infraestructura Vial',
    aiConfidence: 91,
    dateTime: 'Hace 38 min',
  },
  {
    id: 'COMM-103',
    source: 'Facebook' as const,
    author: '@transporte_huila',
    postTitle: 'Publicación: Plan de Intervención Vial 2026',
    content: 'Por favor arreglen la vía de la 39 en el Limonar antes de que ocurra una tragedia o bloqueo.',
    detectedIntent: 'Solicitud',
    detectedLocation: 'El Limonar (Comuna 6)',
    detectedCategory: 'Infraestructura Vial',
    aiConfidence: 89,
    dateTime: 'Hace 45 min',
  },
  {
    id: 'COMM-104',
    source: 'Instagram' as const,
    author: '@pedro_neiva',
    postTitle: 'Reel: Alumbrado Navideño y Luminarias',
    content: 'En Ipanema siguen varias luminarias apagadas en la carrera 38, muy oscuro de noche.',
    detectedIntent: 'Reporte',
    detectedLocation: 'Ipanema (Comuna 7)',
    detectedCategory: 'Alumbrado Público',
    aiConfidence: 95,
    dateTime: 'Hace 1 hora',
  },
  {
    id: 'COMM-105',
    source: 'Facebook' as const,
    author: '@veeduria_comuna2',
    postTitle: 'Publicación: Gestión Las Ceibas E.S.P.',
    content: 'Continuamos con baja presión de agua potable en Las Granjas, solicitamos carrotanques urgentes.',
    detectedIntent: 'Queja',
    detectedLocation: 'Las Granjas (Comuna 2)',
    detectedCategory: 'Servicios Públicos',
    aiConfidence: 96,
    dateTime: 'Hace 1 hora',
  },
];

const NEIVA_ENTITIES = [
  'Las Ceibas - Empresas Públicas de Neiva E.S.P.',
  'Secretaría de Infraestructura y Vías',
  'Secretaría de Movilidad y Tránsito',
  'Secretaría de Salud Municipal',
  'Secretaría de Medio Ambiente y Desarrollo Rural',
  'Secretaría de Gobierno y Convivencia Ciudadana',
];

const MOCK_CASES = [
  {
    id: 'CASO-001',
    source: 'Facebook',
    author: '@JuanPerezNeiva',
    priority: 'Alta',
    title: 'No más abusos con el recibo del agua y cortes de Las Ceibas!',
    content: 'Llevamos 4 días sin suministro regular de agua en el barrio Las Granjas (Comuna 2), Las Ceibas E.S.P. no responde y los cobros siguen llegando altísimos. Si no solucionan hoy bloquearemos la Carrera 2da con Calle 64.',
    category: 'Servicios Públicos',
    sentiment: 'Indignación',
    location: 'Las Granjas - Comuna 2',
    dateTime: '15 Oct 2026, 14:30',
    status: 'Pendiente',
    mediaType: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1541888086725-3314f2e51927?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Alivia tensión comunitaria inmediata y previene bloqueo de vía arterial norte en Neiva.',
    impact_if_ignored: 'Riesgo inminente de protesta social frente a la sede de Las Ceibas E.S.P.',
    assigned_department: 'Las Ceibas - Empresas Públicas de Neiva E.S.P.',
    assigned_to: 'Cuadrilla 4 - Redes de Acueducto',
    priority_action: true,
  },
  {
    id: 'CASO-002',
    source: 'Instagram',
    author: '@MariaGomez_Huila',
    priority: 'Baja',
    title: 'Arreglo en Avenida La Toma avanza muy bien',
    content: 'Me parece excelente que la alcaldía esté reparando la calzada de la Avenida La Toma con Carrera 5ta, ya era hora. Ojalá sigan así con el resto de la comuna central.',
    category: 'Infraestructura',
    sentiment: 'Aprobación',
    location: 'Centro - Av. La Toma',
    dateTime: '15 Oct 2026, 09:15',
    status: 'En Gestión',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Genera validación comunitaria positiva y confianza en obras públicas de Neiva.',
    impact_if_ignored: 'Pérdida de oportunidad mediática para posicionar la gestión de infraestructura vial.',
    assigned_department: 'Secretaría de Infraestructura y Vías',
    assigned_to: 'Ing. Carlos Dussán - Cuadrilla Malla Vial',
    priority_action: false,
  },
  {
    id: 'CASO-003',
    source: 'Instagram',
    author: '@NeivaAlerta',
    priority: 'Media',
    title: 'Hurto a mano armada en el sendero del Malecón del Río Magdalena',
    content: 'Asaltaron a varios deportistas en el Malecón cerca del monumento a La Gaitana a plena luz del día. ¿Dónde están los cuadrantes de policía de la Comuna 4?',
    category: 'Seguridad',
    sentiment: 'Preocupación',
    location: 'El Malecón - Comuna 4',
    dateTime: '14 Oct 2026, 18:45',
    status: 'Pendiente',
    mediaType: 'none',
    imageUrl: null,
    impact_if_solved: 'Refuerza percepción de patrullaje y seguridad en el principal eje turístico de Neiva.',
    impact_if_ignored: 'Aumento del temor en turistas y desconfianza en la seguridad urbana.',
    assigned_department: 'Secretaría de Gobierno y Convivencia Ciudadana',
    assigned_to: 'Coronel Cuadrante Malecón / Policía Metropolitana',
    priority_action: false,
  },
  {
    id: 'CASO-004',
    source: 'Facebook',
    author: '@LiderCanaimaNeiva',
    priority: 'Alta',
    title: 'Rebosamiento de aguas residuales e inundación en canaleta barrial',
    content: 'Aguas negras ingresaron a más de 14 casas tras las fuertes lluvias de anoche en Canaima. Riesgo fitosanitario crítico para niños y adultos mayores.',
    category: 'Servicios Públicos',
    sentiment: 'Indignación',
    location: 'Canaima - Comuna 6',
    dateTime: '15 Oct 2026, 15:10',
    status: 'Pendiente',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1541888086725-3314f2e51927?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Despliegue de camión vactor de Las Ceibas y prevención de contingencia sanitaria.',
    impact_if_ignored: 'Protesta comunitaria y plantón sobre la Avenida Max Duque.',
    assigned_department: 'Las Ceibas - Empresas Públicas de Neiva E.S.P.',
    assigned_to: 'Equipo Hidrosucción Vactor 02',
    priority_action: true,
  },
  {
    id: 'CASO-005',
    source: 'Facebook',
    author: '@VeeduriaSaludHuila',
    priority: 'Alta',
    title: 'Colapso en urgencias del Hospital Universitario de Neiva',
    content: 'Pacientes y abuelos esperando más de 7 horas en el Hospital Hernando Moncaleano. No hay insumos suficientes ni camas para pacientes del sur del departamento.',
    category: 'Salud',
    sentiment: 'Alerta',
    location: 'Quirinal - Comuna 3',
    dateTime: '15 Oct 2026, 11:20',
    status: 'En Gestión',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Articulación con Secretaría de Salud Departamental para descongestionar el centro asistencial.',
    impact_if_ignored: 'Crisis hospitalaria y denuncias ante la Superintendencia Nacional de Salud.',
    assigned_department: 'Secretaría de Salud Municipal',
    assigned_to: 'Dra. Lilian Perdomo - Red de Urgencias',
    priority_action: false,
  },
  {
    id: 'CASO-006',
    source: 'Instagram',
    author: '@NeivaSostenible',
    priority: 'Media',
    title: 'Botadero clandestino de escombros en ronda del Río Las Ceibas',
    content: 'Carretilleros y volquetas arrojan desechos de construcción en la ribera del Río Las Ceibas cerca al barrio San Martín. Afecta la cuenca y el entorno escolar.',
    category: 'Medio Ambiente',
    sentiment: 'Preocupación',
    location: 'San Martín / Río Las Ceibas',
    dateTime: '14 Oct 2026, 16:30',
    status: 'Pendiente',
    mediaType: 'none',
    imageUrl: null,
    impact_if_solved: 'Protección de la fuente hídrica vital de Neiva y operativo conjunto con la CAM.',
    impact_if_ignored: 'Taponamiento del cauce hídrico y proliferación de vertederos ilegales.',
    assigned_department: 'Secretaría de Medio Ambiente y Desarrollo Rural',
    assigned_to: 'Inspectora Ambiental Neiva',
    priority_action: false,
  },
  {
    id: 'CASO-007',
    source: 'Facebook',
    author: '@MovilidadNeivaHoy',
    priority: 'Media',
    title: 'Semáforos apagados en intersección de la Avenida Circunvalar',
    content: 'Cruce de la Circunvalar con Calle 21 sin controladores viales. Trancón monumental hacia el norte y alto peligro de siniestros viales.',
    category: 'Movilidad',
    sentiment: 'Alerta',
    location: 'Cándido Leguízamo - Comuna 1',
    dateTime: '15 Oct 2026, 12:00',
    status: 'En Gestión',
    mediaType: 'none',
    imageUrl: null,
    impact_if_solved: 'Restablecimiento de la fluidez en el corredor norte hacia el puente Santander.',
    impact_if_ignored: 'Colapso vehicular en hora pico y siniestros con motociclistas.',
    assigned_department: 'Secretaría de Movilidad y Tránsito',
    assigned_to: 'Técnicos de Semaforización Neiva',
    priority_action: false,
  },
  {
    id: 'CASO-008',
    source: 'Instagram',
    author: '@VecinosIpanema',
    priority: 'Baja',
    title: 'Alumbrado LED instalado en parque y ciclo-ruta',
    content: 'Agradecemos a la administración por el cambio a luminarias LED en las zonas verdes de Ipanema. El sector quedó mucho más seguro para hacer deporte en la noche.',
    category: 'Infraestructura',
    sentiment: 'Positivo',
    location: 'Ipanema - Comuna 7',
    dateTime: '14 Oct 2026, 20:15',
    status: 'Resuelto',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Incrementa la satisfacción ciudadana y el uso seguro de espacios deportivos nocturnos.',
    impact_if_ignored: 'Sin riesgo inmediato.',
    assigned_department: 'Secretaría de Infraestructura y Vías',
    assigned_to: 'Alumbrado Público Neiva (ESIP)',
    priority_action: false,
  }
];

export default function CasesPage() {
  const [activeTab, setActiveTab] = useState<'CASES' | 'COMMENTS'>('CASES');
  const [rawComments, setRawComments] = useState(MOCK_RAW_COMMENTS);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>(['COMM-101', 'COMM-102', 'COMM-103']);
  const [groupSuccessMsg, setGroupSuccessMsg] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'card' | 'compact' | 'list' | 'table'>('card');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterPriorityOnly, setFilterPriorityOnly] = useState<boolean>(false);
  const [casesList, setCasesList] = useState<any[]>(MOCK_CASES);

  const toggleSelectComment = (id: string) => {
    setSelectedCommentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGroupSelected = () => {
    if (selectedCommentIds.length === 0) return;
    const newCaseId = `CIV-2026-${String(casesList.length + 1).padStart(4, '0')}`;
    const newCase = {
      id: newCaseId,
      source: 'Facebook / Instagram',
      author: `@${selectedCommentIds.length}_ciudadanos_neiva`,
      priority: 'Alta',
      title: 'Deterioro vial y riesgo de movilidad – El Limonar (Comuna 6)',
      content: `Agrupación de ${selectedCommentIds.length} reportes ciudadanos similares recibidos por redes Meta denunciando deterioro crítico del pavimento en la Calle 39 con Carrera 28.`,
      category: 'Infraestructura',
      sentiment: 'Indignación',
      location: 'El Limonar - Comuna 6',
      dateTime: 'Justo ahora',
      mediaType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop',
      impact_if_solved: 'Recupera transitabilidad de vía arterial comunal y desactiva plantón ciudadano.',
      impact_if_ignored: 'Riesgo de bloqueo de la Avenida Max Duque por transporte público.',
      status: 'Nuevo',
      assigned_department: 'Secretaría de Infraestructura y Vías',
      assigned_to: 'Pendiente asignación por Secretario',
      priority_action: false,
      comments_count: selectedCommentIds.length,
    };
    setCasesList([newCase, ...casesList]);
    setRawComments(rawComments.filter(c => !selectedCommentIds.includes(c.id)));
    setSelectedCommentIds([]);
    setGroupSuccessMsg(`¡Caso ${newCaseId} creado exitosamente agrupando ${newCase.comments_count} comentarios de Meta!`);
    setTimeout(() => {
      setGroupSuccessMsg(null);
      setActiveTab('CASES');
    }, 2200);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadCases() {
      try {
        const data = await API.cases.getAll();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            source: item.source,
            author: item.author,
            priority: item.priority,
            title: item.title,
            content: item.content,
            category: item.category,
            sentiment: item.sentiment,
            location: item.location,
            dateTime: item.date_time || item.dateTime,
            mediaType: item.media_type || item.mediaType || 'none',
            imageUrl: item.image_url || item.imageUrl,
            impact_if_solved: item.impact_if_solved,
            impact_if_ignored: item.impact_if_ignored,
            status: item.status || 'Pendiente',
            assigned_department: item.assigned_department,
            assigned_to: item.assigned_to,
            priority_action: item.priority_action || false,
          }));
          setCasesList(formatted);
        }
      } catch (err) {
        console.warn('Backend offline o usando datos locales:', err);
      }
    }
    loadCases();
    return () => { isMounted = false; };
  }, []);

  const filteredCases = useMemo(() => {
    return casesList.filter(c => {
      const matchesSearch = 
        !search || 
        c.title.toLowerCase().includes(search.toLowerCase()) || 
        c.content.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        (c.author && c.author.toLowerCase().includes(search.toLowerCase())) ||
        (c.assigned_department && c.assigned_department.toLowerCase().includes(search.toLowerCase()));

      const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
      const matchesSource = filterSource === 'all' || c.source === filterSource;
      const matchesStatus = filterStatus === 'all' || (c.status && c.status === filterStatus);
      const matchesDept = filterDepartment === 'all' || (c.assigned_department && c.assigned_department.includes(filterDepartment));
      const matchesPriorityOnly = !filterPriorityOnly || Boolean(c.priority_action);

      return matchesSearch && matchesPriority && matchesCategory && matchesSource && matchesStatus && matchesDept && matchesPriorityOnly;
    });
  }, [casesList, search, filterPriority, filterCategory, filterSource, filterStatus, filterDepartment, filterPriorityOnly]);

  const handleResetFilters = () => {
    setSearch('');
    setFilterPriority('all');
    setFilterCategory('all');
    setFilterSource('all');
    setFilterStatus('all');
    setFilterDepartment('all');
    setFilterPriorityOnly(false);
  };

  const hasActiveFilters = 
    search !== '' || 
    filterPriority !== 'all' || 
    filterCategory !== 'all' || 
    filterSource !== 'all' || 
    filterStatus !== 'all' || 
    filterDepartment !== 'all' || 
    filterPriorityOnly;

  const getPriorityBadge = (priority: string) => {
    if (priority === 'Alta') return 'badge-alta';
    if (priority === 'Media') return 'badge-media';
    return 'badge-baja';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Resuelto') return 'badge-baja';
    if (status === 'En Gestión') return 'badge-blue';
    return 'badge-media';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gestión de Interacciones y Casos Ciudadanos</h1>
        <p>Transformación de comentarios Meta (Facebook & Instagram) en casos y necesidades comunales de Neiva</p>
      </div>

      {/* Tabs Principales de la Bandeja */}
      <div className={styles['view-tabs']}>
        <button
          type="button"
          className={[styles['view-tab-btn'], activeTab === 'CASES' ? styles.active : ''].join(' ')}
          onClick={() => setActiveTab('CASES')}
        >
          <FolderOpen size={16} />
          <span>Casos y Necesidades Consolidadas ({casesList.length})</span>
        </button>
        <button
          type="button"
          className={[styles['view-tab-btn'], activeTab === 'COMMENTS' ? styles.active : ''].join(' ')}
          onClick={() => setActiveTab('COMMENTS')}
        >
          <MessageSquare size={16} />
          <span>Bandeja de Comentarios Meta ({rawComments.length} entrantes)</span>
        </button>
      </div>

      {groupSuccessMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--emerald-600)', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{groupSuccessMsg}</span>
        </div>
      )}

      {activeTab === 'CASES' ? (
        <>
          <div className={styles.toolbar}>
        <div className={styles.controls}>
          {/* Búsqueda */}
          <div className={styles['search-wrap']}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar por palabra clave, barrio, secretaría o caso..." 
              className={styles['search-input']} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Dropdown de Prioridad */}
          <div className={[styles['filter-dropdown-wrap'], filterPriority !== 'all' ? styles.active : ''].join(' ')}>
            <Filter size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              title="Filtrar por nivel de prioridad"
            >
              <option value="all">Prioridad: Todos</option>
              <option value="Alta">🔴 Alta</option>
              <option value="Media">🟡 Media</option>
              <option value="Baja">🟢 Baja</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Dependencia / Entidad */}
          <div className={[styles['filter-dropdown-wrap'], filterDepartment !== 'all' ? styles.active : ''].join(' ')}>
            <Building2 size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterDepartment} 
              onChange={(e) => setFilterDepartment(e.target.value)}
              title="Filtrar por dependencia de Neiva"
            >
              <option value="all">Entidad: Todas</option>
              {NEIVA_ENTITIES.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Categoría */}
          <div className={[styles['filter-dropdown-wrap'], filterCategory !== 'all' ? styles.active : ''].join(' ')}>
            <Tag size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              title="Filtrar por categoría del problema"
            >
              <option value="all">Categoría: Todas</option>
              <option value="Servicios Públicos">Servicios Públicos</option>
              <option value="Infraestructura">Infraestructura</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Salud">Salud</option>
              <option value="Movilidad">Movilidad</option>
              <option value="Medio Ambiente">Medio Ambiente</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Estado de Gestión */}
          <div className={[styles['filter-dropdown-wrap'], filterStatus !== 'all' ? styles.active : ''].join(' ')}>
            <ShieldAlert size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              title="Filtrar por estado del caso"
            >
              <option value="all">Estado: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Gestión">En Gestión</option>
              <option value="Resuelto">Resuelto</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Filtro Botón Prioridad Alcaldía */}
          <button 
            type="button"
            className={[styles['clear-btn'], filterPriorityOnly ? styles.active : ''].join(' ')}
            style={filterPriorityOnly ? { background: '#fef2f2', borderColor: '#ef4444', color: '#b91c1c' } : {}}
            onClick={() => setFilterPriorityOnly(!filterPriorityOnly)}
            title="Mostrar solo casos con Prioridad Inmediata Alcaldía"
          >
            <Flame size={13} className={filterPriorityOnly ? 'text-red-600' : ''} /> Prioridad Alcaldía
          </button>

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <button 
              className={styles['clear-btn']} 
              onClick={handleResetFilters}
              title="Restablecer todos los filtros"
            >
              <RotateCcw size={13} /> Limpiar
            </button>
          )}

          {/* Contador de casos encontrados */}
          <span className={styles['counter-badge']}>
            {filteredCases.length} {filteredCases.length === 1 ? 'caso' : 'casos'}
          </span>
        </div>

        {/* Selector de vistas */}
        <div className={styles['view-switcher']}>
          <button 
            className={[styles['view-btn'], viewMode === 'card' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('card')}
            title="Vista Detallada"
          >
            <LayoutGrid size={18} /> <span>Detalle</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'compact' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('compact')}
            title="Vista Cuadrícula"
          >
            <Menu size={18} /> <span>Cuadrícula</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'list' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('list')}
            title="Vista Lista"
          >
            <ListIcon size={18} /> <span>Lista</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'table' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('table')}
            title="Vista Tabla"
          >
            <TableIcon size={18} /> <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* Renderizado de Vistas */}
      {viewMode === 'card' && (
        <div>
          {filteredCases.map((c) => (
            <div key={c.id} className={styles['case-card']}>
              <div className={styles['case-card-body']}>
                <div className={styles['case-preview']}>
                  <div className={styles['post-author']}>
                    <div className={styles['post-author-info']}>
                      <div className={styles['post-avatar']}>{c.source.charAt(0)}</div>
                      <div>
                        <div className={styles['post-name']}>{c.author}</div>
                        <div className={styles['post-meta']}>{c.dateTime} • {c.source}</div>
                      </div>
                    </div>
                    <span className={styles['post-id']}>{c.id}</span>
                  </div>
                  <h3 className={styles['post-title']}>{c.title}</h3>
                  <p className={styles['post-content']}>{c.content}</p>

                  {c.imageUrl && (
                    <div className={styles['media-thumb']}>
                      <img src={c.imageUrl} alt={c.title} />
                      {c.mediaType === 'video' && (
                        <div className={styles['media-play']}>
                          <span><Video size={20} /></span>
                        </div>
                      )}
                      <div className={styles['media-label']}>{c.mediaType.toUpperCase()}</div>
                    </div>
                  )}
                </div>

                <div className={styles['case-analysis']}>
                  <div>
                    <div className={styles.tags}>
                      <span className={getPriorityBadge(c.priority)}>Prioridad {c.priority}</span>
                      <span className={getStatusBadge(c.status)}>{c.status}</span>
                      {c.priority_action && (
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171',
                          borderRadius: '999px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 
                        }}>
                          <Flame size={12} /> Prioridad Alcaldía
                        </span>
                      )}
                      {c.assigned_department && (
                        <span className="badge-tag">
                          🏢 {c.assigned_department}
                        </span>
                      )}
                      <span className="badge-tag">{c.location}</span>
                      <span className="badge-tag">{c.category}</span>
                      <span className="badge-blue">Sentimiento: {c.sentiment}</span>
                    </div>

                    <div className={styles['impact-box']}>
                      <div className={styles['impact-title']}>Proyección de Impacto Político</div>
                      <div className={[styles['impact-row'], styles['impact-solved']].join(' ')}>
                        <CheckCircle2 size={16} />
                        <div>
                          <span className={styles['impact-label']}>Si se resuelve: </span>
                          <span className={styles['impact-text']}>{c.impact_if_solved}</span>
                        </div>
                      </div>
                      <div className={[styles['impact-row'], styles['impact-ignore']].join(' ')}>
                        <AlertCircle size={16} />
                        <div>
                          <span className={styles['impact-label']}>Si se ignora: </span>
                          <span className={styles['impact-text']}>{c.impact_if_ignored}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles['case-actions']}>
                    <button className="btn-ghost">Descartar</button>
                    <Link href={'/cases/' + c.id} className="btn-primary">
                      Abrir Caso <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'compact' && (
        <div className={styles['compact-grid']}>
          {filteredCases.map((c) => (
            <div key={c.id} className={styles['compact-card']}>
              {c.imageUrl && (
                <div className={styles['compact-thumb']}>
                  <img src={c.imageUrl} alt={c.title} />
                </div>
              )}
              <div style={{ width: '100%' }}>
                <div className={styles['compact-meta']}>{c.id} • {c.dateTime} • {c.source}</div>
                <h3 className={styles['compact-title']}>{c.title}</h3>
                <p className={styles['compact-text']}>{c.content}</p>
                <div className={styles.tags} style={{ marginTop: '8px' }}>
                  <span className={getPriorityBadge(c.priority)}>{c.priority}</span>
                  <span className={getStatusBadge(c.status)}>{c.status}</span>
                  {c.priority_action && (
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171',
                      borderRadius: '999px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 
                    }}>
                      <Flame size={11} /> Alcaldía
                    </span>
                  )}
                  {c.assigned_department && (
                    <span className="badge-tag">🏢 {c.assigned_department}</span>
                  )}
                  <span className="badge-tag">{c.location}</span>
                </div>
              </div>
              <div className={styles['compact-actions']}>
                <Link href={'/cases/' + c.id} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Abrir Caso <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className={styles['list-container']}>
          {filteredCases.map((c) => (
            <div key={c.id} className={styles['list-row']}>
              <div className={styles['list-thumb']}>
                {c.imageUrl ? <img src={c.imageUrl} alt="" /> : c.source.charAt(0)}
              </div>
              <div className={styles['list-info']}>
                <div className={styles['list-tags']}>
                  <span className={getPriorityBadge(c.priority)}>P. {c.priority}</span>
                  <span className={getStatusBadge(c.status)}>{c.status}</span>
                  {c.priority_action && (
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171',
                      borderRadius: '999px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 
                    }}>
                      <Flame size={11} /> Alcaldía
                    </span>
                  )}
                  <span className="badge-tag">{c.category}</span>
                  <span className="badge-tag">{c.location}</span>
                  {c.assigned_department && (
                    <span className="badge-tag">🏢 {c.assigned_department}</span>
                  )}
                </div>
                <div className={styles['list-title']}>{c.title}</div>
                <div className={styles['list-sub']}>{c.id} • {c.author} • {c.dateTime}</div>
              </div>
              <Link href={'/cases/' + c.id} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                Abrir <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className={styles['table-container']}>
          <table className={styles.table}>
            <thead className={styles['table-head']}>
              <tr>
                <th>ID</th>
                <th>Detalle del Caso</th>
                <th>Dependencia Asignada</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody className={styles['table-body']}>
              {filteredCases.map((c) => (
                <tr key={c.id}>
                  <td className={styles['table-id']}>
                    {c.id}
                    {c.priority_action && (
                      <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        <Flame size={12} /> Alcaldía
                      </div>
                    )}
                  </td>
                  <td>
                    <div className={styles['table-title']}>{c.title}</div>
                    <div className={styles['table-sub']}>{c.author} • {c.location} • {c.dateTime}</div>
                  </td>
                  <td>
                    <span className="badge-tag">
                      {c.assigned_department || 'Sin asignar'}
                    </span>
                  </td>
                  <td><span className={getStatusBadge(c.status)}>{c.status}</span></td>
                  <td><span className={getPriorityBadge(c.priority)}>{c.priority}</span></td>
                  <td>
                    <Link href={'/cases/' + c.id} className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      ) : (
        /* VISTA DE BANDEJA DE COMENTARIOS META (OPERADOR) */
        <div className={styles['comments-workbench']}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-muted)', padding: '14px 18px', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--blue-600)' }} />
                <span>Mesa de Agrupación de Comentarios (Facebook & Instagram)</span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Selecciona comentarios con problemática similar para consolidarlos en un único Caso CIVIA.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {selectedCommentIds.length} seleccionados
              </span>
              <button
                type="button"
                className="btn-primary"
                onClick={handleGroupSelected}
                disabled={selectedCommentIds.length === 0}
                style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
              >
                <Layers size={16} />
                <span>Agrupar {selectedCommentIds.length > 0 ? `(${selectedCommentIds.length})` : ''} en Caso CIVIA</span>
              </button>
            </div>
          </div>

          {rawComments.length === 0 ? (
            <div className={styles['empty-state']}>
              <CheckCircle2 size={40} style={{ color: 'var(--emerald-600)', margin: '0 auto 12px' }} />
              <h3>¡Bandeja de comentarios al día!</h3>
              <p>Todos los comentarios entrantes de Meta han sido agrupados en casos o marcados como atendidos.</p>
            </div>
          ) : (
            rawComments.map(comm => {
              const isSelected = selectedCommentIds.includes(comm.id);
              return (
                <div 
                  key={comm.id} 
                  className={[styles['comment-card'], isSelected ? styles.selected : ''].join(' ')}
                  onClick={() => toggleSelectComment(comm.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles['comment-header']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{comm.author}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {comm.source}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{comm.dateTime}</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Origen: {comm.postTitle}
                  </div>

                  <div className={styles['comment-content']}>
                    "{comm.content}"
                  </div>

                  <div className={styles['comment-footer']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge-tag" style={{ fontSize: '0.72rem' }}>
                        🎯 {comm.detectedIntent}
                      </span>
                      <span className="badge-tag" style={{ fontSize: '0.72rem' }}>
                        📍 {comm.detectedLocation}
                      </span>
                      <span className="badge-tag" style={{ fontSize: '0.72rem' }}>
                        📁 {comm.detectedCategory}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                      <Sparkles size={13} />
                      <span>{comm.aiConfidence}% Confianza IA</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
