'use client';
import { useState } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { useAnalyticsOverview } from '@/hooks/useAnalyticsOverview';
import { ExecutiveReportModal } from '@/components/reports/ExecutiveReportModal';
import SentimentChart from '@/components/charts/SentimentChart';
import CategoryChart from '@/components/charts/CategoryChart';
import { CaptureMetrics, CaseMetrics, ContextMetrics, TerritoryRanking, Distribution, SnapshotStatus } from '@/components/analytics/AnalyticsViews';
import styles from '@/components/analytics/AnalyticsViews.module.scss';
import { metric } from '@/lib/analytics';

export default function AnalyticsPage() {
  const { data, loading, error, refresh } = useAnalyticsOverview();
  const [reportOpen, setReportOpen] = useState(false);
  return <div className="page">
    <header className={styles.header}><div><h1>Indicadores e informes</h1><p>Cifras del histórico almacenado, con origen, alcance y fecha de consulta. Las clasificaciones históricas están sujetas a revisión.</p></div><div className={styles.actions}>
      <button className="btn-secondary" disabled={loading} onClick={() => void refresh()}><RefreshCw size={16} />Actualizar cifras</button>
      <button className="btn-primary" disabled={!data || loading} onClick={() => setReportOpen(true)}><FileText size={16} />Informe de datos</button>
    </div></header>
    {loading && <p className={styles.loading} role="status">Consultando indicadores del histórico…</p>}
    {error && <div className={styles.error} role="alert"><strong>No se pudieron cargar los indicadores</strong><p>{error}</p><button className="btn-secondary" onClick={() => void refresh()}>Reintentar</button></div>}
    {data && <>
      <SnapshotStatus data={data} />
      <h2 className={styles.sectionHeading}>Publicaciones y comentarios</h2><CaptureMetrics data={data} />
      <div className={styles.grid}><section className={styles.panel}><h2>Captura por red social</h2><p>Los comentarios se cuentan por ID dentro de su publicación. Una publicación compartida en dos redes conserva sus registros independientes.</p>
        <ul className={styles.rows}>{data.capture.channels.map(row => <li key={row.source}><span>{row.source}</span><strong>{metric(row.captured_comments)} capturados</strong><small>{metric(row.posts)} publicaciones · {metric(row.reported_comments)} comentarios reportados guardados</small></li>)}</ul>
      </section><ContextMetrics data={data} /></div>
      <h2 className={styles.sectionHeading}>Expedientes y clasificación guardada</h2><CaseMetrics data={data} />
      <div className={styles.grid}>
        <section className={styles.panel}><h2>Categorías de los expedientes</h2><p>Distribución de los {metric(data.cases.total)} expedientes de la bandeja, excluidos los duplicados consolidados. Una categoría no acredita una necesidad confirmada.</p><CategoryChart values={data.cases.categories} /></section>
        <section className={styles.panel}><h2>Emociones registradas</h2><p>Se conservan las etiquetas del histórico. La emoción no se interpreta como apoyo o crítica a Johan.</p><SentimentChart values={data.cases.emotions} /></section>
        <section className={styles.panel}><h2>Estados registrados</h2><Distribution values={data.cases.statuses} /></section>
        <section className={styles.panel}><h2>Dependencia registrada</h2><p>Incluye asignaciones históricas sujetas a verificación; no demuestra actuaciones realizadas.</p><Distribution values={data.cases.departments} /></section>
      </div>
      <div className={styles.grid}>
        <TerritoryRanking data={data} />
        <section className={styles.panel}><h2>Palabras frecuentes en la captura</h2><p>Frecuencia textual de palabras en los comentarios capturados. No se traduce automáticamente en gravedad o solicitudes de atención.</p><div className={styles.terms}>{data.capture.top_terms.map(row => <span key={row.term}>{row.term} · {metric(row.count)}</span>)}</div>{!data.capture.top_terms.length && <p>Sin texto disponible para calcular frecuencias.</p>}</section>
        <section className={styles.panel}><h2>Tiempo promedio de atención</h2><p><strong>{data.response_time.average_hours == null ? 'No disponible' : `${data.response_time.average_hours} horas`}</strong></p><p>{data.response_time.reason}</p></section>
      </div>
    </>}
    {reportOpen && data && <ExecutiveReportModal isOpen onClose={() => setReportOpen(false)} data={data} />}
  </div>;
}
