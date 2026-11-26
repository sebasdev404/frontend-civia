import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { type AnalyticsOverview, metric, snapshotDate } from '@/lib/analytics';
import styles from './AnalyticsViews.module.scss';

export function SnapshotStatus({ data }: { data: AnalyticsOverview }) {
  return <div className={styles.snapshot}><div><strong>Histórico guardado en CIVIA</strong><p>{data.scope}</p></div><div>Consultado: {snapshotDate(data.generated_at)}<br />Última modificación registrada: {snapshotDate(data.data_updated_at)}</div></div>;
}

export function MetricCard({ title, value, detail, href }: { title: string; value: number | null; detail: string; href?: string }) {
  return <article className={styles.metric}><h3>{title}</h3><strong>{metric(value)}</strong><p>{detail}</p>{href && <Link href={href}>Consultar <ArrowRight size={14} /></Link>}</article>;
}

export function CaseMetrics({ data }: { data: AnalyticsOverview }) {
  const c = data.cases;
  return <div className={styles.cards}>
    <MetricCard title="Expedientes en bandeja" value={c.total} detail={`${metric(c.stored)} guardados; ${metric(c.duplicates_excluded)} duplicados consolidados excluidos.`} href="/cases?view=cases" />
    <MetricCard title="Pendientes o en gestión" value={c.open} detail={`${metric(c.pending)} pendientes y ${metric(c.in_progress)} en gestión. La solicitud puede requerir revisión.`} href="/cases?view=cases" />
    <MetricCard title="Con estado Resuelto" value={c.resolved} detail="Estado registrado en los expedientes; su evidencia de cierre debe verificarse." href="/cases?view=cases&status=Resuelto" />
    <MetricCard title="Sin solicitud de atención" value={c.no_request} detail="Clasificados como No requiere gestión; se conservan en el histórico." href="/cases?view=cases&status=No+requiere+gesti%C3%B3n" />
  </div>;
}

export function CaptureMetrics({ data }: { data: AnalyticsOverview }) {
  return <><div className={styles.cards}>
    <MetricCard title="Publicaciones guardadas" value={data.capture.posts} detail="Publicaciones individuales por red social, incluidas las compartidas entre redes." href="/publications" />
    <MetricCard title="Comentarios capturados" value={data.capture.captured_comments} detail="IDs únicos dentro de cada publicación, incluidas las respuestas capturadas." href="/publications" />
    <MetricCard title="Comentarios reportados por Meta" value={data.capture.reported_comments} detail="Suma de conteos guardados. Puede diferir de la captura por respuestas, disponibilidad y fechas." />
  </div>{(data.capture.posts_without_capture > 0 || data.capture.unreadable_captures > 0 || data.capture.reported_unknown_posts > 0) && <p className={styles.note}>Cobertura: {metric(data.capture.posts_without_capture)} publicaciones sin captura guardada, {metric(data.capture.unreadable_captures)} capturas no legibles y {metric(data.capture.reported_unknown_posts)} sin conteo reportado disponible. Las cifras reflejan la información disponible.</p>}</>;
}

export function Distribution({ values, empty = 'No hay registros en esta distribución.' }: { values: Record<string, number>; empty?: string }) {
  const rows = Object.entries(values).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const total = rows.reduce((sum, [, count]) => sum + count, 0);
  if (!total) return <p className={styles.note}>{empty}</p>;
  return <ul className={styles.rows}>{rows.map(([label, count]) => <li key={label}><span>{label}</span><strong>{metric(count)} · {((count / total) * 100).toFixed(1)}%</strong><progress max={total} value={count} aria-label={`${label}: ${metric(count)} de ${metric(total)}`} /></li>)}</ul>;
}

export function ContextMetrics({ data }: { data: AnalyticsOverview }) {
  const c = data.contextual;
  return <section className={styles.panel}><h2>Análisis contextual de Facebook</h2><p>Solo se cuentan análisis vigentes para el comentario y su contexto. La emoción histórica de un expediente no determina una postura frente a Johan.</p><ul className={styles.rows}>
    {[["Comentarios de texto disponibles", c.captured_text_comments], ["Con análisis vigente", c.analyzed], ["Pendientes de análisis o contexto", c.pending], ["Por revisar, incluidos los pendientes", c.review], ["A favor de Johan", c.stances.support ?? 0], ["Críticas a Johan", c.stances.criticism ?? 0]].map(([label, count]) => <li key={label}><span>{label}</span><strong>{metric(Number(count))}</strong></li>)}
  </ul><Link className="btn-ghost" href="/opinion">Consultar contexto y comentarios <ArrowRight size={14} /></Link></section>;
}

export function TerritoryRanking({ data }: { data: AnalyticsOverview }) {
  return <section className={styles.panel}><h2>Menciones territoriales trazables</h2><p>{metric(data.territorial.captured_mentions)} referencias únicas de comentario y lugar, con respaldo en el texto capturado. Las coordenadas son aproximadas por zona; no acreditan incidentes confirmados.</p>
    {data.territorial.locations.length ? <ol className={styles.rows}>{data.territorial.locations.map(row => <li key={row.location}><span>{row.location}</span><strong>{metric(row.mentions)}</strong></li>)}</ol> : <p className={styles.note}>No hay referencias territoriales con evidencia disponible.</p>}
    <Link className="btn-ghost" href="/map">Consultar mapa y evidencia <ArrowRight size={14} /></Link>
  </section>;
}
