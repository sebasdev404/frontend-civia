import { Home, MessagesSquare, FolderOpen, MapPin, ChartNoAxesCombined, Users, Settings, Library } from 'lucide-react';

export const navigationItems = [
  { href: '/dashboard', label: 'Inicio', description: 'Resumen y accesos rápidos', group: 'PANORAMA', icon: Home,
    purpose: 'Consulta el panorama general y elige la tarea con la que quieres empezar.' },
  { href: '/opinion', label: 'Opinión sobre Johan', description: 'Apoyos, críticas y temas', group: 'ESCUCHAR Y ATENDER', icon: MessagesSquare,
    purpose: 'Centraliza el análisis de comentarios sobre Johan: apoyos, críticas, temas y contexto de las publicaciones.' },
  { href: '/publications', label: 'Publicaciones', description: 'Noticias regionales y redes', group: 'ESCUCHAR Y ATENDER', icon: Library,
    purpose: 'Monitorea medios de Neiva y Huila con prioridad sugerida por IA, o consulta las publicaciones de las redes conectadas.' },
  { href: '/cases', label: 'Gestión de casos', description: 'Revisar, asignar y dar seguimiento', group: 'ESCUCHAR Y ATENDER', icon: FolderOpen,
    purpose: 'Revisa la bandeja de casos, abre un comentario y decide si requiere atención. Asigna responsables y registra el seguimiento.' },
  { href: '/map', label: 'Mapa de reportes', description: 'Problemas por barrio y comuna', group: 'EXPLORAR', icon: MapPin,
    purpose: 'Filtra por zona o tipo de problema y selecciona un punto del mapa para ver su detalle.' },
  { href: '/analytics', label: 'Indicadores', description: 'Métricas, tendencias e informes', group: 'EXPLORAR', icon: ChartNoAxesCombined,
    purpose: 'Consulta las métricas de los casos y prepara un informe. La postura frente a Johan está en Opinión sobre Johan.' },
  { href: '/citizens', label: 'Ciudadanos y contactos', description: 'Directorio e historial de atención', group: 'EXPLORAR', icon: Users,
    purpose: 'Busca un contacto, consulta su información e historial o importa tu base de datos.' },
  { href: '/settings', label: 'Configuración', description: 'Usuarios, conexiones y sistema', group: 'ADMINISTRAR', icon: Settings,
    purpose: 'Administra usuarios y revisa las conexiones y el estado de los servicios de Ordenemos a Neiva.' },
] as const;

export function getNavigationItem(pathname: string) {
  return navigationItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))
    || (pathname === '/' ? navigationItems[0] : undefined);
}

export const workflowSteps = [
  { href: '/publications', label: 'Revisar publicaciones', description: 'Elige una fuente y consulta publicaciones, comentarios y reacciones.', icon: Library },
  { href: '/opinion', label: 'Analizar opinión sobre Johan', description: 'Consulta los comentarios, apoyos, críticas y temas en un solo lugar.', icon: MessagesSquare },
  { href: '/cases?view=cases', label: 'Atender los casos', description: 'Asigna responsables y da seguimiento a las solicitudes ciudadanas.', icon: Users },
] as const;
