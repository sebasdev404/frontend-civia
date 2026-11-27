import type { MetaSyncJob } from '@/lib/api/client';
import styles from '@/app/publications/publications.module.scss';

export function SyncStatus({ job }: { job: MetaSyncJob | null }) {
  if (!job?.id) return null;
  const active = job.status === 'queued' || job.status === 'running';
  const detail = active ? job.progress.detail : job.error || job.result?.detail || 'Actualización terminada.';
  return <div className={styles.syncStatus} role="status">
    <strong>{active ? 'Actualización en segundo plano' : job.status === 'success' ? 'Captura terminada' : 'Actualización con observaciones'}</strong>
    <p>{detail}</p>
    {active && typeof job.progress.total === 'number' && job.progress.total > 0 && <div className={styles.progress}>
      <progress max={job.progress.total} value={job.progress.completed || 0} aria-label="Publicaciones consultadas en esta etapa" />
      <span>{job.progress.network || 'Avance de esta etapa'}: {Math.min(100, Math.max(0, (job.progress.completed || 0) / job.progress.total * 100)).toLocaleString('es-CO', {maximumFractionDigits: 1})} % · {job.progress.completed || 0} de {job.progress.total}</span>
    </div>}
    {active && <small>Los datos se guardan progresivamente. Puedes navegar y volver a consultar el avance; no es necesario pulsar otra vez.</small>}
    {!active && Boolean(job.result?.errors?.length) && <details><summary>Ver observaciones ({job.result!.errors!.length})</summary><ul style={{ paddingLeft: 18, marginTop: 8 }}>{job.result!.errors!.slice(0, 12).map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
  </div>;
}
