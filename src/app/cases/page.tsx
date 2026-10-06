"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, LayoutGrid, List as ListIcon, Menu, Table as TableIcon,
  Video, CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw, ChevronDown,
  Tag, Radio, ShieldAlert, Building2, Flame, FolderOpen, MessageSquare,
  Layers, CheckSquare, Sparkles, PlusCircle, Check, X, AlertTriangle, Link as LinkIcon
} from 'lucide-react';
import { API } from '@/lib/api/client';
import styles from './cases.module.scss';

export interface RawCommentItem {
  id: string;
  source: 'Facebook' | 'Instagram';
  author: string;
  postTitle: string;
  content: string;
  detectedIntent: string;
  detectedLocation: string;
  referenceStreet: string;
  detectedCategory: string;
  detectedTopic: string;
  detectedProblem: string;
  aiConfidence: number;
  requiresFollowup: boolean;
  possibleCaseMatch: string | null;
  caseMatchTitle?: string;
  similarityPercent?: number;
  metaDirectContactAllowed: boolean;
  dateTime: string;
}

const MOCK_RAW_COMMENTS: RawCommentItem[] = [
  {
    id: 'COMM-101',
    source: 'Facebook',
    author: '@vecinolimonar',
    postTitle: 'Publicación: Plan de Intervención Vial 2026',
    content: 'La calle 39 del barrio Limonar está totalmente destruida, los carros ya no pueden pasar y los taxistas se niegan a entrar.',
    detectedIntent: 'Reporte ciudadano',
    detectedLocation: 'El Limonar (Comuna 6)',
    referenceStreet: 'Calle 39',
    detectedCategory: 'Infraestructura Vial',
    detectedTopic: 'Malla Vial Urbana / Pavimentación',
    detectedProblem: 'Deterioro vial crítico / hueco severo',
    aiConfidence: 93,
    requiresFollowup: true,
    possibleCaseMatch: 'CIV-2026-0184',
    caseMatchTitle: 'Deterioro vial crítico y hundimiento – El Limonar',
    similarityPercent: 91,
    metaDirectContactAllowed: true,
    dateTime: 'Hace 25 min',
  },
  {
    id: 'COMM-102',
    source: 'Instagram',
    author: '@maria_limonar',
    postTitle: 'Reel: Alcaldía en tu Comuna',
    content: 'En el Limonar tenemos el mismo problema con el pavimento, huecos gigantes en la 39 con carrera 28.',
    detectedIntent: 'Queja ciudadana',
    detectedLocation: 'El Limonar (Comuna 6)',
    referenceStreet: 'Calle 39 con Carrera 28',
    detectedCategory: 'Infraestructura Vial',
    detectedTopic: 'Malla Vial Urbana / Pavimentación',
    detectedProblem: 'Deterioro vial crítico / hueco severo',
    aiConfidence: 91,
    requiresFollowup: true,
    possibleCaseMatch: 'CIV-2026-0184',
    caseMatchTitle: 'Deterioro vial crítico y hundimiento – El Limonar',
    similarityPercent: 88,
    metaDirectContactAllowed: true,
    dateTime: 'Hace 38 min',
  },
  {
    id: 'COMM-103',
    source: 'Facebook',
    author: '@transporte_huila',
    postTitle: 'Publicación: Plan de Intervención Vial 2026',
    content: 'Por favor arreglen la vía de la 39 en el Limonar antes de que ocurra una tragedia o bloqueo.',
    detectedIntent: 'Solicitud ciudadana',
    detectedLocation: 'El Limonar (Comuna 6)',
    referenceStreet: 'Calle 39',
    detectedCategory: 'Infraestructura Vial',
    detectedTopic: 'Malla Vial Urbana / Pavimentación',
    detectedProblem: 'Deterioro vial / riesgo de bloqueo vial',
    aiConfidence: 89,
    requiresFollowup: true,
    possibleCaseMatch: 'CIV-2026-0184',
    caseMatchTitle: 'Deterioro vial crítico y hundimiento – El Limonar',
    similarityPercent: 87,
    metaDirectContactAllowed: false,
    dateTime: 'Hace 45 min',
  },
  {
    id: 'COMM-104',
    source: 'Instagram',
    author: '@pedro_neiva',
    postTitle: 'Reel: Alumbrado Navideño y Luminarias',
    content: 'En Ipanema siguen varias luminarias apagadas en la carrera 38, muy oscuro de noche.',
    detectedIntent: 'Reporte ciudadano',
    detectedLocation: 'Ipanema (Comuna 7)',
    referenceStreet: 'Carrera 38',
    detectedCategory: 'Alumbrado Público',
    detectedTopic: 'Alumbrado Público ESIP',
    detectedProblem: 'Falla de luminarias / oscuridad nocturna',
    aiConfidence: 95,
    requiresFollowup: true,
    possibleCaseMatch: 'CASO-008',
    caseMatchTitle: 'Alumbrado LED instalado en parque y ciclo-ruta',
    similarityPercent: 74,
    metaDirectContactAllowed: true,
    dateTime: 'Hace 1 hora',
  },
  {
    id: 'COMM-105',
    source: 'Facebook',
    author: '@veeduria_comuna2',
    postTitle: 'Publicación: Gestión Las Ceibas E.S.P.',
    content: 'Continuamos con baja presión de agua potable en Las Granjas, solicitamos carrotanques urgentes.',
    detectedIntent: 'Queja ciudadana',
    detectedLocation: 'Las Granjas (Comuna 2)',
    referenceStreet: 'Carrera 2da con Calle 64',
    detectedCategory: 'Servicios Públicos',
    detectedTopic: 'Redes de Acueducto Las Ceibas E.S.P.',
    detectedProblem: 'Baja presión de agua / suspensión de servicio',
    aiConfidence: 96,
    requiresFollowup: true,
    possibleCaseMatch: 'CASO-001',
    caseMatchTitle: 'No más abusos con el recibo del agua y cortes',
    similarityPercent: 93,
    metaDirectContactAllowed: false,
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
    id: 'CIV-2026-0184',
    institutional_radicado: 'RAD-INF-2026-0391',
    source: 'Facebook / Instagram',
    author: '@comunidad_limonar',
    priority: 'Alta',
    title: 'Deterioro vial crítico y hundimiento de calzada – El Limonar (Comuna 6)',
    content: 'Falla geotécnica y baches profundos sobre la Calle 39 entre carreras 28 y 30. Afectación severa a rutas de transporte colectivo y riesgo inminente de siniestros viales.',
    category: 'Infraestructura',
    sentiment: 'Indignación',
    location: 'El Limonar - Comuna 6',
    dateTime: '15 Oct 2026, 08:30',
    status: 'En Gestión',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Recupera transitabilidad de vía arterial comunal y desactiva paro de transportadores.',
    impact_if_ignored: 'Riesgo de bloqueo total de la Avenida Max Duque por transporte público.',
    assigned_department: 'Secretaría de Infraestructura y Vías',
    assigned_to: 'Ing. Carlos Dussán - Cuadrilla Malla Vial',
    priority_action: true,
    comments_count: 14,
  },
  {
    id: 'CASO-001',
    institutional_radicado: 'RAD-CEIBAS-2026-0482',
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
    comments_count: 6,
  },
  {
    id: 'CASO-002',
    institutional_radicado: 'RAD-INF-2026-0210',
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
    comments_count: 3,
  },
  {
    id: 'CASO-003',
    institutional_radicado: 'RAD-GOB-2026-0118',
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
    comments_count: 8,
  },
  {
    id: 'CASO-004',
    institutional_radicado: 'RAD-CEIBAS-2026-0511',
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
    comments_count: 7,
  },
  {
    id: 'CASO-005',
    institutional_radicado: 'RAD-SAL-2026-0094',
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
    comments_count: 5,
  },
  {
    id: 'CASO-006',
    institutional_radicado: 'RAD-AMB-2026-0152',
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
    comments_count: 5,
  },
  {
    id: 'CASO-007',
    institutional_radicado: 'RAD-MOV-2026-0310',
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
    comments_count: 4,
  },
  {
    id: 'CASO-008',
    institutional_radicado: 'RAD-INF-2026-0145',
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
    comments_count: 4,
  }
];

export default function CasesPage() {
  const [activeTab, setActiveTab] = useState<'CASES' | 'COMMENTS'>('CASES');
  const [rawComments, setRawComments] = useState(MOCK_RAW_COMMENTS);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>(['COMM-101', 'COMM-102', 'COMM-103']);
  const [groupSuccessMsg, setGroupSuccessMsg] = useState<string | null>(null);

  // Sugerencia de Agrupación Proactiva de IA
  const [aiCluster, setAiCluster] = useState<{
    title: string;
    description: string;
    commentIds: string[];
    suggestedCaseId: string;
    suggestedCaseTitle: string;
    similarityScore: number;
    location: string;
    problem: string;
  } | null>({
    title: 'Deterioro vial crítico en El Limonar (Calle 39)',
    description: 'La IA agrupó 3 comentarios de Facebook e Instagram con alta convergencia territorial y reclamo común.',
    commentIds: ['COMM-101', 'COMM-102', 'COMM-103'],
    suggestedCaseId: 'CIV-2026-0184',
    suggestedCaseTitle: 'Deterioro vial crítico y hundimiento de calzada – El Limonar (Comuna 6)',
    similarityScore: 91,
    location: 'El Limonar (Comuna 6)',
    problem: 'Deterioro vial crítico / hueco severo',
  });

  // Modal de Validación Anti-Duplicados (Human-in-the-loop)
  const [duplicateModalData, setDuplicateModalData] = useState<{
    commentIds: string[];
    matchedCaseId: string;
    matchedCaseTitle: string;
    similarity: number;
    location: string;
    problem: string;
  } | null>(null);

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

  // ─── ACCIÓN: Asociar Comentarios a un Caso Existente (Anti-Duplicidad) ───
  const handleAssociateToCase = (targetCaseId: string, commentIds: string[]) => {
    if (commentIds.length === 0) return;
    
    // Incrementar conteo de comentarios en el caso existente
    setCasesList(prev => prev.map(c => {
      if (c.id === targetCaseId) {
        const currentCount = typeof c.comments_count === 'number' ? c.comments_count : parseInt(c.comments_count || '1', 10);
        return {
          ...c,
          comments_count: currentCount + commentIds.length,
          internal_notes: c.internal_notes 
            ? `${c.internal_notes}\n[${new Date().toLocaleDateString('es-CO')}] [Operador]: Se asociaron ${commentIds.length} comentarios adicionales de Meta a esta problemática.`
            : `[${new Date().toLocaleDateString('es-CO')}] [Operador]: Se asociaron ${commentIds.length} comentarios de Meta.`
        };
      }
      return c;
    }));

    // Remover comentarios asociados de la bandeja entrante
    setRawComments(prev => prev.filter(c => !commentIds.includes(c.id)));
    setSelectedCommentIds([]);
    if (aiCluster && aiCluster.commentIds.every(id => commentIds.includes(id))) {
      setAiCluster(null);
    }
    setDuplicateModalData(null);

    setGroupSuccessMsg(`🔗 ¡${commentIds.length} comentarios asociados exitosamente al caso institucional ${targetCaseId}! Se consolidó la necesidad territorial sin duplicar expedientes.`);
    setTimeout(() => {
      setGroupSuccessMsg(null);
      setActiveTab('CASES');
    }, 2800);
  };

  // ─── VALIDACIÓN: Chequear si existe caso similar antes de crear nuevo ───
  const handleInitiateGroup = (idsToGroup: string[]) => {
    if (idsToGroup.length === 0) return;

    // Analizar si los comentarios coinciden con algún caso abierto
    const commentsToExamine = rawComments.filter(c => idsToGroup.includes(c.id));
    const matchWithOpenCase = commentsToExamine.find(c => Boolean(c.possibleCaseMatch));

    if (matchWithOpenCase && matchWithOpenCase.possibleCaseMatch) {
      // Activar modal de validación anti-duplicación
      setDuplicateModalData({
        commentIds: idsToGroup,
        matchedCaseId: matchWithOpenCase.possibleCaseMatch,
        matchedCaseTitle: matchWithOpenCase.caseMatchTitle || 'Caso Abierto Existente',
        similarity: matchWithOpenCase.similarityPercent || 88,
        location: matchWithOpenCase.detectedLocation,
        problem: matchWithOpenCase.detectedProblem,
      });
    } else {
      // No hay coincidencia previa: crear caso directamente
      handleConfirmCreateIndependentCase(idsToGroup);
    }
  };

  // ─── ACCIÓN: Crear Nuevo Caso CIVIA Consolidado ───
  const handleConfirmCreateIndependentCase = (idsToGroup: string[]) => {
    if (idsToGroup.length === 0) return;
    const newCaseId = `CIV-2026-${String(casesList.length + 1).padStart(4, '0')}`;
    const newRadicado = `RAD-INF-2026-${String(casesList.length + 420).padStart(4, '0')}`;
    const firstComment = rawComments.find(c => idsToGroup.includes(c.id));
    
    const newCase = {
      id: newCaseId,
      institutional_radicado: newRadicado,
      source: 'Facebook / Instagram',
      author: `@${idsToGroup.length}_ciudadanos_neiva`,
      priority: 'Alta',
      title: firstComment ? `${firstComment.detectedProblem} – ${firstComment.detectedLocation}` : 'Problemática Ciudadana Consolidada',
      content: `Consolidación de ${idsToGroup.length} interacciones ciudadanas detectadas en Facebook e Instagram sobre: ${firstComment?.detectedProblem || 'Problemática barrial'} en ${firstComment?.detectedLocation || 'Neiva'} (${firstComment?.referenceStreet || ''}).`,
      category: firstComment?.detectedCategory || 'Infraestructura',
      sentiment: 'Indignación',
      location: firstComment?.detectedLocation || 'Neiva',
      dateTime: 'Justo ahora',
      mediaType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop',
      impact_if_solved: 'Recupera transitabilidad de vía comunal y previene manifestaciones barriales.',
      impact_if_ignored: 'Riesgo de bloqueo vecinal o escalamiento del malestar ciudadano en redes sociales.',
      status: 'Nuevo',
      assigned_department: 'Secretaría de Infraestructura y Vías',
      assigned_to: 'Pendiente asignación por Secretario',
      priority_action: false,
      comments_count: idsToGroup.length,
    };

    setCasesList([newCase, ...casesList]);
    setRawComments(prev => prev.filter(c => !idsToGroup.includes(c.id)));
    setSelectedCommentIds([]);
    if (aiCluster && aiCluster.commentIds.every(id => idsToGroup.includes(id))) {
      setAiCluster(null);
    }
    setDuplicateModalData(null);

    setGroupSuccessMsg(`✨ ¡Nuevo Caso CIVIA ${newCaseId} creado con Radicado ${newRadicado} agrupando ${newCase.comments_count} interacciones!`);
    setTimeout(() => {
      setGroupSuccessMsg(null);
      setActiveTab('CASES');
    }, 2800);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadCases() {
      try {
        const data = await API.cases.getAll();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            institutional_radicado: item.institutional_radicado || `RAD-INF-2026-${item.id.replace(/\D/g, '').slice(-4) || '0042'}`,
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
            comments_count: item.comments_count ? parseInt(item.comments_count, 10) : 1,
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span className={styles['post-id']}>{c.id}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {c.institutional_radicado ? `Rad: ${c.institutional_radicado}` : 'Radicado: Pendiente'}
                      </span>
                    </div>
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
                      <span className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'var(--blue-600)', border: '1px solid rgba(59, 130, 246, 0.25)', fontWeight: 600 }}>
                        💬 {c.comments_count || 1} {c.comments_count === 1 ? 'comentario' : 'comentarios'} Meta
                      </span>
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
          {/* BANNER 1: SUGERENCIA PROACTIVA DE AGRUPACIÓN POR IA */}
          {aiCluster && (
            <div className={styles['ai-cluster-banner']}>
              <div>
                <div className={styles['cluster-title']}>
                  <Sparkles size={18} style={{ color: 'var(--blue-600)' }} />
                  <span>Sugerencia Automática de Agrupación por IA (Motor NLP Neiva)</span>
                  <span className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--blue-600)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    {aiCluster.commentIds.length} interacciones detectadas
                  </span>
                </div>
                <p className={styles['cluster-desc']}>
                  Patrón común detectado: <strong>{aiCluster.title}</strong> en <strong>{aiCluster.location}</strong>.
                  Coincidencia del <strong>{aiCluster.similarityScore}%</strong> con el caso institucional abierto <strong>{aiCluster.suggestedCaseId}</strong>.
                </p>
              </div>

              <div className={styles['cluster-actions']}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleAssociateToCase(aiCluster.suggestedCaseId, aiCluster.commentIds)}
                  style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                >
                  <LinkIcon size={14} />
                  <span>Asociar a {aiCluster.suggestedCaseId} ({aiCluster.similarityScore}%)</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleInitiateGroup(aiCluster.commentIds)}
                  style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                >
                  <PlusCircle size={14} />
                  <span>Crear Nuevo Caso CIVIA</span>
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setAiCluster(null)}
                  style={{ padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  title="Descartar sugerencia"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* BARRA DE CONTROL DE LA MESA */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-muted)', padding: '14px 18px', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: 'var(--blue-600)' }} />
                <span>Mesa de Triaje y Agrupación de Redes (Facebook & Instagram)</span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                CIVIA consolida patrones de conversación ciudadana en casos institucionales únicos. La IA sugiere y el operador valida.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {selectedCommentIds.length} seleccionados
              </span>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleInitiateGroup(selectedCommentIds)}
                disabled={selectedCommentIds.length === 0}
                style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
              >
                <Layers size={16} />
                <span>Agrupar {selectedCommentIds.length > 0 ? `(${selectedCommentIds.length})` : ''} en Caso CIVIA</span>
              </button>
            </div>
          </div>

          {/* LISTADO DE COMENTARIOS CON ANÁLISIS AMPLIADO DE IA */}
          {rawComments.length === 0 ? (
            <div className={styles['empty-state']}>
              <CheckCircle2 size={40} style={{ color: 'var(--emerald-600)', margin: '0 auto 12px' }} />
              <h3>¡Bandeja de comentarios al día!</h3>
              <p>Todos los comentarios entrantes de Facebook e Instagram han sido agrupados en casos o canalizados.</p>
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

                  {/* DESGLOSE DETALLADO DE ANÁLISIS DE IA (CIVIA NLP) */}
                  <div className={styles['ai-meta-grid']}>
                    <div className={styles['ai-meta-item']}>
                      <span>Tema / Entidad</span>
                      <span>{comm.detectedTopic}</span>
                    </div>
                    <div className={styles['ai-meta-item']}>
                      <span>Problema Específico</span>
                      <span>{comm.detectedProblem}</span>
                    </div>
                    <div className={styles['ai-meta-item']}>
                      <span>Ubicación y Referencia</span>
                      <span>{comm.detectedLocation} • {comm.referenceStreet}</span>
                    </div>
                    <div className={styles['ai-meta-item']}>
                      <span>Seguimiento</span>
                      <span style={{ color: comm.requiresFollowup ? 'var(--blue-600)' : 'var(--text-secondary)' }}>
                        {comm.requiresFollowup ? '✓ Requerido' : 'Opcional'}
                      </span>
                    </div>
                  </div>

                  {/* PIE DE COMENTARIO: TAGS, COINCIDENCIAS Y POLÍTICA DE CONTACTO */}
                  <div className={styles['comment-footer']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge-tag" style={{ fontSize: '0.72rem' }}>
                        🎯 {comm.detectedIntent}
                      </span>
                      <span className="badge-tag" style={{ fontSize: '0.72rem' }}>
                        📁 {comm.detectedCategory}
                      </span>
                      
                      {/* Badge y acción rápida de coincidencia con caso existente */}
                      {comm.possibleCaseMatch && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '999px', padding: '2px 8px', fontSize: '0.7rem'
                        }}>
                          <span style={{ color: 'var(--blue-600)', fontWeight: 700 }}>
                            🔗 Coincide con {comm.possibleCaseMatch} ({comm.similarityPercent}%)
                          </span>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '1px 6px', fontSize: '0.65rem', borderRadius: '4px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssociateToCase(comm.possibleCaseMatch!, [comm.id]);
                            }}
                          >
                            Asociar
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.7rem', color: comm.metaDirectContactAllowed ? 'var(--emerald-600)' : 'var(--text-muted)' }}>
                        {comm.metaDirectContactAllowed ? '💬 Ventana Meta activa (24h)' : '🔒 Requiere contacto alternativo (políticas Meta)'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                        <Sparkles size={13} />
                        <span>{comm.aiConfidence}% IA</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* MODAL DE VALIDACIÓN ANTI-DUPLICADOS (HUMAN-IN-THE-LOOP) */}
          {duplicateModalData && (
            <div className={styles['modal-overlay']} onClick={() => setDuplicateModalData(null)}>
              <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
                <div className={styles['modal-header']}>
                  <h3>
                    <AlertTriangle size={20} style={{ color: 'var(--amber-500)' }} />
                    <span>Validación Anti-Duplicados de Casos CIVIA</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDuplicateModalData(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    aria-label="Cerrar modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className={styles['modal-body']}>
                  <p>
                    La IA analizó los <strong>{duplicateModalData.commentIds.length} comentarios</strong> seleccionados y detectó una coincidencia del <strong>{duplicateModalData.similarity}%</strong> con un caso institucional ya existente y abierto en la misma zona:
                  </p>

                  <div style={{ padding: '12px 14px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--blue-500)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {duplicateModalData.matchedCaseId}: {duplicateModalData.matchedCaseTitle}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      📍 Sector: {duplicateModalData.location} • ⚠️ Problema: {duplicateModalData.problem}
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <strong>Regla Central de CIVIA:</strong> Evitar la dispersión de reclamos en tickets duplicados. Al asociar los comentarios, se incrementa el peso de la necesidad y se mantiene una sola trazabilidad institucional.
                  </p>
                </div>

                <div className={styles['modal-footer']}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setDuplicateModalData(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ border: '1px solid var(--border)', fontSize: '0.8125rem' }}
                    onClick={() => handleConfirmCreateIndependentCase(duplicateModalData.commentIds)}
                  >
                    Crear Nuevo Caso Independiente
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleAssociateToCase(duplicateModalData.matchedCaseId, duplicateModalData.commentIds)}
                  >
                    <LinkIcon size={14} />
                    <span>Asociar al Caso {duplicateModalData.matchedCaseId} (Recomendado)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
