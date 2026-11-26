import { Distribution } from '@/components/analytics/AnalyticsViews';

export function CategoryChart({ values }: { values: Record<string, number> }) {
  return <Distribution values={values} empty="No hay categorías registradas en el histórico." />;
}
export default CategoryChart;
