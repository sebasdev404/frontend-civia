import { type AnalyticsOverview, snapshotDate } from './analytics';

export interface ReportRow { section: string; label: string; value: string | number; note: string }

export function reportRows(data: AnalyticsOverview): ReportRow[] {
  const rows: ReportRow[] = [];
  const add = (section: string, label: string, value: string | number, note = '') => rows.push({ section, label, value, note });
  add('Alcance', 'Período', 'Histórico almacenado', data.scope);
  add('Alcance', 'Consulta', snapshotDate(data.generated_at), 'Zona horaria: America/Bogota');
  add('Alcance', 'Última modificación registrada', snapshotDate(data.data_updated_at), 'No equivale a la última sincronización completa de Meta.');
  add('Expedientes', 'Guardados', data.cases.stored);
  add('Expedientes', 'En bandeja', data.cases.total, 'Excluye duplicados con consolidación activa; incluye estados sujetos a revisión.');
  add('Expedientes', 'Duplicados consolidados excluidos', data.cases.duplicates_excluded);
  for (const [label, value] of Object.entries(data.cases.statuses)) add('Estados registrados', label, value);
  add('Expedientes', 'Abiertos con prioridad Alta o Crítica', data.cases.critical_open);
  add('Expedientes', 'Origen señalado para revisión', data.cases.source_needs_review);
  add('Captura', 'Publicaciones', data.capture.posts, 'Cada red conserva su registro de publicación.');
  add('Captura', 'Comentarios capturados', data.capture.captured_comments, 'IDs únicos dentro de cada publicación, incluidas respuestas.');
  add('Captura', 'Comentarios reportados guardados', data.capture.reported_comments, 'Puede diferir de la captura por respuestas, disponibilidad y fecha.');
  add('Cobertura', 'Publicaciones sin captura guardada', data.capture.posts_without_capture);
  add('Cobertura', 'Capturas no legibles', data.capture.unreadable_captures);
  add('Cobertura', 'Publicaciones sin conteo reportado', data.capture.reported_unknown_posts);
  for (const row of data.capture.channels) {
    add('Redes', `${row.source}: publicaciones`, row.posts);
    add('Redes', `${row.source}: comentarios capturados`, row.captured_comments);
    add('Redes', `${row.source}: comentarios reportados guardados`, row.reported_comments);
  }
  add('Contexto Facebook', 'Comentarios con texto', data.contextual.captured_text_comments);
  add('Contexto Facebook', 'Análisis vigentes', data.contextual.analyzed);
  add('Contexto Facebook', 'Pendientes de contexto o análisis', data.contextual.pending);
  add('Contexto Facebook', 'Por revisar, incluidos los pendientes', data.contextual.review);
  add('Contexto Facebook', 'A favor de Johan', data.contextual.stances.support ?? 0, 'Solo análisis vigentes sin señal de revisión.');
  add('Contexto Facebook', 'Críticas a Johan', data.contextual.stances.criticism ?? 0, 'Solo análisis vigentes sin señal de revisión.');
  for (const [label, value] of Object.entries(data.cases.departments)) add('Dependencia registrada', label, value, 'Clasificación histórica; no acredita actuaciones.');
  add('Territorio', 'Referencias únicas de comentario y lugar', data.territorial.captured_mentions, 'Menciones textuales; ubicaciones aproximadas. No son incidentes confirmados.');
  for (const row of data.territorial.locations) add('Lugares mencionados (10 primeros)', row.location, row.mentions);
  add('Medición', 'Tiempo promedio de atención', data.response_time.average_hours == null ? 'No disponible' : `${data.response_time.average_hours} horas`, data.response_time.reason);
  return rows;
}

export function reportCsv(data: AnalyticsOverview): string {
  const cell = (value: string | number) => {
    const raw = String(value);
    const safe = typeof value === 'string' && /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [['Sección', 'Indicador', 'Valor', 'Definición'], ...reportRows(data).map(row => [row.section, row.label, row.value, row.note])].map(row => row.map(cell).join(';')).join('\r\n');
}
