'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { type AnalyticsOverview, metric, snapshotDate } from '@/lib/analytics';
import { reportRows, reportCsv } from '@/lib/analytics-report';
import styles from './ExecutiveReportModal.module.scss';

interface Props { isOpen: boolean; onClose: () => void; data: AnalyticsOverview }

export function ExecutiveReportModal({ isOpen, onClose, data }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const modal = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const prior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const controls = Array.from(modal.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || []);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); prior?.focus(); };
  }, [isOpen, onClose]);
  if (!isOpen || typeof document === 'undefined') return null;
  const rows = reportRows(data);
  const filename = `CIVIA-resumen-${new Date(data.generated_at).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })}`;
  const csv = () => {
    const url = URL.createObjectURL(new Blob([reportCsv(data)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `${filename}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const pdf = async () => {
    setGenerating(true); setError('');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setProperties({ title: 'CIVIA - Resumen de datos guardados', author: 'CIVIA' });
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 0;
      const page = () => {
        if (y) doc.addPage();
        doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 23, 'F');
        doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.text('CIVIA | Resumen de datos guardados', 15, 14);
        doc.setTextColor(71, 85, 105); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        doc.text(`Consulta: ${snapshotDate(data.generated_at)} | Historico almacenado`, 15, 31);
        y = 42;
      };
      page();
      let section = '';
      for (const row of rows) {
        const value = typeof row.value === 'number' ? metric(row.value) : row.value;
        doc.setFontSize(10);
        const lines: string[] = doc.splitTextToSize(`${row.label}: ${value}`, 178);
        doc.setFontSize(8);
        const note: string[] = row.note ? doc.splitTextToSize(row.note, 178) : [];
        const blockHeight = lines.length * 5 + note.length * 4 + 6 + (section !== row.section ? 10 : 0);
        if (y + blockHeight > pageHeight - 18) { page(); section = ''; }
        if (section !== row.section) {
          section = row.section; doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(29, 78, 216);
          doc.text(section, 15, y); y += 8;
        }
        doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        doc.text(lines, 15, y); y += lines.length * 5;
        if (note.length) { doc.setFontSize(8); doc.setTextColor(71, 85, 105); doc.text(note, 15, y); y += note.length * 4; }
        y += 6;
      }
      const count = doc.getNumberOfPages();
      for (let n = 1; n <= count; n++) { doc.setPage(n); doc.setFontSize(8); doc.setTextColor(100); doc.text(`CIVIA | ${n} / ${count}`, 195, pageHeight - 9, { align: 'right' }); }
      doc.save(`${filename}.pdf`);
    } catch { setError('No se pudo generar el PDF. Puedes reintentar o imprimir el informe.'); }
    finally { setGenerating(false); }
  };

  return createPortal(<div className={styles['modal-overlay']} onClick={onClose}>
    <div ref={modal} role="dialog" aria-modal="true" aria-labelledby="metrics-report-title" className={styles['modal-container']} onClick={event => event.stopPropagation()}>
      <header className={styles['modal-header-bar']}>
        <div className={styles['header-left']}><FileText size={20} /><h3 id="metrics-report-title">Informe de datos guardados</h3></div>
        <div className={styles['header-actions']}>
          <button className="btn-primary" disabled={generating} onClick={() => void pdf()}><Download size={15} />{generating ? 'Generando…' : 'Descargar PDF'}</button>
          <button className="btn-secondary" onClick={csv}><FileSpreadsheet size={15} />Exportar CSV</button>
          <button className="btn-secondary" onClick={() => window.print()}><Printer size={15} />Imprimir</button>
          <button className={styles['close-btn']} onClick={onClose} aria-label="Cerrar informe"><X size={20} /></button>
        </div>
      </header>
      <div className={styles['modal-content-scroll']}>
        {error && <p role="alert">{error}</p>}
        <article className={styles['report-paper']}>
          <header className={styles['paper-header']}><div className={styles['gov-badge']}><span className={styles['gov-entity']}>CIVIA</span><h1 className={styles['gov-title']}>Resumen del histórico guardado</h1><p className={styles['gov-subtitle']}>Consulta: {snapshotDate(data.generated_at)}</p></div></header>
          <div className={styles['summary-banner']}>{data.scope} Las clasificaciones y estados históricos están sujetos a revisión. Este informe no acredita despachos, soluciones ni firmas institucionales.</div>
          {Array.from(new Set(rows.map(row => row.section))).map(section => <section key={section}>
            <h2 className={styles['section-title']}>{section}</h2>
            <table className={styles['report-table']}><thead><tr><th>Indicador</th><th>Valor</th></tr></thead><tbody>{rows.filter(row => row.section === section).map(row => <tr key={row.label}><td>{row.label}{row.note && <small className={styles['row-note']}>{row.note}</small>}</td><td>{typeof row.value === 'number' ? metric(row.value) : row.value}</td></tr>)}</tbody></table>
          </section>)}
        </article>
      </div>
    </div>
  </div>, document.body);
}
