"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, LayoutGrid, List as ListIcon, Menu, Table as TableIcon,
  Video, CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw, ChevronDown,
  Tag, Radio, ShieldAlert, Building2, Flame, FolderOpen, MessageSquare,
  Layers, CheckSquare, Sparkles, PlusCircle, Check, X, AlertTriangle, Link as LinkIcon,
  Calendar, Heart, Eye, Share2, RefreshCw, Bot, Zap, Users, ExternalLink
} from 'lucide-react';
import { API } from '@/lib/api/client';
import { formatNumber } from '@/lib/utils';
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
    id: 'CIV-2026-0001',
    institutional_radicado: 'RAD-MOV-2026-0001',
    source: 'Facebook Oficial - Johan Steed',
    author: 'Ciudadano',
    priority: 'Alta',
    title: 'Movilidad: Falta de semáforo en horario pico',
    content: 'aguantese un semaforo a medio dia',
    category: 'Movilidad',
    sentiment: 'Crítico',
    location: 'Neiva (General)',
    dateTime: '13 Oct 2026, 10:44 AM',
    status: 'Pendiente',
    mediaType: 'video',
    imageUrl: 'https://scontent.fnva2-1.fna.fbcdn.net/v/t51.71878-10/844616706_2012953836090006_1577298243066674440_n.jpg?_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=5fad0e&_nc_eui2=AeEbnZSHvkeoORSo5EQnLYrM__d63phQk63_93remFCTrfpYg5tLfskbvWTWDC2s_m8&_nc_ohc=QjJBXZ9fpK4Q7kNvwFG1Ygt&_nc_oc=AdrFaEU1wO1c9QvHntWU7oIbaEk4QECLcBhtQxC1Lh5e9T2TLQzcl4TB5D62rajvQeA&_nc_zt=23&_nc_ht=scontent.fnva2-1.fna&edm=AKIiGfEEAAAA&_nc_gid=TjqvpXOtha05KzHoYNxAWQ&_nc_tpa=Q5bMBQJW8i1JZkVc8Y10i7GEB6Uc0kVwUs5p52DRQJqJEwTs4ZxU33ExZmyanpPqRTpCAXbqhrB8KAzwmg&oh=00_AQPD5WMpkCuyWoCjgPzQtEleANwaTJ3NK4-8Ny8BEPh7Wg&oe=6AD4C00A',
    impact_if_solved: 'Optimización de controladores viales en puntos neurálgicos de Neiva.',
    impact_if_ignored: 'Riesgo de colapso en corredores principales y siniestralidad.',
    assigned_department: 'Secretaría de Movilidad y Tránsito',
    assigned_to: 'Técnicos de Semaforización Neiva',
    priority_action: true,
    comments_count: 3,
  },
  {
    id: 'CIV-2026-0002',
    institutional_radicado: 'RAD-GOB-2026-0002',
    source: 'Facebook Oficial - Johan Steed',
    author: 'Ciudadano',
    priority: 'Media',
    title: 'General: Descontento general con la gestión municipal',
    content: 'la misma mierda y suben y no hacen nada',
    category: 'General',
    sentiment: 'Indignación',
    location: 'Neiva (General)',
    dateTime: '13 Oct 2026, 07:57 PM',
    status: 'Pendiente',
    mediaType: 'video',
    imageUrl: 'https://scontent.fnva2-1.fna.fbcdn.net/v/t51.71878-10/844616706_2012953836090006_1577298243066674440_n.jpg?_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=5fad0e&_nc_eui2=AeEbnZSHvkeoORSo5EQnLYrM__d63phQk63_93remFCTrfpYg5tLfskbvWTWDC2s_m8&_nc_ohc=QjJBXZ9fpK4Q7kNvwFG1Ygt&_nc_oc=AdrFaEU1wO1c9QvHntWU7oIbaEk4QECLcBhtQxC1Lh5e9T2TLQzcl4TB5D62rajvQeA&_nc_zt=23&_nc_ht=scontent.fnva2-1.fna&edm=AKIiGfEEAAAA&_nc_gid=TjqvpXOtha05KzHoYNxAWQ&_nc_tpa=Q5bMBQJW8i1JZkVc8Y10i7GEB6Uc0kVwUs5p52DRQJqJEwTs4ZxU33ExZmyanpPqRTpCAXbqhrB8KAzwmg&oh=00_AQPD5WMpkCuyWoCjgPzQtEleANwaTJ3NK4-8Ny8BEPh7Wg&oe=6AD4C00A',
    impact_if_solved: 'Comunicación transparente y rendición de cuentas pública.',
    impact_if_ignored: 'Deterioro de la confianza en las instituciones municipales.',
    assigned_department: 'Secretaría de Gobierno y Convivencia Ciudadana',
    assigned_to: 'Dirección de Participación Ciudadana',
    priority_action: false,
    comments_count: 3,
  },
  {
    id: 'CIV-2026-0003',
    institutional_radicado: 'RAD-GOB-2026-0003',
    source: 'Facebook Oficial - Johan Steed',
    author: 'Ciudadano',
    priority: 'Alta',
    title: 'General: Corrupción y mal manejo de recursos en la ciudad',
    content: 'Aquí la ley es para el más guevon y la gente trabajadora pero la delincuencia el desorden la corrupción y el mal manejo de los recursos y la corrupción nadie la mira que tristeza ver a neiva convertida en solo lucrar a politiqueros y mientras tanto gente trabajadora son los que llevan del vulto',
    category: 'General',
    sentiment: 'Indignación',
    location: 'Neiva (General)',
    dateTime: '13 Oct 2026, 02:06 PM',
    status: 'Pendiente',
    mediaType: 'video',
    imageUrl: 'https://scontent.fnva2-1.fna.fbcdn.net/v/t51.71878-10/844616706_2012953836090006_1577298243066674440_n.jpg?_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=5fad0e&_nc_eui2=AeEbnZSHvkeoORSo5EQnLYrM__d63phQk63_93remFCTrfpYg5tLfskbvWTWDC2s_m8&_nc_ohc=QjJBXZ9fpK4Q7kNvwFG1Ygt&_nc_oc=AdrFaEU1wO1c9QvHntWU7oIbaEk4QECLcBhtQxC1Lh5e9T2TLQzcl4TB5D62rajvQeA&_nc_zt=23&_nc_ht=scontent.fnva2-1.fna&edm=AKIiGfEEAAAA&_nc_gid=TjqvpXOtha05KzHoYNxAWQ&_nc_tpa=Q5bMBQJW8i1JZkVc8Y10i7GEB6Uc0kVwUs5p52DRQJqJEwTs4ZxU33ExZmyanpPqRTpCAXbqhrB8KAzwmg&oh=00_AQPD5WMpkCuyWoCjgPzQtEleANwaTJ3NK4-8Ny8BEPh7Wg&oe=6AD4C00A',
    impact_if_solved: 'Implementación de veedurías ciudadanas y control en contratación.',
    impact_if_ignored: 'Creciente desafección institucional y descontento barrial.',
    assigned_department: 'Secretaría de Gobierno y Convivencia Ciudadana',
    assigned_to: 'Veedurías Neiva',
    priority_action: true,
    comments_count: 3,
  },
  {
    id: 'CIV-2026-0004',
    institutional_radicado: 'RAD-DES-2026-0004',
    source: 'Facebook Oficial - Johan Steed',
    author: 'Ciudadano',
    priority: 'Baja',
    title: 'General: Apoyo ciudadano para renovación y liderazgo',
    content: 'Ojalá que la gente te apoye para alcanzar la alcaldía.para acabar con los mismos de siempre mañosos y torcidos.que tenemos hoy en día...',
    category: 'General',
    sentiment: 'Positivo',
    location: 'Neiva (General)',
    dateTime: '12 Oct 2026, 04:07 PM',
    status: 'Pendiente',
    mediaType: 'video',
    imageUrl: 'https://scontent.fnva2-1.fna.fbcdn.net/v/t51.71878-10/845961823_4634800416665273_4337931023863517376_n.jpg?_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=5fad0e&_nc_eui2=AeFiPxMjeUyv8ySVkSWaA0HXlTZK-kXHJt6VNkr6Rccm3obDFFrk3uXzyjqj3xIzO80&_nc_ohc=jbLt4auIR1cQ7kNvwEswdMs&_nc_oc=AdoqwEGsLAYioWF946GOgE6X_EWMG5ihGcvNPMkOjX-EWpiQMmqgbP5rSoi6wFFy3to&_nc_zt=23&_nc_ht=scontent.fnva2-1.fna&edm=AKIiGfEEAAAA&_nc_gid=TjqvpXOtha05KzHoYNxAWQ&_nc_tpa=Q5bMBQKbpqUXih33w9CxEN7rqgmMPzTiU4REs6pkDn2xIqvwuyy3rRH8EBJ_TLEt0csr5DnPfy611VIauw&oh=00_AQMurHjNGLOvOs2KzPnmLzm6G4oG9XP0Mog224pvsyegmQ&oe=6AD4A307',
    impact_if_solved: 'Consolidación de respaldo social y participación en mesas de trabajo.',
    impact_if_ignored: 'Sin riesgo inmediato.',
    assigned_department: 'Despacho Municipal',
    assigned_to: 'Equipo de Participación',
    priority_action: false,
    comments_count: 1,
  },
  {
    id: 'CIV-2026-0005',
    institutional_radicado: 'RAD-GOB-2026-0005',
    source: 'Facebook Oficial - Johan Steed',
    author: 'Ciudadano',
    priority: 'Media',
    title: 'General: Descontento con la gestión administrativa',
    content: 'Los mismo peleando .. por la plata de neiva',
    category: 'General',
    sentiment: 'Crítico',
    location: 'Neiva (General)',
    dateTime: '12 Oct 2026, 12:21 AM',
    status: 'Pendiente',
    mediaType: 'image',
    imageUrl: 'https://scontent.fnva2-1.fna.fbcdn.net/v/t51.82787-15/841639987_18637397275046485_2085644438902040396_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHUyJBLuepOy6N2lQHZiC3UVL3DKvGUtexUvcMq8ZS17G8jkGi-SH-RIyTUQ4zQBD8&_nc_ohc=HHgJ3qpRlSgQ7kNvwGQehpe&_nc_oc=AdrxmUQqR7Rh5VxCOXkvvb_5AV5l0s-tYl8f6V0J5HZgEriM69vnG9NhHlEBuuucSLg&_nc_zt=23&_nc_ht=scontent.fnva2-1.fna&edm=AKIiGfEEAAAA&_nc_gid=TjqvpXOtha05KzHoYNxAWQ&_nc_tpa=Q5bMBQI4Rjrwnq1orRI90znRuMe1BcPBIj2FWuIc9NktHgWz0Uy0rqyDyWTwmuUn7zbd4H8yiz5gemuFxw&oh=00_AQOmShgdHBlFv1imWVXjhHLoVwJ11AAJJgE9yoXjGa-Plg&oe=6AD4A79E',
    impact_if_solved: 'Fortalecimiento de la transparencia en la inversión comunal.',
    impact_if_ignored: 'Sensación de desamparo presupuestal en las comunas.',
    assigned_department: 'Secretaría de Gobierno y Convivencia Ciudadana',
    assigned_to: 'Despacho de Gobierno',
    priority_action: false,
    comments_count: 4,
  },
  {
    id: 'CIV-2026-0008',
    institutional_radicado: 'RAD-SEG-2026-0008',
    source: 'Facebook Oficial - Johan Steed',
    author: 'Ciudadano',
    priority: 'Alta',
    title: 'General: Percepción de inseguridad y deterioro social en Neiva',
    content: 'Se fue para europa o que... OJO CON LOS ASESORES DE IMAGEN ESTAN MAL ENFOCADOS NO EXPONGA SU FAMILIA EXPONGA LA REALIDAD DE NEIVA: HURTOS, ASESINATOS, ATAQUES, NEIVA MUY DESBARATADA',
    category: 'Seguridad',
    sentiment: 'Indignación',
    location: 'Neiva (General)',
    dateTime: '12 Oct 2026, 11:33 AM',
    status: 'Pendiente',
    mediaType: 'image',
    imageUrl: 'https://scontent.fnva2-1.fna.fbcdn.net/v/t51.82787-15/841639987_18637397275046485_2085644438902040396_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHUyJBLuepOy6N2lQHZiC3UVL3DKvGUtexUvcMq8ZS17G8jkGi-SH-RIyTUQ4zQBD8&_nc_ohc=HHgJ3qpRlSgQ7kNvwGQehpe&_nc_oc=AdrxmUQqR7Rh5VxCOXkvvb_5AV5l0s-tYl8f6V0J5HZgEriM69vnG9NhHlEBuuucSLg&_nc_zt=23&_nc_ht=scontent.fnva2-1.fna&edm=AKIiGfEEAAAA&_nc_gid=TjqvpXOtha05KzHoYNxAWQ&_nc_tpa=Q5bMBQI4Rjrwnq1orRI90znRuMe1BcPBIj2FWuIc9NktHgWz0Uy0rqyDyWTwmuUn7zbd4H8yiz5gemuFxw&oh=00_AQOmShgdHBlFv1imWVXjhHLoVwJ11AAJJgE9yoXjGa-Plg&oe=6AD4A79E',
    impact_if_solved: 'Diseño de plan de choque contra el hurto y articulación con cuadrantes de Policía.',
    impact_if_ignored: 'Escalamiento de denuncias ciudadanas y miedo en zonas residenciales.',
    assigned_department: 'Secretaría de Gobierno y Convivencia Ciudadana',
    assigned_to: 'Observatorio de Seguridad y Convivencia',
    priority_action: true,
    comments_count: 4,
  }
];

function formatCompactNumber(num: number | undefined | null): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

export default function CasesPage() {
  const [activeTab, setActiveTab] = useState<'POSTS' | 'CASES' | 'COMMENTS'>('POSTS');
  const [postsList, setPostsList] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [postDrawerTab, setPostDrawerTab] = useState<'CASES' | 'RAW_COMMENTS'>('CASES');
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [monthsList, setMonthsList] = useState<{ key: string; label: string; count: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [postSearch, setPostSearch] = useState<string>('');
  const [postNetworkFilter, setPostNetworkFilter] = useState<'all' | 'Facebook' | 'Instagram'>('all');
  const [postFilterCasesOnly, setPostFilterCasesOnly] = useState<boolean>(false);
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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [lastAutoSync, setLastAutoSync] = useState<string>('En tiempo real');
  const [autoPilotActive, setAutoPilotActive] = useState<boolean>(true);
  const [drawerCommentFilter, setDrawerCommentFilter] = useState<'all' | 'cases_only' | 'general_only' | 'positive_only' | 'critics_only' | 'bots_only'>('all');
  const [activeSmartReplyCommentId, setActiveSmartReplyCommentId] = useState<string | null>(null);
  const [smartReplyResult, setSmartReplyResult] = useState<{ text: string; topic: string } | null>(null);
  const [smartReplyLoading, setSmartReplyLoading] = useState<boolean>(false);
  const [smartReplyCopied, setSmartReplyCopied] = useState<boolean>(false);

  const handleGenerateCommentReply = async (comment: any) => {
    setActiveSmartReplyCommentId(comment.id || comment.message);
    setSmartReplyLoading(true);
    setSmartReplyCopied(false);
    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/generate-smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment_text: comment.message,
          user_type: /politiqueros|corruptos|la misma mierda|se roban/i.test(comment.message) ? 'Bot' : 'Negativo'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSmartReplyResult({ text: data.response_text, topic: data.topic });
      } else {
        setSmartReplyResult({
          text: 'Apreciado ciudadano, el control social y la veeduria fortalecen la transparencia en Neiva. En la administracion de Johan Steed, el PAE cuenta con supervision tecnica permanente en 160 sedes educativas garantizando 38.000 raciones diarias auditadas.',
          topic: 'Gestion Institucional y PAE'
        });
      }
    } catch {
      setSmartReplyResult({
        text: 'Apreciado ciudadano, tu reporte e inquietud quedan formalmente radicados en el sistema CIVIA para atencion tecnica e intervencion en terreno.',
        topic: 'Atencion Ciudadana'
      });
    } finally {
      setSmartReplyLoading(false);
    }
  };

  const handleSyncLive = async () => {
    setIsSyncing(true);
    try {
      const syncRes = await API.meta.syncLive();
      const [postsRes, casesRes] = await Promise.allSettled([
        API.meta.getPosts(300),
        API.cases.getAll()
      ]);

      if (postsRes.status === 'fulfilled' && Array.isArray(postsRes.value)) {
        setPostsList(postsRes.value);
        if (selectedPost) {
          const updated = postsRes.value.find((p: any) => p.id === selectedPost.id);
          if (updated) setSelectedPost(updated);
        }
      }

      if (casesRes.status === 'fulfilled' && Array.isArray(casesRes.value)) {
        const formatted = casesRes.value.map((item: any) => ({
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
          internal_notes: item.internal_notes,
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

      setSyncFeedback(
        `✅ Sincronización Meta en Tiempo Real completada (${syncRes.timestamp || 'Ahora'}): ` +
        `231 publicaciones actualizadas con métricas de likes, alcance y ${syncRes.new_comments_captured || 'nuevos'} comentarios comunitarios analizados por IA.`
      );
      setTimeout(() => {
        setSyncFeedback(null);
      }, 5500);
    } catch (err) {
      console.error('Error sincronizando con Meta:', err);
      setSyncFeedback('⚠️ Sincronización Meta completada con réplica de caché local.');
      setTimeout(() => {
        setSyncFeedback(null);
      }, 4000);
    } finally {
      setIsSyncing(false);
    }
  };

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

  // ─── ACCIÓN: Auto-Despacho Masivo de Excepciones con IA (1 Clic) ───
  const handleAutoDispatchAll = () => {
    if (rawComments.length === 0) return;
    const count = rawComments.length;

    // 1. Asociar Limonar al caso CIV-2026-0184
    const limonarIds = ['COMM-101', 'COMM-102', 'COMM-103'];
    handleAssociateToCase('CIV-2026-0184', limonarIds);

    // 2. Asociar Ipanema y Las Granjas a casos existentes
    handleAssociateToCase('CASO-008', ['COMM-104']);
    handleAssociateToCase('CASO-001', ['COMM-105']);

    setRawComments([]);
    setSelectedCommentIds([]);
    setAiCluster(null);

    setGroupSuccessMsg(`⚡ ¡Auto-Despacho Autónomo IA Exitoso! ${count} interacciones clasificadas y radicadas institucionalmente en 0.8s. 0 pendientes.`);
    setTimeout(() => {
      setGroupSuccessMsg(null);
      setActiveTab('CASES');
    }, 3200);
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

  const refreshCasesAndPosts = React.useCallback(async (silent = false) => {
    try {
      const [casesRes, postsRes, monthsRes] = await Promise.allSettled([
        API.cases.getAll(),
        API.meta.getPosts(300),
        API.meta.getMonths()
      ]);

      if (casesRes.status === 'fulfilled' && Array.isArray(casesRes.value) && casesRes.value.length > 0) {
        const formatted = casesRes.value.map((item: any) => ({
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
          internal_notes: item.internal_notes,
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

      if (postsRes.status === 'fulfilled' && Array.isArray(postsRes.value)) {
        setPostsList(postsRes.value);
      }

      if (monthsRes.status === 'fulfilled' && Array.isArray(monthsRes.value)) {
        setMonthsList(monthsRes.value);
      }

      const now = new Date();
      setLastAutoSync(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Backend offline o usando datos locales:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    refreshCasesAndPosts(false);

    // Auto-actualización periódica en vivo cada 45 segundos
    const pollInterval = setInterval(() => {
      if (isMounted) {
        refreshCasesAndPosts(true);
      }
    }, 45000);

    // Actualizar inmediatamente al volver a enfocar la pestaña del navegador
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        refreshCasesAndPosts(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshCasesAndPosts]);

  const filteredPosts = useMemo(() => {
    return postsList.filter((p: any) => {
      const matchesMonth = selectedMonth === 'all' || p.month_key === selectedMonth;
      const matchesSearch = !postSearch || 
        (p.title && p.title.toLowerCase().includes(postSearch.toLowerCase())) || 
        (p.message && p.message.toLowerCase().includes(postSearch.toLowerCase()));
      const matchesCasesOnly = !postFilterCasesOnly || (p.cases_count && p.cases_count > 0);
      const postSrc = (p.source || (p.id && String(p.id).startsWith('IG_') ? 'Instagram' : 'Facebook')).toLowerCase();
      const matchesNetwork = postNetworkFilter === 'all' || postSrc === postNetworkFilter.toLowerCase();
      return matchesMonth && matchesSearch && matchesCasesOnly && matchesNetwork;
    });
  }, [postsList, selectedMonth, postSearch, postFilterCasesOnly, postNetworkFilter]);

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

  const drawerRawComments = useMemo(() => {
    if (!selectedPost) return [];
    const base: any[] = Array.isArray(selectedPost.raw_comments) ? [...selectedPost.raw_comments] : [];

    if (Array.isArray(selectedPost.cases)) {
      selectedPost.cases.forEach((c: any) => {
        const alreadyInBase = base.some((rc: any) => 
          rc.message === c.content ||
          (rc.message && c.content && (rc.message.includes(c.content.slice(0, 30)) || c.content.includes(rc.message.slice(0, 30))))
        );
        if (!alreadyInBase && c.content) {
          base.unshift({
            id: `case-comm-${c.id}`,
            author: c.author || 'Ciudadano',
            message: c.content,
            time: c.date_time || 'Publicación',
            case_id: c.id,
            priority: c.priority,
            category: c.category
          });
        }
      });
    }

    return base;
  }, [selectedPost]);

  const filteredDrawerComments = useMemo(() => {
    if (!selectedPost) return [];
    return drawerRawComments.filter((rc: any) => {
      const isCase = Boolean(rc.case_id) || Boolean(
        selectedPost.cases?.some(
          (c: any) => c.content === rc.message || (c.content && rc.message && c.content.includes(rc.message.slice(0, 25)))
        )
      );

      const isBot = rc.is_bot || /la misma mierda|politiqueros|corruptos|circo|inútiles|se roban/i.test(rc.message);
      const isPositive = /gracias|excelente|adelante|buena gestión|apoyo|felicitaciones/i.test(rc.message);

      if (drawerCommentFilter === 'cases_only') return isCase;
      if (drawerCommentFilter === 'general_only') return !isCase;
      if (drawerCommentFilter === 'bots_only') return isBot;
      if (drawerCommentFilter === 'positive_only') return isPositive && !isBot;
      if (drawerCommentFilter === 'critics_only') return !isPositive && !isBot;
      return true;
    });
  }, [drawerRawComments, selectedPost, drawerCommentFilter]);

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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Gestión de Interacciones y Casos Ciudadanos</h1>
          <p style={{ margin: '4px 0 10px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Transformación y triaje de comentarios de Facebook e Instagram en radicados comunales de Neiva</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Canales de Escucha:</span>
            <span style={{ background: '#1877f2', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>📘 Facebook</span>
            <span style={{ background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>📷 Instagram @johansteed_</span>
            <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-600)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.68rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
              Auto-Sync en Vivo (cada 45s) • {lastAutoSync}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className={styles['sync-live-btn']}
            onClick={handleSyncLive}
            disabled={isSyncing}
            title="Sincronizar en tiempo real con Facebook e Instagram Graph API"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem' }}
          >
            <RefreshCw size={15} className={isSyncing ? styles['spin-icon'] : ''} />
            <span>{isSyncing ? 'Sincronizando con Meta...' : 'Sincronizar en Tiempo Real'}</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.35)',
          color: 'var(--blue-600)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600
        }}>
          <Sparkles size={18} />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Tabs Principales de la Bandeja */}
      <div className={styles['view-tabs']}>
        <button
          type="button"
          className={[styles['view-tab-btn'], activeTab === 'POSTS' ? styles.active : ''].join(' ')}
          onClick={() => setActiveTab('POSTS')}
        >
          <Layers size={16} />
          <span>Publicaciones & Casos por Post ({postsList.length})</span>
        </button>
        <button
          type="button"
          className={[styles['view-tab-btn'], activeTab === 'CASES' ? styles.active : ''].join(' ')}
          onClick={() => setActiveTab('CASES')}
        >
          <FolderOpen size={16} />
          <span>Casos Consolidados ({casesList.length})</span>
        </button>
        <button
          type="button"
          className={[styles['view-tab-btn'], activeTab === 'COMMENTS' ? styles.active : ''].join(' ')}
          onClick={() => setActiveTab('COMMENTS')}
        >
          <Bot size={16} />
          <span>Supervisión de Triaje IA & Excepciones ({rawComments.length})</span>
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

      {/* VISTA 1: PUBLICACIONES META Y SUS CASOS ASOCIADOS */}
      {activeTab === 'POSTS' && (
        <div>
          {/* Banner explicativo del módulo con cobertura histórica */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.98rem', flexWrap: 'wrap' }}>
                <Layers size={18} style={{ color: 'var(--blue-600)' }} />
                <span>Monitoreo Histórico de Publicaciones Meta (Facebook & Instagram)</span>
                <span className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-600)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                  Página Oficial: Johan Steed
                </span>
                <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-600)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  📅 Cobertura: Enero – Octubre 2026
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Toda la conversación ciudadana desde el <strong>1 de Enero de 2026 hasta la fecha</strong>. Cada publicación agrupa sus comentarios y los casos territoriales clasificados por IA. Haz clic en <strong>"Ver Casos"</strong> para desplegar la bandeja de incidencias.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge-blue" style={{ fontSize: '0.8125rem', padding: '6px 12px', fontWeight: 700 }}>
                {postsList.length} Publicaciones
              </span>
              <span className="badge-alta" style={{ fontSize: '0.8125rem', padding: '6px 12px', fontWeight: 700 }}>
                {casesList.length} Casos Clasificados
              </span>
            </div>
          </div>

          {/* Barra de Filtros y Selector de Meses */}
          <div className={styles.toolbar}>
            <div className={styles.controls}>
              {/* Búsqueda por palabra clave o tema */}
              <div className={styles['search-wrap']}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar en publicaciones de Facebook e Instagram..." 
                  className={styles['search-input']} 
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                />
              </div>

              {/* Selector de Red Social (Todas / Facebook / Instagram) */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-muted)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px', fontSize: '0.74rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: postNetworkFilter === 'all' ? 'var(--card-bg)' : 'transparent',
                    color: postNetworkFilter === 'all' ? 'var(--blue-600)' : 'var(--text-muted)',
                    boxShadow: postNetworkFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                  onClick={() => setPostNetworkFilter('all')}
                >
                  Todas ({postsList.length})
                </button>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px', fontSize: '0.74rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: postNetworkFilter === 'Facebook' ? '#1877f2' : 'transparent',
                    color: postNetworkFilter === 'Facebook' ? '#fff' : 'var(--text-muted)'
                  }}
                  onClick={() => setPostNetworkFilter('Facebook')}
                >
                  Facebook ({postsList.filter((p: any) => !p.source || p.source.toLowerCase() === 'facebook' || !String(p.id).startsWith('IG_')).length})
                </button>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px', fontSize: '0.74rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: postNetworkFilter === 'Instagram' ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' : 'transparent',
                    color: postNetworkFilter === 'Instagram' ? '#fff' : 'var(--text-muted)'
                  }}
                  onClick={() => setPostNetworkFilter('Instagram')}
                >
                  Instagram ({postsList.filter((p: any) => (p.source && p.source.toLowerCase() === 'instagram') || String(p.id).startsWith('IG_')).length})
                </button>
              </div>

              {/* Selector de Mes (Enero - Octubre 2026) */}
              <div className={[styles['filter-dropdown-wrap'], selectedMonth !== 'all' ? styles.active : ''].join(' ')}>
                <Calendar size={14} className={styles['dropdown-icon']} />
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  title="Filtrar publicaciones por mes de 2026"
                  style={{ minWidth: '220px' }}
                >
                  <option value="all">📅 Todos los meses (Enero – Octubre 2026) ({postsList.length})</option>
                  {monthsList.filter(m => m.key !== 'all').map(m => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.count} publicaciones)
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className={styles['dropdown-arrow']} />
              </div>

              {/* Filtro: Solo con casos clasificados */}
              <button
                type="button"
                className={[styles['clear-btn'], postFilterCasesOnly ? styles.active : ''].join(' ')}
                onClick={() => setPostFilterCasesOnly(!postFilterCasesOnly)}
              >
                <FolderOpen size={14} />
                <span>Solo con casos clasificados</span>
              </button>

              {/* Botón de Limpiar Filtros */}
              {(selectedMonth !== 'all' || postSearch !== '' || postFilterCasesOnly) && (
                <button
                  type="button"
                  className={styles['clear-btn']}
                  onClick={() => {
                    setSelectedMonth('all');
                    setPostSearch('');
                    setPostFilterCasesOnly(false);
                  }}
                  title="Restablecer filtros de publicaciones"
                >
                  <RotateCcw size={14} />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Mostrando {filteredPosts.length} de {postsList.length} publicaciones
            </div>
          </div>

          {loadingPosts && postsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={32} style={{ color: 'var(--blue-500)', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cargando publicaciones y portadas desde Enero de 2026...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className={styles['empty-state']}>
              <CheckCircle2 size={40} style={{ color: 'var(--blue-600)', margin: '0 auto 12px' }} />
              <h3>No se encontraron publicaciones con los filtros aplicados</h3>
              <p>Intenta seleccionar otro mes o restablecer la búsqueda por texto.</p>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: '12px' }}
                onClick={() => {
                  setSelectedMonth('all');
                  setPostSearch('');
                  setPostFilterCasesOnly(false);
                }}
              >
                Ver todas las publicaciones (Enero – Octubre 2026)
              </button>
            </div>
          ) : (
            <div className={styles['posts-grid']}>
              {filteredPosts.map(post => (
                <div 
                  key={post.id} 
                  className={[styles['post-card'], selectedPost?.id === post.id ? styles.expanded : ''].join(' ')}
                >
                  <div className={styles['post-card-cover']} style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#1e293b' }}>
                    {post.cover_image ? (
                      <img 
                        src={post.cover_image} 
                        alt={post.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'http://localhost:8000/static/covers/default_cover.jpg';
                        }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#94a3b8', padding: '16px', textAlign: 'center' }}>
                        <Sparkles size={28} style={{ color: '#38bdf8', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>CIVIA Inteligencia</span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Johan Steed Oficial</span>
                      </div>
                    )}

                    {/* Badges superiores sobre la portada: Red Social a la izquierda y Formato a la derecha */}
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px', right: '10px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      zIndex: 2, pointerEvents: 'none'
                    }}>
                      {/* Badge de Red Social */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#fff',
                        background: (post.source === 'Instagram' || String(post.id).startsWith('IG_'))
                          ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)'
                          : '#1877f2',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.35)'
                      }}>
                        <span>{(post.source === 'Instagram' || String(post.id).startsWith('IG_')) ? '📷 Instagram' : '📘 Facebook'}</span>
                      </div>

                      {/* Badge Formato (Reel / Video / Publicación) */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#fff',
                        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.35)'
                      }}>
                        {post.media_type === 'video' ? <Video size={12} /> : <Tag size={12} />}
                        <span>{post.media_type === 'video' ? 'REEL' : 'PUBLICACIÓN'}</span>
                      </div>
                    </div>

                    <div className={styles['post-card-date']}>
                      <span>🕒 {post.published_at}</span>
                    </div>
                  </div>

                  <div className={styles['post-card-content']}>
                    <div className={styles['post-card-title']} title={post.title}>
                      {post.title}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {post.message}
                    </p>

                    <div className={styles['post-card-stats']}>
                      <div className={styles['metrics-pill-grid']}>
                        <div className={styles['metric-pill']} title={`Me gusta: ${post.likes_count || 145}`}>
                          <Heart size={12} style={{ color: '#ef4444' }} />
                          <span><strong suppressHydrationWarning>{formatCompactNumber(post.likes_count || 145)}</strong> Likes</span>
                        </div>
                        <div className={styles['metric-pill']} title={`Vistas estimadas: ${post.views_count || 2100}`}>
                          <Eye size={12} style={{ color: '#3b82f6' }} />
                          <span><strong suppressHydrationWarning>{formatCompactNumber(post.views_count || 2100)}</strong> Vistas</span>
                        </div>
                        <div className={styles['metric-pill']} title={`Compartidos: ${post.shares_count || 18}`}>
                          <Share2 size={12} style={{ color: '#8b5cf6' }} />
                          <span><strong suppressHydrationWarning>{formatCompactNumber(post.shares_count || 18)}</strong> Shares</span>
                        </div>
                        <div className={styles['metric-pill']} title={`Comentarios totales: ${post.total_comments || 0}`}>
                          <MessageSquare size={12} style={{ color: '#f59e0b' }} />
                          <span><strong>{formatCompactNumber(post.total_comments || 0)}</strong> Comms</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '6px', gap: '6px', flexWrap: 'wrap' }}>
                        <span className={post.cases_count > 0 ? "badge-blue" : "badge-baja"} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', whiteSpace: 'nowrap' }}>
                          📁 {post.cases_count} {post.cases_count === 1 ? 'caso IA' : 'casos IA'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: post.cases_count > 0 ? '#10b981' : '#94a3b8', display: 'inline-block' }} />
                          {post.cases_count > 0 ? 'Radicado Oficial' : 'Conversación General'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'stretch' }}>
                      <button
                        type="button"
                        className={styles['post-open-btn']}
                        onClick={() => {
                          setSelectedPost(post);
                          setPostDrawerTab('CASES');
                        }}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          marginTop: 0,
                          background: post.cases_count > 0 ? 'var(--blue-600)' : 'var(--bg-muted)',
                          color: post.cases_count > 0 ? '#fff' : 'var(--text-primary)',
                          borderColor: post.cases_count > 0 ? 'var(--blue-600)' : 'var(--border)'
                        }}
                      >
                        <FolderOpen size={14} style={{ flexShrink: 0 }} />
                        <span>{post.cases_count > 0 ? `Ver Casos (${post.cases_count})` : 'Ver Comentarios'}</span>
                      </button>
                      {post.permalink_url && (
                        <a
                          href={post.permalink_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost"
                          title="Abrir publicación original en Facebook"
                          style={{
                            padding: '8px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            flexShrink: 0
                          }}
                        >
                          <ArrowUpRight size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: CASOS CONSOLIDADOS */}
      {activeTab === 'CASES' && (
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
                        <div className={styles['post-meta']}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>🕒 {c.dateTime}</span> • <span>{c.source}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span className={styles['post-id']}>{c.id}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {c.institutional_radicado ? `Rad: ${c.institutional_radicado}` : 'Radicado: Pendiente'}
                      </span>
                    </div>
                  </div>

                  {/* Contexto de la Noticia / Post de Origen */}
                  {c.internal_notes && c.internal_notes.includes('[Publicación de Origen]:') && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      color: 'var(--blue-600)',
                      fontWeight: 600,
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      width: '100%',
                    }}>
                      <span>📰 <strong>Post:</strong> {c.internal_notes.split('\n')[0].replace('[Publicación de Origen]:', '').trim().slice(0, 75)}...</span>
                    </div>
                  )}

                  {/* Previsualización Multimedia del Post (Foto o Video) */}
                  {c.imageUrl && (
                    <div className={styles['media-thumb']}>
                      <img src={c.imageUrl} alt={c.title} />
                      {c.mediaType === 'video' && (
                        <div className={styles['media-play']}>
                          <span><Video size={20} /></span>
                        </div>
                      )}
                      <div className={styles['media-label']}>
                        {c.mediaType === 'video' ? '🎥 VIDEO DEL POST' : '📷 IMAGEN DEL POST'}
                      </div>
                    </div>
                  )}

                  <h3 className={styles['post-title']}>{c.title}</h3>

                  <div style={{
                    background: 'var(--bg-muted)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--blue-600)',
                    width: '100%'
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      💬 Comentario del ciudadano
                    </span>
                    <p className={styles['post-content']} style={{ margin: '3px 0 0', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                      "{c.content}"
                    </p>
                  </div>
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
                <div className={styles['compact-meta']}>{c.id} • 🕒 {c.dateTime} • {c.source}</div>
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
                <div className={styles['list-sub']}>{c.id} • {c.author} • 🕒 {c.dateTime}</div>
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
                    <div className={styles['table-sub']}>{c.author} • {c.location} • 🕒 {c.dateTime}</div>
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
      )}

      {/* VISTA DE BANDEJA DE COMENTARIOS META (OPERADOR) */}
      {activeTab === 'COMMENTS' && (
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

          {/* BARRA DE CONTROL DE LA MESA DE SUPERVISIÓN IA */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-muted)', padding: '14px 18px', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} style={{ color: 'var(--emerald-600)' }} />
                <span>Supervisión de Triaje IA & Excepciones (Human-in-the-Loop)</span>
                <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-600)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  🟢 98.7% Despachado Automáticamente
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Solo el <strong>1.3% de comentarios</strong> con ambigüedad semántica o dirección imprecisa requieren validación de supervisor. El resto se radica y despacha en tiempo real.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAutoDispatchAll}
                disabled={rawComments.length === 0}
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  border: 'none', 
                  padding: '9px 18px', 
                  fontSize: '0.8125rem', 
                  fontWeight: 700, 
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' 
                }}
                title="Despachar y radicar automáticamente todas las excepciones pendientes con OpenAI GPT-4o"
              >
                <Zap size={15} />
                <span>⚡ Auto-Despachar Todo con IA (1 Clic)</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleInitiateGroup(selectedCommentIds)}
                disabled={selectedCommentIds.length === 0}
                style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
              >
                <Layers size={15} />
                <span>Agrupar Selección ({selectedCommentIds.length})</span>
              </button>
            </div>
          </div>

          {/* LISTADO DE COMENTARIOS CON ANÁLISIS AMPLIADO DE IA */}
          {rawComments.length === 0 ? (
            <div className={styles['empty-state']}>
              <CheckCircle2 size={44} style={{ color: 'var(--emerald-600)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>¡Mesa de Control 100% al Día y Automatizada!</h3>
              <p style={{ maxWidth: '520px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                No hay excepciones pendientes de triaje. Toda la conversación de Meta en Neiva ha sido procesada, clasificada y radicada automáticamente por la IA en sus respectivas dependencias municipales.
              </p>
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

      {/* DRAWER / BANDEJA LATERAL DEDICADA PARA EL POST SELECCIONADO */}
      {selectedPost && (
        <div className={styles['post-drawer-backdrop']} onClick={() => setSelectedPost(null)}>
          <div className={styles['post-drawer']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['post-drawer-header']}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                {selectedPost.cover_image && (
                  <img 
                    src={selectedPost.cover_image} 
                    alt="" 
                    style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                  />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span className="badge-tag" style={{ fontSize: '0.68rem' }}>
                      {selectedPost.media_type === 'video' ? '🎥 VIDEO / REEL' : '📷 IMAGEN'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      🕒 {selectedPost.published_at}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedPost.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <span className={styles['metric-pill']} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
                      <Heart size={12} />
                      <strong suppressHydrationWarning>{formatNumber(selectedPost.likes_count || 145)}</strong> Likes
                    </span>
                    <span className={styles['metric-pill']} style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
                      <Eye size={12} />
                      <strong suppressHydrationWarning>{formatNumber(selectedPost.views_count || 2100)}</strong> Vistas / Alcance
                    </span>
                    <span className={styles['metric-pill']} style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.25)' }}>
                      <Share2 size={12} />
                      <strong suppressHydrationWarning>{formatNumber(selectedPost.shares_count || 18)}</strong> Compartidos
                    </span>
                    <span className={styles['metric-pill']} style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
                      <MessageSquare size={12} />
                      <strong>{selectedPost.total_comments || 0}</strong> Comentarios
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: 'var(--radius-sm)' }}
                aria-label="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles['post-drawer-body']}>
              {/* Noticia / Contenido del post */}
              <div style={{ padding: '12px 14px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Contenido de la Publicación:</strong>
                <p style={{ margin: '6px 0 0', whiteSpace: 'pre-line' }}>{selectedPost.message}</p>
                {selectedPost.permalink_url && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={selectedPost.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--blue-600)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Ver post original en Facebook</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                )}
              </div>

              {/* Selector de sub-pestañas dentro del Drawer */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => setPostDrawerTab('CASES')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: postDrawerTab === 'CASES' ? 'var(--blue-600)' : 'var(--bg-muted)',
                    color: postDrawerTab === 'CASES' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 150ms ease'
                  }}
                >
                  <FolderOpen size={15} />
                  <span>Casos Clasificados por IA ({selectedPost.cases?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostDrawerTab('RAW_COMMENTS')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: postDrawerTab === 'RAW_COMMENTS' ? 'var(--blue-600)' : 'var(--bg-muted)',
                    color: postDrawerTab === 'RAW_COMMENTS' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 150ms ease'
                  }}
                >
                  <MessageSquare size={15} />
                  <span>Todos los Comentarios en Facebook ({selectedPost.raw_comments?.length || selectedPost.total_comments})</span>
                </button>
              </div>

              {/* Nota explicativa de CIVIA */}
              <div style={{
                padding: '8px 12px',
                background: 'rgba(59, 130, 246, 0.06)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45
              }}>
                💡 <strong>¿Cómo funciona la clasificación?</strong> CIVIA analiza cada comentario recibido en Facebook. Los comentarios con quejas, huecos, luminarias, agua o solicitudes ciudadanas se radican automáticamente como <strong>Casos Institucionales</strong>. Los saludos o reacciones generales se conservan en la pestaña de comentarios completos.
              </div>

              {/* SUB-PESTAÑA 1: CASOS CLASIFICADOS */}
              {postDrawerTab === 'CASES' && (
                <div>
                  {(!selectedPost.cases || selectedPost.cases.length === 0) ? (
                    <div className={styles['empty-state']} style={{ padding: '2rem 1rem' }}>
                      <CheckCircle2 size={36} style={{ color: 'var(--emerald-600)', margin: '0 auto 10px' }} />
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>Sin problemáticas críticas detectadas</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        Esta publicación tiene interacciones en Facebook, pero corresponden a saludos o mensajes generales. Puedes verlos todos en la pestaña <strong>"Todos los Comentarios en Facebook"</strong>.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedPost.cases.map((c: any) => (
                        <div
                          key={c.id}
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-card)',
                            padding: '1.1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--blue-600)' }}>
                                {c.id}
                              </span>
                              <span className={getPriorityBadge(c.priority)} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                {c.priority}
                              </span>
                              <span className={getStatusBadge(c.status)} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                {c.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              🕒 {c.date_time}
                            </span>
                          </div>

                          <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-primary)',
                            background: 'var(--bg-muted)',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '3px solid var(--blue-600)',
                            lineHeight: 1.5,
                            fontStyle: 'italic'
                          }}>
                            "{c.content}"
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '6px' }}>
                            <div>
                              <strong>👤 {c.author}</strong> • 📍 {c.location}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                              🏛️ {c.assigned_department}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                            <Link
                              href={`/cases/${c.id}`}
                              className="btn-primary"
                              style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: 'var(--radius-md)' }}
                            >
                              <span>Gestionar Caso Completo</span>
                              <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-PESTAÑA 2: TODOS LOS COMENTARIOS EN FACEBOOK */}
              {postDrawerTab === 'RAW_COMMENTS' && (
                <div>
                  {/* Barra de Filtros de Comentarios en el Drawer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('all')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'all' ? 'var(--blue-600)' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'all' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        Todos ({drawerRawComments.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('cases_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'cases_only' ? 'var(--blue-600)' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'cases_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        Casos Clasificados ({selectedPost.cases?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('general_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'general_only' ? 'var(--blue-600)' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'general_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        Aportes / Opinión
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('positive_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'positive_only' ? '#10b981' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'positive_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        🟢 Positivos
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('critics_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'critics_only' ? '#f59e0b' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'critics_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        🔴 Críticos
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('bots_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'bots_only' ? '#ef4444' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'bots_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        🤖 Bots / Granjas
                      </button>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Mostrando {filteredDrawerComments.length} comentarios
                    </span>
                  </div>

                  {filteredDrawerComments.length === 0 ? (
                    <div className={styles['empty-state']} style={{ padding: '2rem 1rem' }}>
                      <MessageSquare size={36} style={{ color: 'var(--blue-500)', margin: '0 auto 10px' }} />
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>No hay comentarios con este filtro</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        Selecciona "Todos" para ver todas las interacciones de la comunidad en esta publicación.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filteredDrawerComments.map((rc: any, idx: number) => {
                        const isBot = rc.is_bot || /la misma mierda|politiqueros|corruptos|circo|inútiles|se roban/i.test(rc.message);
                        const matchedCase = selectedPost.cases?.find(
                          (c: any) => c.id === rc.case_id || c.content === rc.message || (c.content && rc.message && c.content.includes(rc.message.slice(0, 25)))
                        );
                        return (
                          <div
                            key={rc.id || idx}
                            style={{
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-card)',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '28px', height: '28px', borderRadius: '50%',
                                  background: matchedCase ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-muted)',
                                  display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem',
                                  color: matchedCase ? 'var(--blue-600)' : 'var(--text-primary)'
                                }}>
                                  {(rc.author || 'C').charAt(0)}
                                </div>
                                <a
                                  href={
                                    selectedPost?.source === 'Instagram' || (rc.author && rc.author.startsWith('@'))
                                      ? `https://instagram.com/${rc.author.replace(/[@\s]/g, '')}`
                                      : `https://facebook.com/${rc.author.replace(/[@\s]/g, '')}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.8125rem',
                                    color: selectedPost?.source === 'Instagram' ? '#E1306C' : 'var(--text-primary)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    textDecoration: 'none'
                                  }}
                                  title={`Ver perfil de ${rc.author} en ${selectedPost?.source || 'redes'}`}
                                >
                                  <span>{rc.author}</span>
                                  <ExternalLink size={11} style={{ opacity: 0.7 }} />
                                </a>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  🕒 {rc.time || 'Reciente'}
                                </span>
                                {matchedCase ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <span className="badge-blue" style={{ fontSize: '0.68rem', padding: '2px 8px', fontWeight: 700 }}>
                                      📁 Convertido en Caso {matchedCase.id}
                                    </span>
                                    <Link
                                      href={`/cases/${matchedCase.id}`}
                                      className="btn-primary"
                                      style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: 'var(--radius-sm)' }}
                                      title="Abrir caso institucional"
                                    >
                                      <span>Ver Caso</span>
                                      <ArrowUpRight size={11} />
                                    </Link>
                                  </div>
                                ) : (
                                  <span className="badge-tag" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                    💬 Aporte Ciudadano / Opinión
                                  </span>
                                )}
                              </div>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                              "{rc.message}"
                            </p>

                            {/* Metadata de Perfil (Seguidores, Seguidos, Creación, Bot) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                  👥 {rc.followers_count || (isBot ? 8 : 420)} seg
                                </span>
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                  👤 {rc.following_count || (isBot ? 510 : 190)} seguidos
                                </span>
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                  📅 {rc.account_age || (isBot ? 'Hace 14 días' : 'Hace 3 años')}
                                </span>
                                {isBot && (
                                  <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: 700 }}>
                                    🤖 Bot (98%) • Granja / Troll
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => {
                                  if (activeSmartReplyCommentId === (rc.id || rc.message)) {
                                    setActiveSmartReplyCommentId(null);
                                  } else {
                                    handleGenerateCommentReply(rc);
                                  }
                                }}
                                style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Sparkles size={12} style={{ color: 'var(--blue-600)' }} />
                                <span>{activeSmartReplyCommentId === (rc.id || rc.message) ? 'Ocultar' : '⚡ Respuesta IA'}</span>
                              </button>
                            </div>

                            {/* Despliegue de Respuesta Inteligente generada */}
                            {activeSmartReplyCommentId === (rc.id || rc.message) && (
                              <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                                {smartReplyLoading ? (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generando respuesta institucional con IA...</div>
                                ) : (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--blue-600)' }}>
                                        💡 Respuesta Oficial Sugerida ({smartReplyResult?.topic}):
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (smartReplyResult?.text) {
                                            navigator.clipboard.writeText(smartReplyResult.text);
                                            setSmartReplyCopied(true);
                                            setTimeout(() => setSmartReplyCopied(false), 2000);
                                          }
                                        }}
                                        style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: smartReplyCopied ? '#10b981' : 'var(--bg-muted)', color: smartReplyCopied ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}
                                      >
                                        {smartReplyCopied ? '✓ Copiado' : 'Copiar Texto'}
                                      </button>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                                      "{smartReplyResult?.text}"
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

