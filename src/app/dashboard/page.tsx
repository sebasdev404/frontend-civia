'use client';
import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAnalyticsOverview } from '@/hooks/useAnalyticsOverview';
import { StartHere } from '@/components/ui/WorkspaceNavigation';
import { ExecutiveReportModal } from '@/components/reports/ExecutiveReportModal';
import { CaseMetrics, CaptureMetrics, SnapshotStatus, MetricCard } from '@/components/analytics/AnalyticsViews';
import styles from '@/components/analytics/AnalyticsViews.module.scss';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useAnalyticsOverview();
  const [reportOpen, setReportOpen] = useState(false);
  const roleNames = { ADMIN: 'Administración', ALCALDE: 'Resumen general', SECRETARIO: 'Atención por dependencia', OPERADOR: 'Gestión ciudadana' };
  return <div className="page">
    <header className={styles.header}><div><h1>Inicio{user ? ` · ${roleNames[user.role]}` : ''}</h1><p>Consulta los registros guardados y continúa la atención. Las cifras de este resumen abarcan todas las dependencias.</p></div><div className={styles.actions}>
      <button className="btn-secondary" disabled={loading} onClick={() => void refresh()}><RefreshCw size={16} />Actualizar cifras</button>
      <button className="btn-primary" disabled={!data || loading} onClick={() => setReportOpen(true)}><FileText size={16} />Informe de datos</button>
    </div></header>
    <StartHere />
    <nav className={styles.links} aria-label="Accesos de trabajo">
      <Link className="btn-secondary" href="/cases?view=review">Revisar comentarios</Link>
      <Link className="btn-secondary" href="/cases?view=cases">Casos y seguimiento</Link>
      <Link className="btn-secondary" href="/citizens">Ciudadanos y contactos</Link>
      {user?.department && <Link className="btn-secondary" href={`/cases?view=cases&department=${encodeURIComponent(user.department)}`}>Dependencia: {user.department}</Link>}
      {user?.role === 'ADMIN' && <Link className="btn-secondary" href="/settings?view=services">Estado de servicios</Link>}
    </nav>
    {loading && <p className={styles.loading} role="status">Consultando las cifras guardadas…</p>}
    {error && <div className={styles.error} role="alert"><strong>No se pudo cargar el resumen</strong><p>{error}</p><button className="btn-secondary" onClick={() => void refresh()}>Reintentar</button></div>}
    {data && <>
      <SnapshotStatus data={data} />
      <h2 className={styles.sectionHeading}>Estado de los expedientes</h2><CaseMetrics data={data} />
      <div className={styles.cards}>
        <MetricCard title="Prioridad alta o crítica pendiente" value={data.cases.critical_open} detail="Expedientes abiertos cuya prioridad registrada es Alta o Crítica." href="/cases?view=cases" />
        <MetricCard title="Prioridad especial abierta" value={data.cases.priority_open} detail="Marca de prioridad institucional guardada en expedientes abiertos." href="/cases?view=cases&priority_only=true" />
        <MetricCard title="Origen pendiente de verificar" value={data.cases.source_needs_review} detail="Registros señalados en la auditoría de procedencia. El resto del histórico también puede requerir revisión." href="/cases?view=cases&provenance=needs_review" />
      </div>
      <h2 className={styles.sectionHeading}>Captura de redes sociales</h2><CaptureMetrics data={data} />
      <Link className="btn-secondary" href="/analytics">Ver distribuciones e indicadores</Link>
    </>}
    {reportOpen && data && <ExecutiveReportModal isOpen onClose={() => setReportOpen(false)} data={data} />}
  </div>;
}
