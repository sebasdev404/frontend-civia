import { Distribution } from '@/components/analytics/AnalyticsViews';
import { metric, rankedCounts } from '@/lib/analytics';
import styles from './AnalyticsCharts.module.scss';

export function CategoryChart({ values }: { values: Record<string, number> }) {
  const rows = rankedCounts(values);
  const maximum = rows[0]?.[1] ?? 0;
  if (!maximum) return <p className={styles.empty}>No hay categorías registradas en el histórico.</p>;

  const mainCategories = rows.slice(0, 6);
  return (
    <>
      <ul className={styles.bars} aria-label="Categorías con más expedientes">
        {mainCategories.map(([label, count]) => (
          <li key={label}>
            <div className={styles.barLabel}><span>{label}</span><strong>{metric(count)}</strong></div>
            <div className={styles.barTrack} aria-hidden="true">
              <span style={{ width: `${count / maximum * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {rows.length > mainCategories.length && (
        <details className={styles.details}>
          <summary>Ver las {rows.length} categorías</summary>
          <Distribution values={values} />
        </details>
      )}
    </>
  );
}
export default CategoryChart;
