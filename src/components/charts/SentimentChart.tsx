import { metric, rankedCounts } from '@/lib/analytics';
import styles from './AnalyticsCharts.module.scss';

const colors = ['var(--flag-red)', 'var(--flag-green)', 'var(--flag-yellow)', '#b27a7c', '#7ba28a', '#b19a55', '#909094', '#c9c6c3', '#7a7374'];

export function SentimentChart({ values }: { values: Record<string, number> }) {
  const rows = rankedCounts(values).filter(([, count]) => count > 0);
  const total = rows.reduce((sum, [, count]) => sum + count, 0);
  if (!total) return <p className={styles.empty}>No hay emociones registradas para mostrar.</p>;

  const slices = [];
  let accumulated = 0;
  for (const [index, [label, count]] of rows.entries()) {
    const start = accumulated / total * 100;
    accumulated += count;
    const end = accumulated / total * 100;
    slices.push({ label, count, color: colors[index % colors.length], start, end });
  }
  const stops = slices.map(({ color, start, end }) => `${color} ${start}%, ${color} ${end}%`).join(', ');

  return (
    <div className={styles.donutChart}>
      <div className={styles.donut} style={{ backgroundImage: `conic-gradient(${stops})` }}>
        <div className={styles.donutCenter}><strong>{metric(total)}</strong><span>Expedientes</span></div>
      </div>
      <ul className={styles.legend} aria-label="Expedientes por emoción registrada">
        {slices.map(({ label, count, color }) => (
          <li key={label}>
            <span className={styles.legendSwatch} style={{ backgroundColor: color }} aria-hidden="true" />
            <span>{label}</span>
            <strong>{metric(count)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default SentimentChart;
