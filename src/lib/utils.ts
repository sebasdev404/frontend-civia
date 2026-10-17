/**
 * Utilidades compartidas de formateo determinista para evitar
 * errores de hidratación entre SSR (Node.js) y CSR (Navegador).
 */
export function formatNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
