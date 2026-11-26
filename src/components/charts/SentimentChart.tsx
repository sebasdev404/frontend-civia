import { Distribution } from '@/components/analytics/AnalyticsViews';

export function SentimentChart({ values }: { values: Record<string, number> }) {
  return <Distribution values={values} empty="No hay emociones registradas para mostrar." />;
}
export default SentimentChart;
