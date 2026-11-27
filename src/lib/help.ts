export const helpArticles = [
  {
    id: 'start', title: '¿Cómo empiezo a usar Ordenemos a Neiva?', keywords: 'inicio navegar menu plataforma guia', href: '/dashboard', linkLabel: 'Ir al inicio',
    steps: [
      'En Inicio tienes el resumen general y accesos para revisar publicaciones, analizar la opinión sobre Johan y atender casos.',
      'El menú de la izquierda agrupa las secciones. En pantallas pequeñas, ábrelo con el botón Menú.',
      'La ruta de la parte superior te indica dónde estás. Usa Ir a para cambiar directamente de sección.',
    ],
  },
  {
    id: 'conversation', title: '¿Cómo reviso los apoyos y las críticas a Johan?', keywords: 'facebook comentarios sentimiento rabia enojo apoyo critica conversacion', href: '/opinion', linkLabel: 'Abrir Opinión sobre Johan',
    steps: [
      'Elige un período y, si lo necesitas, una publicación. Sin seleccionar una publicación verás el conjunto de Facebook.',
      'Pulsa una tarjeta de apoyo, crítica o revisión para ver los comentarios de ese grupo. Los temas de la izquierda también sirven como filtros.',
      'Lee por separado la postura, la emoción y a quién se dirige el comentario. El enojo contra un problema puede respaldar la denuncia de Johan.',
      'Usa Quitar filtros y ver todo para regresar a la vista general.',
      'Los comentarios se muestran de 5 en 5. Cambia de página con los números, Anterior o Siguiente; también puedes elegir 10 o 20 por página.',
    ],
  },
  {
    id: 'video', title: '¿Cómo añado el contexto de un video?', keywords: 'video resumen transcripcion contexto pendiente analisis ia', href: '/opinion', linkLabel: 'Completar contexto en Opinión sobre Johan',
    steps: [
      'Selecciona la publicación en el filtro Publicación de Opinión sobre Johan.',
      'Escribe de qué habla Johan, qué denuncia y cuál es su postura, o aporta una transcripción del video.',
      'Pulsa Guardar resumen y contexto y después Analizar comentarios pendientes. Se procesan hasta 20 comentarios por vez.',
      'Ordenemos a Neiva aún no escucha automáticamente el video. Sin contexto suficiente, el comentario permanece pendiente; si cambia el contexto, su análisis debe actualizarse.',
    ],
  },
  {
    id: 'posts', title: '¿Dónde encuentro las publicaciones y sus comentarios?', keywords: 'publicaciones redes sincronizar facebook instagram post gechem jorge likes reacciones nombres', href: '/publications', linkLabel: 'Abrir publicaciones',
    steps: [
      'En Publicaciones elige una fuente: las redes conectadas de Johan o el perfil aportado de Jorge Andrés Gechem.',
      'Abre una tarjeta para consultar comentarios paginados, métricas e identidades de reacciones que Meta permita entregar.',
      'Actualizar esta publicación consulta solo ese contenido. Exportar captura CSV descarga los comentarios y nombres visibles ya disponibles.',
      'Un guion significa dato no disponible; no equivale a cero. Si Meta rechaza el acceso a una fuente, se muestra el permiso pendiente y no se inventan publicaciones.',
      'Las señales de repetición sirven para revisión. No certifican que una cuenta sea bot ni una persona real.',
    ],
  },
  {
    id: 'cases', title: '¿Cómo atiendo una solicitud ciudadana?', keywords: 'casos asignar dependencia seguimiento resolver atencion solicitud', href: '/cases?view=cases', linkLabel: 'Abrir casos y seguimiento',
    steps: [
      'En Gestión de casos, entra a Casos y seguimiento y busca la solicitud por estado, prioridad o texto.',
      'Abre el caso para consultar el comentario, los antecedentes y la información disponible.',
      'Asigna la dependencia responsable y registra notas o avances según lo que necesite la solicitud.',
      'Cuando se haya atendido, registra la resolución. Volver a la lista de casos te lleva a la misma sección de gestión.',
    ],
  },
  {
    id: 'map', title: '¿Cómo uso el mapa de reportes?', keywords: 'mapa barrio comuna zona territorio incidente', href: '/map', linkLabel: 'Abrir mapa de reportes',
    steps: [
      'Elige la zona, el tipo de problema y los demás filtros disponibles.',
      'Selecciona un punto del mapa para consultar la información del reporte.',
      'Usa Limpiar en los filtros para volver a mostrar el conjunto de reportes.',
    ],
  },
  {
    id: 'analytics', title: '¿Dónde consulto métricas e informes?', keywords: 'indicadores analisis informe reporte emociones metricas tendencias', href: '/analytics', linkLabel: 'Abrir indicadores',
    steps: [
      'En Indicadores puedes consultar las métricas de atención, las emociones de los casos y los problemas reportados.',
      'El informe se prepara desde el botón de informe disponible en Inicio o Indicadores.',
      'Para saber si los comentarios apoyan o critican a Johan, consulta Opinión sobre Johan: una emoción por sí sola no determina esa postura.',
    ],
  },
  {
    id: 'citizens', title: '¿Cómo busco o importo contactos?', keywords: 'ciudadanos contactos directorio importar base datos historial', href: '/citizens', linkLabel: 'Abrir ciudadanos y contactos',
    steps: [
      'Usa la búsqueda y los filtros de Ciudadanos y contactos para encontrar un registro.',
      'Abre el contacto para consultar su información de origen y el historial disponible.',
      'Para agregar una base, usa Importar y revisa la vista previa antes de completar la importación.',
    ],
  },
  {
    id: 'settings', title: '¿Dónde reviso usuarios y conexiones?', keywords: 'configuracion usuarios acceso conexion servicios ia meta', href: '/settings', linkLabel: 'Abrir configuración',
    steps: [
      'En Usuarios y accesos puedes consultar y administrar las cuentas de la plataforma.',
      'En Estado de servicios puedes comprobar el funcionamiento de los servicios conectados.',
      'En IA y redes sociales encontrarás las opciones de inteligencia artificial y conexiones de redes.',
    ],
  },
  {
    id: 'sync', title: '¿Por qué una actualización puede tardar?', keywords: 'sincronizar demora lento tiempo progreso meta captura', href: '/publications', linkLabel: 'Ver publicaciones y avance',
    steps: [
      'Meta puede responder lentamente cuando una publicación tiene muchos comentarios o respuestas. La captura ahora trabaja en segundo plano y muestra la etapa en curso.',
      'Las actualizaciones de redes conectadas consultan hasta 12 publicaciones recientes por red. La información ya guardada sigue disponible mientras terminan.',
      'No necesitas pulsar varias veces: el botón manual y la actualización automática comparten el mismo trabajo.',
      'La captura no espera al análisis de IA ni a descargar portadas. El análisis de opinión se ejecuta por separado desde Opinión sobre Johan.',
    ],
  },
] as const;
