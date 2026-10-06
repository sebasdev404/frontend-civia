"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Clock, MessageSquare, AlertTriangle, Send, Share2, 
  Flame, CheckCircle2, ShieldAlert, Building2, UserCheck, Check,
  FileText, CornerDownRight, RefreshCw, Sparkles, MessageCircle, Layers
} from 'lucide-react';
import { API } from '@/lib/api/client';
import { useAuth, UserRole } from '@/context/AuthContext';
import styles from './case-detail.module.scss';

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
  'CIV-2026-0184': {
    id: 'CIV-2026-0184',
    institutional_radicado: 'RAD-INF-2026-0391',
    source: 'Facebook / Instagram',
    author: '@comunidad_limonar',
    priority: 'Alta',
    title: 'Deterioro vial crítico y hundimiento de calzada – El Limonar (Comuna 6)',
    content: 'Falla geotécnica y múltiples baches profundos sobre la Calle 39 entre carreras 28 y 30. Afectación severa a rutas de transporte colectivo y riesgo de accidentes.',
    category: 'Infraestructura',
    sentiment: 'Indignación',
    location: 'El Limonar - Comuna 6',
    dateTime: '15 Oct 2026, 08:30',
    status: 'En Gestión',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Recupera transitabilidad de vía arterial comunal y desactiva paro de transportadores.',
    impact_if_ignored: 'Riesgo inminente de bloqueo total de la Avenida Max Duque por transporte público.',
    assigned_department: 'Secretaría de Infraestructura y Vías',
    assigned_to: 'Ing. Carlos Dussán - Cuadrilla Malla Vial',
    internal_notes: '[15 Oct 2026, 08:45] [Operador - Carlos Mendoza]: Caso consolidado agrupando 14 interacciones de redes Meta.\n[15 Oct 2026, 09:30] [Despacho Secretaría]: Asignada cuadrilla de fresado y parcheo con visita preliminar en terreno.',
    priority_action: true,
    comments_count: 14,
    channel_contact_allowed: true,
    contact_person: {
      name: 'Luz Marina Tovar',
      handle: '@maria_limonar',
      role: 'Líder Comunitario',
      phone: '314 829 4102',
      email: 'luzmarina.limonar@gmail.com',
      origenDato: 'CIUDADANO',
    }
  },
  'CASO-001': {
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
    internal_notes: '[15 Oct 2026, 15:00] [Despacho a Las Ceibas]: Se coordinó envío de 2 carrotanques prioritarios a Las Granjas y verificación técnica de presión en bocatoma.',
    priority_action: true,
  },
  'CASO-002': {
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
    internal_notes: '[15 Oct 2026, 10:00] [Sec. Infraestructura]: Fase 2 de pavimentación en curso sobre la Av. La Toma. Se proyecta entrega el viernes.',
    priority_action: false,
  },
  'CASO-003': {
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
    internal_notes: '[14 Oct 2026, 19:10] [Gobierno]: Se ofició a la Policía Metropolitana de Neiva para intensificar rondas motorizadas entre 5:00 PM y 9:00 PM.',
    priority_action: false,
  },
  'CASO-004': {
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
    internal_notes: '[15 Oct 2026, 15:30] [Gestión del Riesgo]: Declarado punto crítico en Comuna 6. Vactor en desplazamiento.',
    priority_action: true,
  },
  'CASO-005': {
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
    internal_notes: '[15 Oct 2026, 12:00] [Sec. Salud]: Mesa técnica con gerencia del Hospital Universitario para redistribuir triaje a la ESE Carmen Emilia Ospina.',
    priority_action: false,
  },
  'CASO-006': {
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
    internal_notes: '[14 Oct 2026, 17:00] [Medio Ambiente]: Programado patrullaje de vigilancia y comparendos ambientales con la Policía Ambiental.',
    priority_action: false,
  },
  'CASO-007': {
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
    internal_notes: '[15 Oct 2026, 12:30] [Movilidad]: Cuadrilla de semaforización reemplazando tarjeta de control afectada por pico de energía.',
    priority_action: false,
  },
  'CASO-008': {
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
    internal_notes: '[14 Oct 2026, 21:00] [Alumbrado Público]: Instalación de 28 luminarias LED de 150W finalizada satisfactoriamente.',
    resolution_note: 'Modernización del 100% de luminarias de sodio a tecnología LED con garantía de 5 años. Se verificó iluminación adecuada en el parque y ciclorruta comunal.',
    resolved_by: 'Secretaría de Infraestructura (Dra. Camila Morales)',
    public_response: 'Nos alegra que la comunidad de Ipanema disfrute ahora de espacios públicos iluminados y seguros. ¡Seguimos trabajando por toda Neiva!',
    priority_action: false,
  }
};

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = (params?.id as string) || 'CASO-001';
  const { user, switchDemoUser } = useAuth();

  const [caseData, setCaseData] = useState<CaseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Estados de formularios para cada rol
  const [newNote, setNewNote] = useState('');
  const [dispatchDept, setDispatchDept] = useState('');
  const [dispatchAssignee, setDispatchAssignee] = useState('');
  const [dispatchNote, setDispatchNote] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [publicRespText, setPublicRespText] = useState('');
  const [mayoralDirective, setMayoralDirective] = useState('');
  const [operatorSolution, setOperatorSolution] = useState('');
  const [operatorEvidence, setOperatorEvidence] = useState('');

  // Cargar datos del caso desde Backend
  useEffect(() => {
    let isMounted = true;
    async function fetchCase() {
      setLoading(true);
      try {
        const data = await API.cases.getById(caseId);
        if (isMounted && data) {
          const parsed: CaseDetailData = {
            id: data.id,
            source: data.source || 'Redes',
            author: data.author || 'Ciudadano',
            priority: data.priority || 'Media',
            title: data.title || '',
            content: data.content || '',
            category: data.category || 'General',
            sentiment: data.sentiment || 'Neutro',
            location: data.location || 'Neiva',
            dateTime: data.date_time || data.dateTime || 'Reciente',
            status: data.status || 'Pendiente',
            mediaType: data.media_type || data.mediaType || 'none',
            imageUrl: data.image_url || data.imageUrl || null,
            impact_if_solved: data.impact_if_solved,
            impact_if_ignored: data.impact_if_ignored,
            assigned_department: data.assigned_department,
            assigned_to: data.assigned_to,
            internal_notes: data.internal_notes,
            public_response: data.public_response,
            resolution_note: data.resolution_note,
            resolved_by: data.resolved_by,
            priority_action: data.priority_action || false,
          };
          setCaseData(parsed);
          setDispatchDept(parsed.assigned_department || NEIVA_DEPARTMENTS[0]);
          setDispatchAssignee(parsed.assigned_to || '');
          setResolutionText(parsed.resolution_note || '');
          setPublicRespText(parsed.public_response || '');
        }
      } catch (err) {
        console.warn('Backend offline o usando fallback:', err);
        const fallback = FALLBACK_CASES[caseId] || FALLBACK_CASES['CASO-001'];
        if (isMounted) {
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

  // ─── ACCIÓN: Alcalde Toggle Prioridad Inmediata ──────────────
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
      // Fallback optimista local
      setCaseData(prev => prev ? { ...prev, priority_action: nextState } : null);
      showFeedback(`Prioridad actualizada localmente (${nextState ? 'Activada' : 'Desactivada'}).`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Alcalde Añadir Directriz ────────────────────────
  const handleAddMayoralDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !mayoralDirective.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const noteText = `[DIRECTRIZ ALCALDÍA - Johan Steed]: ${mayoralDirective.trim()}`;
    try {
      await API.cases.addNote(caseData.id, {
        note: noteText,
        author_name: 'Johan Steed (Alcalde)'
      });
      setCaseData(prev => prev ? {
        ...prev,
        internal_notes: prev.internal_notes ? `${prev.internal_notes}\n[${new Date().toLocaleDateString('es-CO')}] ${noteText}` : `[${new Date().toLocaleDateString('es-CO')}] ${noteText}`
      } : null);
      setMayoralDirective('');
      showFeedback('🏛️ Directriz del Alcalde registrada y emitida a los despachos correspondientes.');
    } catch (err) {
      console.error(err);
      showFeedback('Directriz registrada localmente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Despacho a Terreno (Secretario / Operador) ─────
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
      showFeedback(`🚀 Caso canalizado a ${dispatchDept}. Estado actualizado a "En Gestión".`);
    } catch (err) {
      console.error(err);
      showFeedback(`Caso actualizado localmente a En Gestión.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Resolver Caso (Secretario) ──────────────────────
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
      showFeedback('✅ ¡Caso cerrado satisfactoriamente con reporte técnico oficial!');
    } catch (err) {
      console.error(err);
      showFeedback('Caso marcado como resuelto localmente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Registrar Solución y Evidencias de Terreno (Operador) ───
  const handleOperatorSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !operatorSolution.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const authorName = user?.full_name ? `${user.full_name} (${user.role})` : 'Operador CIVIA';
    const noteEntry = `[${new Date().toLocaleDateString('es-CO')}] [Solución y Evidencias Registradas por ${authorName}]: ${operatorSolution.trim()} ${operatorEvidence ? '• Evidencia: ' + operatorEvidence : ''}`;
    try {
      await API.cases.addNote(caseData.id, {
        note: noteEntry,
        author_name: authorName,
      });
      setCaseData(prev => prev ? {
        ...prev,
        status: 'Solución Registrada',
        internal_notes: prev.internal_notes ? `${prev.internal_notes}\n${noteEntry}` : noteEntry,
      } : null);
      setOperatorSolution('');
      setOperatorEvidence('');
      showFeedback('📦 Solución y evidencias técnicas registradas. El caso pasa a Pendiente de Validación de Cierre por el Secretario.');
    } catch (err) {
      console.error(err);
      setCaseData(prev => prev ? { ...prev, status: 'Solución Registrada' } : null);
      showFeedback('Solución registrada localmente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Guardar Respuesta Pública (Secretario / Alcalde) ─
  const handleSavePublicResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !publicRespText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await API.cases.savePublicResponse(caseData.id, publicRespText.trim());
      setCaseData(prev => prev ? {
        ...prev,
        public_response: publicRespText.trim()
      } : null);
      showFeedback('📢 Comunicado oficial guardado listo para publicación institucional.');
    } catch (err) {
      console.error(err);
      showFeedback('Respuesta oficial guardada localmente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ACCIÓN: Agregar Nota Interna en Bitácora ────────────────
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !newNote.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const authorName = user?.full_name ? `${user.full_name} (${user.role})` : 'Operador';
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

  if (loading || !caseData) {
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

  const LIFECYCLE_STEPS = [
    { id: 'NUEVO', label: '1. Nuevo' },
    { id: 'VALIDADO', label: '2. Validado' },
    { id: 'ASIGNADO', label: '3. Asignado' },
    { id: 'EN_GESTION', label: '4. En Gestión' },
    { id: 'SOLUCION_REGISTRADA', label: '5. Solución Registrada' },
    { id: 'PENDIENTE_VALIDACION_CIERRE', label: '6. Validación Cierre' },
    { id: 'CERRADO', label: '7. Cerrado' },
  ];

  return (
    <div className={styles['page-container']}>
      {/* ─── BANNER DE PRIORIDAD ALCALDÍA ─────────────────────── */}
      {caseData.priority_action && (
        <div className={styles['priority-banner']}>
          <div className={styles['banner-left']}>
            <span className={styles['banner-icon']}>🔥</span>
            <div>
              <h4>Prioridad Institucional – Despacho del Alcalde</h4>
              <p>Intervención de máxima prioridad institucional. SLA especial configurable (Parámetro actual: 24 horas por defecto).</p>
            </div>
          </div>
          <span className={styles['banner-tag']}>SLA ACTIVO: ESPECIAL CONFIGURABLE</span>
        </div>
      )}

      {/* ─── ENCABEZADO Y ACCIONES PRINCIPALES ─────────────────── */}
      <header className={styles['detail-header']}>
        <div>
          <Link href="/cases" className={styles['back-link']}>
            <ArrowLeft size={16} /> Volver a la Bandeja de Casos
          </Link>
          <div className={styles['title-row']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1>{caseData.id}</h1>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '3px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                {caseData.institutional_radicado ? `Radicado Institucional: ${caseData.institutional_radicado}` : 'Radicado Institucional: Pendiente / Opcional'}
              </span>
            </div>
            <span className={
              caseData.priority === 'Alta' ? 'badge-alta' :
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
            <span className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'var(--blue-600)', border: '1px solid rgba(59, 130, 246, 0.25)', fontWeight: 600 }}>
              💬 {caseData.comments_count || 14} comentarios Meta agrupados
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
            <span><UserCheck size={14} /> Autor: {caseData.author}</span>
          </div>
        </div>

        <div className={styles['header-actions']}>
          <button 
            className={`${styles.btn} ${styles['btn-secondary']}`}
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showFeedback('📋 Enlace del caso copiado al portapapeles');
              }
            }}
          >
            <Share2 size={16} />
            <span>Compartir</span>
          </button>

          {/* Acción rápida de Alcalde */}
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

          {/* Acción rápida de Secretario */}
          {currentRole === 'SECRETARIO' && caseData.status !== 'Resuelto' && (
            <button 
              className={`${styles.btn} ${styles['btn-success']}`}
              onClick={() => {
                const el = document.getElementById('resolution-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <CheckCircle2 size={16} />
              <span>Cierre Técnico</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── TRAZADOR VISUAL DE CICLO DE VIDA FORMAL CIVIA ──────── */}
      <div className={styles['lifecycle-tracker']}>
        {LIFECYCLE_STEPS.map((step, idx) => {
          const isCurrent = 
            (step.id === 'EN_GESTION' && caseData.status === 'En Gestión') ||
            (step.id === 'CERRADO' && (caseData.status === 'Resuelto' || caseData.status === 'Cerrado')) ||
            (step.id === 'SOLUCION_REGISTRADA' && caseData.status === 'Solución Registrada') ||
            (step.id === 'PENDIENTE_VALIDACION_CIERRE' && caseData.status === 'Pendiente Validación Cierre') ||
            (step.id === 'NUEVO' && (caseData.status === 'Pendiente' || caseData.status === 'Nuevo')) ||
            (step.id === 'ASIGNADO' && caseData.assigned_department && caseData.status !== 'Resuelto' && caseData.status !== 'Solución Registrada');

          return (
            <React.Fragment key={step.id}>
              <span className={[
                styles['lifecycle-step'],
                isCurrent ? styles.current : '',
              ].join(' ')}>
                {step.label}
              </span>
              {idx < LIFECYCLE_STEPS.length - 1 && <span className={styles['lifecycle-arrow']}>➔</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* FEEDBACK TOAST / BANNER */}
      {feedbackMsg && (
        <div className={styles['action-success-banner']}>
          <Check size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ─── GRID DE DETALLE Y ACCIONES ────────────────────────── */}
      <div className={styles['detail-grid']}>
        {/* ======================================================== */}
        {/* COLUMNA IZQUIERDA: EXPEDIENTE, IA Y BITÁCORA             */}
        {/* ======================================================== */}
        <div>
          {/* 1. Contenido Original del Reporte */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <MessageSquare size={18} className="text-blue-500" />
                <span>Reporte Ciudadano Detectado</span>
              </div>
              <span className="badge-tag">{caseData.source}</span>
            </div>

            <div className={styles['citizen-box']}>
              <div className={styles['author-row']}>
                <div className={styles['author-info']}>
                  <div className={styles['author-avatar']}>
                    {caseData.author.replace('@', '').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles['author-name']}>{caseData.author}</div>
                    <div className={styles['author-channel']}>Publicado en {caseData.source} • {caseData.location}</div>
                  </div>
                </div>
              </div>

              <div className={styles['citizen-quote']}>
                "{caseData.content}"
              </div>

              {caseData.imageUrl && (
                <div className={styles['media-preview']}>
                  <img src={caseData.imageUrl} alt="Evidencia ciudadana reportada" />
                </div>
              )}

              {/* Lista de Comentarios Meta Agrupados en esta Problemática */}
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} style={{ color: 'var(--blue-600)' }} />
                  <span>Comentarios Meta Agrupados en esta Problemática (4 interacciones)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{caseData.author} • {caseData.source}</span>
                      <span>{caseData.dateTime}</span>
                    </div>
                    <div>"{caseData.content.slice(0, 120)}..."</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>@ciudadano_neiva • {caseData.source === 'Facebook' ? 'Instagram' : 'Facebook'}</span>
                      <span>Hace 40 min</span>
                    </div>
                    <div>"Apoyo total al reporte, en este mismo sector los vecinos estamos afectados por la misma situación."</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>@veeduria_comunal • {caseData.source}</span>
                      <span>Hace 1 hora</span>
                    </div>
                    <div>"Como junta comunal respaldamos esta solicitud y pedimos intervención técnica de la secretaría."</div>
                  </div>
                </div>
              </div>

              {/* 1.1 Ficha de Contacto Ciudadano y Políticas Meta */}
              <div className={styles['contact-policy-card']} style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={16} style={{ color: 'var(--blue-600)' }} />
                    <span>Gestión de Contacto Ciudadano y Trazabilidad</span>
                  </div>
                  <span className="badge-tag" style={{ fontSize: '0.7rem' }}>
                    Origen del Dato: {caseData.contact_person?.origenDato || 'CIUDADANO (suministrado voluntariamente)'}
                  </span>
                </div>

                <div className={styles['contact-meta-notice']}>
                  <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Políticas del Canal Meta:</strong> Contacto disponible según permisos y políticas vigentes de Meta Graph API.
                    {caseData.channel_contact_allowed 
                      ? ' La ventana de respuesta directa (24h) se encuentra activa para este autor.' 
                      : ' Fuera de ventana de 24h. Meta no entrega teléfono ni correo por defecto; use canales alternativos autorizados.'}
                  </div>
                </div>

                {/* Datos del contacto voluntario */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', background: 'var(--bg-muted)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Interlocutor Comunitario:</span>
                    <strong>{caseData.contact_person?.name || caseData.author}</strong> ({caseData.contact_person?.role || 'Líder Comunitario'})
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Teléfono Voluntario:</span>
                    <span>{caseData.contact_person?.phone || 'No suministrado por el ciudadano'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Correo Electrónico:</span>
                    <span>{caseData.contact_person?.email || 'No suministrado por el ciudadano'}</span>
                  </div>
                </div>

                {/* Botones de acción según permisos */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Acciones de Contacto e Interacción:
                  </div>
                  <div className={styles['channel-actions-grid']}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      onClick={() => showFeedback(`💬 Conversación abierta con ${caseData.author} en Meta Business Suite según políticas vigentes.`)}
                    >
                      <MessageSquare size={13} />
                      <span>Mensaje Meta (24h)</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      onClick={() => {
                        const note = prompt('Ingrese minuta de la llamada con el líder/ciudadano:');
                        if (note) {
                          const noteText = `[Contacto Telefónico con ${caseData.contact_person?.name || caseData.author}]: ${note}`;
                          setCaseData(prev => prev ? {
                            ...prev,
                            internal_notes: prev.internal_notes ? `${prev.internal_notes}\n[${new Date().toLocaleDateString('es-CO')}] ${noteText}` : `[${new Date().toLocaleDateString('es-CO')}] ${noteText}`
                          } : null);
                          showFeedback('📞 Llamada telefónica archivada en la bitácora del caso.');
                        }
                      }}
                    >
                      <Clock size={13} />
                      <span>Registrar Llamada</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      onClick={() => {
                        const note = prompt('Ingrese observación o acta de la visita en terreno:');
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

                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      onClick={() => {
                        const note = prompt('Ingrese asunto o radicado del correo electrónico enviado:');
                        if (note) {
                          const noteText = `[Correo Electrónico Institucional]: ${note}`;
                          setCaseData(prev => prev ? {
                            ...prev,
                            internal_notes: prev.internal_notes ? `${prev.internal_notes}\n[${new Date().toLocaleDateString('es-CO')}] ${noteText}` : `[${new Date().toLocaleDateString('es-CO')}] ${noteText}`
                          } : null);
                          showFeedback('✉️ Correo electrónico registrado en la bitácora.');
                        }
                      }}
                    >
                      <FileText size={13} />
                      <span>Registrar Correo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Análisis de Inteligencia Artificial CIVIA */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <Sparkles size={18} className="text-amber-500" />
                <span>Análisis de Inteligencia Artificial (IA CIVIA)</span>
              </div>
              <span className="badge-tag">Motor NLP Neiva</span>
            </div>

            <div className={styles['analysis-chips']}>
              <div className={styles['chip-item']}>
                <div className={styles['chip-label']}>Categoría</div>
                <div className={styles['chip-value']}>{caseData.category}</div>
              </div>
              <div className={styles['chip-item']}>
                <div className={styles['chip-label']}>Sentimiento</div>
                <div className={styles['chip-value']}>{caseData.sentiment}</div>
              </div>
              <div className={styles['chip-item']}>
                <div className={styles['chip-label']}>Sector Geográfico</div>
                <div className={styles['chip-value']}>{caseData.location}</div>
              </div>
            </div>

            {/* Proyección de Impacto Político y Comunitario */}
            <div className={styles['projection-box']}>
              <div className={`${styles['proj-card']} ${styles.success}`}>
                <div className={styles['proj-title']}>
                  <CheckCircle2 size={16} />
                  <span>Impacto si se resuelve oportunamente</span>
                </div>
                <p>{caseData.impact_if_solved || 'Previene quejas y fortalece la confianza ciudadana en la gestión pública.'}</p>
              </div>

              <div className={`${styles['proj-card']} ${styles.danger}`}>
                <div className={styles['proj-title']}>
                  <AlertTriangle size={16} />
                  <span>Riesgo político y social si se ignora</span>
                </div>
                <p>{caseData.impact_if_ignored || 'Riesgo de escalamiento a movilizaciones y deterioro de favorabilidad institucional.'}</p>
              </div>
            </div>
          </div>

          {/* 3. Reporte de Cierre Técnico (si resuelto) */}
          {caseData.resolution_note && (
            <div className={styles['status-card-resolved']}>
              <div className={styles['status-header']}>
                <CheckCircle2 size={18} />
                <span>Cierre Técnico Oficial Registrado</span>
              </div>
              <p>{caseData.resolution_note}</p>
              {caseData.resolved_by && (
                <span className={styles['resolved-meta']}>
                  Certificado por: <strong>{caseData.resolved_by}</strong>
                </span>
              )}
            </div>
          )}

          {/* 4. Comunicado Oficial Público (si existe) */}
          {caseData.public_response && (
            <div className={styles['public-response-card']}>
              <div className={styles['response-header']}>
                <FileText size={18} />
                <span>Respuesta Institucional a la Comunidad</span>
              </div>
              <p>{caseData.public_response}</p>
            </div>
          )}

          {/* 5. Bitácora de Seguimiento y Notas Internas */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              <div className={styles['title-content']}>
                <Building2 size={18} className="text-blue-500" />
                <span>Trazabilidad y Bitácora Interna</span>
              </div>
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

            <form onSubmit={handleAddInternalNote} className={styles['note-input-wrap']}>
              <textarea
                placeholder="Añadir nota de seguimiento u observación interna..."
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

        {/* ======================================================== */}
        {/* COLUMNA DERECHA: CENTRO DE OPERACIONES POR ROL           */}
        {/* ======================================================== */}
        <div className={styles['role-hub-panel']}>
          {/* Selector Rápido de Roles para Probar la Experiencia */}
          <div className={styles['role-switcher-banner']}>
            <span className={styles['switcher-label']}>Probar perspectiva de rol:</span>
            <div className={styles['switcher-buttons']}>
              <button 
                className={currentRole === 'ALCALDE' ? styles.active : ''}
                onClick={() => switchDemoUser('ALCALDE')}
                title="Cambiar a Johan Steed (Alcalde)"
              >
                🏛️ Alcalde
              </button>
              <button 
                className={currentRole === 'SECRETARIO' ? styles.active : ''}
                onClick={() => switchDemoUser('SECRETARIO')}
                title="Cambiar a Dra. Camila Morales (Secretario)"
              >
                📋 Secretario
              </button>
              <button 
                className={currentRole === 'OPERADOR' ? styles.active : ''}
                onClick={() => switchDemoUser('OPERADOR')}
                title="Cambiar a Carlos Mendoza (Operador)"
              >
                🎧 Operador
              </button>
            </div>
          </div>

          {/* ===================================================== */}
          {/* PANEL ROL: ALCALDE DE NEIVA                           */}
          {/* ===================================================== */}
          {currentRole === 'ALCALDE' && (
            <div className={`${styles.card} ${styles['active-role-card']} ${styles['role-alcalde']}`}>
              <div className={styles['role-badge-row']}>
                <div className={styles['role-avatar']}>🏛️</div>
                <div className={styles['role-info']}>
                  <h3>Despacho del Alcalde</h3>
                  <p>Johan Steed — Gobernanza Estratégica y Riesgo Político</p>
                </div>
              </div>

              <div className={styles['workflow-section']}>
                <h4 className={styles['section-heading']}>Intervención de Máxima Prioridad</h4>
                <p className="text-xs text-slate-500">
                  Como Alcalde, usted puede ordenar la intervención de emergencia municipal. Esto activa un protocolo inmediato con SLA de 24 horas y supervisión directa de su despacho.
                </p>

                <button 
                  className={`${styles.btn} ${caseData.priority_action ? styles['btn-danger-outline'] : styles['btn-danger']}`}
                  style={{ width: '100%', padding: '12px' }}
                  onClick={handleTogglePriority}
                  disabled={isSubmitting}
                >
                  <Flame size={18} />
                  <span>
                    {caseData.priority_action 
                      ? 'Desactivar Prioridad Especial Alcaldía' 
                      : '🔥 Declarar Prioridad Inmediata Alcaldía'}
                  </span>
                </button>

                <hr style={{ borderColor: 'var(--border)', margin: '0.5rem 0' }} />

                <h4 className={styles['section-heading']}>Emitir Directriz a Secretarías</h4>
                <form onSubmit={handleAddMayoralDirective} className={styles['workflow-section']}>
                  <div className={styles['form-group']}>
                    <label>Instrucción Ejecutiva:</label>
                    <textarea 
                      placeholder="Ej: Ordeno a Las Ceibas y Secretaría de Infraestructura disponer de maquinaria de inmediato y reportar avance hoy a las 6:00 PM."
                      value={mayoralDirective}
                      onChange={(e) => setMayoralDirective(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className={`${styles.btn} ${styles['btn-primary']}`}
                    disabled={!mayoralDirective.trim() || isSubmitting}
                  >
                    <Send size={15} />
                    <span>Emitir Directriz de Despacho</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* PANEL ROL: SECRETARIO DE DESPACHO                     */}
          {/* ===================================================== */}
          {currentRole === 'SECRETARIO' && (
            <div className={`${styles.card} ${styles['active-role-card']} ${styles['role-secretario']}`}>
              <div className={styles['role-badge-row']}>
                <div className={styles['role-avatar']}>📋</div>
                <div className={styles['role-info']}>
                  <h3>Secretarías de Despacho</h3>
                  <p>Dra. Camila Morales — Ejecución Técnica y Cuadrillas</p>
                </div>
              </div>

              <div className={styles['workflow-section']}>
                {/* 1. Asignar / Despachar Cuadrilla */}
                <h4 className={styles['section-heading']}>Gestión Operativa de Cuadrillas</h4>
                <form onSubmit={handleDispatch} className={styles['workflow-section']}>
                  <div className={styles['form-group']}>
                    <label>Dependencia a Cargo:</label>
                    <select 
                      value={dispatchDept} 
                      onChange={(e) => setDispatchDept(e.target.value)}
                    >
                      {NEIVA_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles['form-group']}>
                    <label>Cuadrilla / Contratista Responsable:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Cuadrilla 3 - Malla Vial / Ing. Rodrigo Castro"
                      value={dispatchAssignee}
                      onChange={(e) => setDispatchAssignee(e.target.value)}
                    />
                  </div>

                  <div className={styles['form-group']}>
                    <label>Orden de Trabajo u Observación:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Orden #4521 - Inspección y parcheo urgente"
                      value={dispatchNote}
                      onChange={(e) => setDispatchNote(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className={`${styles.btn} ${styles['btn-primary']}`}
                    disabled={isSubmitting}
                  >
                    <Send size={15} />
                    <span>Actualizar Despacho a Terreno</span>
                  </button>
                </form>

                <hr style={{ borderColor: 'var(--border)', margin: '0.5rem 0' }} />

                {/* 2. Cierre Técnico del Caso */}
                <div id="resolution-section">
                  <h4 className={styles['section-heading']}>Validación y Certificación Institucional de Cierre</h4>
                  <p className="text-xs text-slate-500">
                    Como Secretario de Despacho, revise el informe y evidencias reportadas para certificar oficialmente el cierre técnico e institucional del caso.
                  </p>
                  <form onSubmit={handleResolveCase} className={styles['workflow-section']}>
                    <div className={styles['form-group']}>
                      <label>Acta de Resolución y Certificación Técnica:</label>
                      <textarea 
                        placeholder="Describa el trabajo técnico ejecutado en terreno, validación con la comunidad y certificación del cierre..."
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className={`${styles.btn} ${styles['btn-success']}`}
                      disabled={!resolutionText.trim() || isSubmitting}
                    >
                      <CheckCircle2 size={16} />
                      <span>{caseData.status === 'Resuelto' || caseData.status === 'Cerrado' ? 'Actualizar Cierre Oficial' : 'Validar Cierre Técnico Institucional'}</span>
                    </button>
                  </form>
                </div>

                <hr style={{ borderColor: 'var(--border)', margin: '0.5rem 0' }} />

                {/* 3. Redactar Comunicado Público */}
                <h4 className={styles['section-heading']}>Comunicado Oficial a la Comunidad</h4>
                <form onSubmit={handleSavePublicResponse} className={styles['workflow-section']}>
                  <div className={styles['form-group']}>
                    <label>Borrador de Respuesta Pública:</label>
                    <textarea 
                      placeholder="Redacte la respuesta que se publicará en las redes oficiales o se remitirá al líder comunitario..."
                      value={publicRespText}
                      onChange={(e) => setPublicRespText(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={`${styles.btn} ${styles['btn-secondary']}`}
                    disabled={!publicRespText.trim() || isSubmitting}
                  >
                    <MessageCircle size={15} />
                    <span>Guardar Comunicado Institucional</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* PANEL ROL: OPERADOR DE MONITOREO                      */}
          {/* ===================================================== */}
          {currentRole === 'OPERADOR' && (
            <div className={`${styles.card} ${styles['active-role-card']} ${styles['role-operador']}`}>
              <div className={styles['role-badge-row']}>
                <div className={styles['role-avatar']}>🎧</div>
                <div className={styles['role-info']}>
                  <h3>Gestión de Información y Triaje</h3>
                  <p>Carlos Mendoza — Información, contacto, evidencias y trazabilidad</p>
                </div>
              </div>

              {/* CLARIFICACIÓN EXPLÍCITA DE RESPONSABILIDAD EN TERRENO */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--blue-600)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} />
                  <span>Principio de Responsabilidad CIVIA</span>
                </div>
                <div>Cuadrilla atiende en terreno / Operador gestiona contacto, información y trazabilidad.</div>
              </div>

              <div className={styles['workflow-section']}>
                <h4 className={styles['section-heading']}>Triaje y Canalización a Entidad</h4>
                <p className="text-xs text-slate-500">
                  Verifique la autenticidad del reporte en Neiva y canalice el expediente a la secretaría correspondiente para despliegue de cuadrilla.
                </p>

                <form onSubmit={handleDispatch} className={styles['workflow-section']}>
                  <div className={styles['form-group']}>
                    <label>Direccionar a Dependencia de Neiva:</label>
                    <select 
                      value={dispatchDept} 
                      onChange={(e) => setDispatchDept(e.target.value)}
                    >
                      {NEIVA_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles['form-group']}>
                    <label>Cuadrilla Técnica Asignada:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Cuadrilla Acueducto / Malla Vial Neiva"
                      value={dispatchAssignee}
                      onChange={(e) => setDispatchAssignee(e.target.value)}
                    />
                  </div>

                  <div className={styles['form-group']}>
                    <label>Instrucción de Triaje Operativo:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Reporte verificado con vecinos. Requiere cuadrilla prioritaria."
                      value={dispatchNote}
                      onChange={(e) => setDispatchNote(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className={`${styles.btn} ${styles['btn-primary']}`}
                    disabled={isSubmitting}
                  >
                    <Send size={15} />
                    <span>Canalizar y Despachar Caso</span>
                  </button>
                </form>

                <hr style={{ borderColor: 'var(--border)', margin: '0.5rem 0' }} />

                {/* FORMULARIO: REGISTRO DE SOLUCIÓN Y EVIDENCIAS DE TERRENO POR EL OPERADOR */}
                <div>
                  <h4 className={styles['section-heading']}>Registro de Solución y Evidencias</h4>
                  <p className="text-xs text-slate-500">
                    Registre el informe reportado por la cuadrilla técnica y las evidencias fotográficas de la intervención para remitir a validación de cierre por Secretaría.
                  </p>

                  <form onSubmit={handleOperatorSolution} className={styles['workflow-section']}>
                    <div className={styles['form-group']}>
                      <label>Detalle de Solución Ejecutada en Terreno:</label>
                      <textarea
                        placeholder="Ej: Cuadrilla 3 finalizó bacheo y nivelación de calzada en Calle 39 con 12 toneladas de asfalto caliente..."
                        value={operatorSolution}
                        onChange={(e) => setOperatorSolution(e.target.value)}
                      />
                    </div>

                    <div className={styles['form-group']}>
                      <label>Enlace / Referencia de Evidencia Fotográfica:</label>
                      <input
                        type="text"
                        placeholder="Ej: https://evidencias.neiva.gov.co/obras/limonar-calle39.jpg"
                        value={operatorEvidence}
                        onChange={(e) => setOperatorEvidence(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className={`${styles.btn} ${styles['btn-secondary']}`}
                      style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                      disabled={!operatorSolution.trim() || isSubmitting}
                    >
                      <CheckCircle2 size={16} />
                      <span>Registrar Solución (Pasa a Validación Cierre)</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
