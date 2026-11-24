"use client";

import { useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.scss';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  label: string;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

function pageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const windowStart = Math.max(2, Math.min(current - 1, total - 3));
  const windowEnd = Math.min(total - 1, Math.max(current + 1, 4));
  const pages: (number | string)[] = [1];
  if (windowStart > 2) pages.push('gap-start');
  for (let page = windowStart; page <= windowEnd; page++) pages.push(page);
  if (windowEnd < total - 1) pages.push('gap-end');
  pages.push(total);
  return pages;
}

export function Pagination({ page, pageSize, total, disabled = false, label, itemLabel = 'comentarios', onPageChange, onPageSizeChange }: PaginationProps) {
  const sizeId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const first = total ? (currentPage - 1) * pageSize + 1 : 0;
  const last = Math.min(currentPage * pageSize, total);

  return <div className={styles.pagination}>
    <div className={styles.summary}>
      <span aria-live="polite">{first.toLocaleString('es-CO')}–{last.toLocaleString('es-CO')} de {total.toLocaleString('es-CO')} {itemLabel}</span>
      {onPageSizeChange && <label htmlFor={sizeId}>Por página<select id={sizeId} value={pageSize} disabled={disabled} onChange={event => onPageSizeChange(Number(event.target.value))}>
        {[5, 10, 20].map(size => <option key={size} value={size}>{size}</option>)}
      </select></label>}
    </div>
    <nav aria-label={label} className={styles.controls}>
      <button type="button" disabled={disabled || currentPage === 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Página anterior"><ChevronLeft size={16} /><span>Anterior</span></button>
      {pageNumbers(currentPage, totalPages).map(item => typeof item === 'number'
        ? <button type="button" key={item} aria-label={`Página ${item}`} aria-current={item === currentPage ? 'page' : undefined} disabled={disabled || total === 0} className={styles.number} onClick={() => onPageChange(item)}>{item}</button>
        : <span aria-hidden="true" key={item} className={styles.gap}>…</span>)}
      <button type="button" disabled={disabled || currentPage === totalPages || total === 0} onClick={() => onPageChange(currentPage + 1)} aria-label="Página siguiente"><span>Siguiente</span><ChevronRight size={16} /></button>
      <span className={styles.pageCount}>Página {currentPage} de {totalPages}</span>
    </nav>
  </div>;
}
