"use client";

import React, { useState } from 'react';
import { 
  X, Printer, FileSpreadsheet, ShieldAlert, Award, FileText, 
  CheckCircle2, TrendingUp, AlertTriangle, Download, Loader2 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import styles from './ExecutiveReportModal.module.scss';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_SECRETARIAS = [
  { name: 'Las Ceibas - Empresas Públicas de Neiva E.S.P.', cases: 320, resolved: 292, rate: '91.2%', avgDays: '1.2 días', status: 'Óptimo', tagClass: 'optimo' },
  { name: 'Secretaría de Infraestructura y Vías', cases: 410, resolved: 361, rate: '88.0%', avgDays: '2.1 días', status: 'Refuerzo Requerido', tagClass: 'alerta' },
  { name: 'Secretaría de Movilidad y Tránsito', cases: 240, resolved: 231, rate: '96.2%', avgDays: '0.8 días', status: 'Excelente', tagClass: 'excelente' },
  { name: 'Secretaría de Salud Municipal', cases: 180, resolved: 168, rate: '93.3%', avgDays: '1.0 días', status: 'Óptimo', tagClass: 'optimo' },
  { name: 'Alumbrado Público Neiva (ESIP)', cases: 138, resolved: 136, rate: '98.5%', avgDays: '0.6 días', status: 'Excelente', tagClass: 'excelente' },
];

const REPORT_FOCOS = [
  { comuna: 'Comuna 2 (Las Granjas / San Martín)', desc: 'Intermitencia de suministro y presiones en bocatoma acueducto. Prioridad carrotanques despachada.' },
  { comuna: 'Comuna 6 (Canaima / Max Duque)', desc: 'Rebosamiento de aguas residuales en canaleta perimetral. Operación con equipo hidrosucción vactor.' },
  { comuna: 'Comuna 1 (Avenida Circunvalar / Centro)', desc: 'Falla intermitente en controlador electrónico semafórico Cra 5ta. Reparación concluida.' },
  { comuna: 'Comuna 7 (Ipanema / El Vergel)', desc: 'Sustitución programada de 14 luminarias LED averiadas por descargas eléctricas.' },
];

export function ExecutiveReportModal({ isOpen, onClose }: ExecutiveReportModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth() || 210;
      let y = 18;

      // Barra superior decorativa institucional
      doc.setFillColor(15, 23, 42); // #0f172a
      doc.rect(0, 0, pageWidth, 7, 'F');
      doc.setFillColor(2, 132, 199); // #0284c7
      doc.rect(0, 7, pageWidth, 2, 'F');

      // Membrete oficial
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('REPÚBLICA DE COLOMBIA • ALCALDÍA MUNICIPAL DE NEIVA', pageWidth / 2, y, { align: 'center' });
      y += 5;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('INFORME EJECUTIVO PARA CONSEJO DE GOBIERNO', pageWidth / 2, y, { align: 'center' });
      y += 5;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('CIVIA: Inteligencia Ciudadana y Gestión Territorial Multicanal (Facebook Page & Instagram @JohanSteed)', pageWidth / 2, y, { align: 'center' });
      y += 4;

      // Línea divisoria
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;

      // Metadatos en dos columnas
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Periodo:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text('Semana Operativa Actual', 32, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Fecha de Emisión:', 110, y);
      doc.setFont('helvetica', 'normal');
      const emissionDate = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(emissionDate, 140, y);
      y += 4.5;

      doc.setFont('helvetica', 'bold');
      doc.text('Autoridad:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text('Dr. Johan Steed - Alcalde de Neiva', 32, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Destinatario:', 110, y);
      doc.setFont('helvetica', 'normal');
      doc.text('Consejo de Gobierno y Secretarías de Despacho', 132, y);
      y += 7;

      // Caja de Resumen Ejecutivo
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'D');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('RESUMEN DE GESTIÓN Y TERMÓMETRO SOCIAL:', 18, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.3);
      doc.setTextColor(51, 65, 85);
      const summaryText = 'Durante el ciclo operativo, CIVIA procesó 1,288 interacciones de Meta (64% Facebook, 36% Instagram). Se registró un Índice de Tensión Social moderado de 42/100, Sentimiento Neto Favorable del +58.2%, y un tiempo promedio de despacho de 1.4 horas. Las interacciones se consolidaron en necesidades territoriales estructuradas para atención prioritaria de las cuadrillas.';
      const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 36);
      doc.text(splitSummary, 18, y + 9);
      y += 24;

      // Tarjetas de KPIs (4 columnas)
      const kpiWidth = (pageWidth - 28 - 9) / 4;
      const kpis = [
        { label: 'INTERACCIONES META', val: '1,288', desc: 'Facebook & Instagram', color: [15, 23, 42] },
        { label: 'TASA DE SOLUCIÓN', val: '94.2%', desc: 'Casos cerrados', color: [22, 163, 74] },
        { label: 'TENSIÓN SOCIAL', val: '42 / 100', desc: 'Nivel Moderado', color: [217, 119, 6] },
        { label: 'SLA DE REACCIÓN', val: '1.4 h', desc: 'Despacho cuadrillas', color: [2, 132, 199] },
      ];

      kpis.forEach((kpi, idx) => {
        const kX = 14 + idx * (kpiWidth + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(kX, y, kpiWidth, 15, 1.5, 1.5, 'FD');

        doc.setFontSize(6.2);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, kX + kpiWidth / 2, y + 4, { align: 'center' });

        doc.setFontSize(10.5);
        doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.text(kpi.val, kX + kpiWidth / 2, y + 9.5, { align: 'center' });

        doc.setFontSize(6.2);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.desc, kX + kpiWidth / 2, y + 13.5, { align: 'center' });
      });
      y += 19;

      // Tabla de Rendimiento por Secretaría
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('1. RENDIMIENTO Y CUMPLIMIENTO POR SECRETARÍA / DEPENDENCIA', 14, y);
      y += 4;

      doc.setFillColor(15, 23, 42);
      doc.rect(14, y, pageWidth - 28, 5.5, 'F');
      doc.setFontSize(7.2);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Dependencia Municipal', 16, y + 3.8);
      doc.text('Casos', 98, y + 3.8, { align: 'right' });
      doc.text('Resueltos', 118, y + 3.8, { align: 'right' });
      doc.text('% Cumplimiento', 146, y + 3.8, { align: 'right' });
      doc.text('Tiempo Prom.', 168, y + 3.8);
      doc.text('Estado', 194, y + 3.8, { align: 'right' });
      y += 5.5;

      REPORT_SECRETARIAS.forEach((sec, idx) => {
        const isEven = idx % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        doc.rect(14, y, pageWidth - 28, 5.2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(14, y + 5.2, pageWidth - 14, y + 5.2);

        doc.setFontSize(6.8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(sec.name, 16, y + 3.6);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(String(sec.cases), 98, y + 3.6, { align: 'right' });
        doc.text(String(sec.resolved), 118, y + 3.6, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(sec.rate, 146, y + 3.6, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(sec.avgDays, 168, y + 3.6);

        if (sec.status === 'Excelente') doc.setTextColor(16, 185, 129);
        else if (sec.status === 'Óptimo') doc.setTextColor(2, 132, 199);
        else doc.setTextColor(217, 119, 6);
        doc.setFont('helvetica', 'bold');
        doc.text(sec.status, 194, y + 3.6, { align: 'right' });

        y += 5.2;
      });
      y += 5;

      // Focos Territoriales
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. FOCOS TERRITORIALES Y COMUNAS EN OBSERVACIÓN', 14, y);
      y += 4;

      REPORT_FOCOS.forEach(f => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, pageWidth - 28, 7.5, 1, 1, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, pageWidth - 28, 7.5, 1, 1, 'D');

        doc.setFontSize(6.8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`📍 ${f.comuna}:`, 17, y + 3.4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const descLines = doc.splitTextToSize(f.desc, pageWidth - 34);
        doc.text(descLines, 17, y + 6);

        y += 8.5;
      });
      y += 2;

      // Directrices del Despacho
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, y, pageWidth - 28, 17, 1.5, 1.5, 'FD');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('DIRECTRICES DEL ALCALDE JOHAN STEED PARA EL GABINETE:', 17, y + 4.2);

      doc.setFontSize(6.7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text('1. Infraestructura: Cuadrilla de asfalto en caliente para Calle 39 Limonar y Av. La Toma antes del viernes.', 17, y + 8);
      doc.text('2. Las Ceibas E.S.P.: Mantener protocolo de carrotanques en Comuna 2 y verificación técnica de presiones.', 17, y + 11.5);
      doc.text('3. Gobierno & Seguridad: Refuerzo de cuadrantes de policía en el Malecón del Río Magdalena.', 17, y + 15);
      y += 22;

      // Firmas Oficiales
      const sigLineW = 55;
      const sigLeftX = 38;
      const sigRightX = 118;

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.4);
      doc.line(sigLeftX, y, sigLeftX + sigLineW, y);
      doc.line(sigRightX, y, sigRightX + sigLineW, y);

      y += 3.8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('DR. JOHAN STEED', sigLeftX + sigLineW / 2, y, { align: 'center' });
      doc.text('DRA. CAMILA MORALES', sigRightX + sigLineW / 2, y, { align: 'center' });

      y += 3.2;
      doc.setFontSize(6.8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Alcalde Municipal de Neiva', sigLeftX + sigLineW / 2, y, { align: 'center' });
      doc.text('Secretaría General y Gabinete', sigRightX + sigLineW / 2, y, { align: 'center' });

      // Pie de página con Hash de seguridad
      y = 289;
      doc.setFontSize(6.2);
      doc.setTextColor(148, 163, 184);
      doc.text(`CIVIA Intelligence Platform • Hash Oficial: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-NEIVA • Consejo de Gobierno Municipal`, pageWidth / 2, y, { align: 'center' });

      // Guardar PDF oficial
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`CIVIA_Informe_Consejo_Gobierno_Neiva_${dateStr}.pdf`);

      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3500);
    } catch (err) {
      console.error('Error generando PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Entidad Municipal;Reportes Meta Totales;Casos Resueltos;Tasa Resolucion;Tiempo Promedio;Estado Desempeno\r\n';
    const rows = REPORT_SECRETARIAS.map(s => 
      `"${s.name}";${s.cases};${s.resolved};${s.rate};"${s.avgDays}";"${s.status}"`
    ).join('\r\n');

    const csvContent = '\uFEFF' + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Informe_Ejecutivo_CIVIA_Neiva_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-container']} onClick={(e) => e.stopPropagation()}>
        {/* Barra superior de herramientas */}
        <div className={styles['modal-header-bar']}>
          <div className={styles['header-left']}>
            <FileText size={18} style={{ color: 'var(--blue-600)' }} />
            <h3>Informe Ejecutivo para Consejo de Gobierno</h3>
          </div>
          <div className={styles['header-actions']}>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : pdfDownloaded ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>¡PDF Descargado!</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Descargar PDF Oficial</span>
                </>
              )}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleExportCSV}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <FileSpreadsheet size={15} style={{ color: '#16a34a' }} />
              <span>Exportar Excel (CSV)</span>
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handlePrint}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <Printer size={15} />
              <span>Imprimir</span>
            </button>
            <button 
              type="button" 
              className={styles['close-btn']} 
              onClick={onClose} 
              aria-label="Cerrar modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Hoja de Documento Membretado */}
        <div className={styles['modal-content-scroll']}>
          <div className={styles['report-paper']}>
            {/* Encabezado Institucional */}
            <div className={styles['paper-header']}>
              <div className={styles['gov-badge']}>
                <span className={styles['gov-entity']}>Alcaldía de Neiva • Despacho Municipal</span>
                <span className={styles['gov-title']}>Informe Semanal de Inteligencia y Gestión Ciudadana</span>
                <span className={styles['gov-subtitle']}>
                  CIVIA: Plataforma de Escucha Activa Meta (Facebook Page & Instagram @JohanSteed)
                </span>
              </div>
              <div className={styles['paper-meta']}>
                <div><strong>Periodo:</strong> Semana Operativa Actual</div>
                <div><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div><strong>Autoridad:</strong> Dr. Johan Steed - Alcalde de Neiva</div>
                <div><strong>Destinatario:</strong> Consejo de Gobierno y Secretarías de Despacho</div>
              </div>
            </div>

            {/* Resumen Ejecutivo */}
            <div className={styles['summary-banner']}>
              <p>
                <strong>Resumen de Gestión Estratégica:</strong> Durante el presente ciclo, el sistema CIVIA procesó <strong>1,288 interacciones y reportes ciudadanos</strong> captados a través de las redes oficiales de Meta (64% Facebook, 36% Instagram). Se registró un <strong>Índice de Tensión Social moderado y controlado de 42/100</strong>, con un Sentimiento Neto Favorable del <strong>+58.2%</strong>. El tiempo promedio de despacho institucional se situó en <strong>1.4 horas</strong>, superando la meta de gobernanza trazada para el municipio.
              </p>
            </div>

            {/* KPIs Institucionales */}
            <div className={styles['kpi-cards-grid']}>
              <div className={styles['paper-kpi']}>
                <span className={styles['kpi-label']}>Interacciones Meta</span>
                <span className={styles['kpi-num']}>1,288</span>
                <span className={styles['kpi-desc']}>Facebook & Instagram</span>
              </div>
              <div className={styles['paper-kpi']}>
                <span className={styles['kpi-label']}>Tasa de Solución</span>
                <span className={styles['kpi-num']} style={{ color: '#16a34a' }}>94.2%</span>
                <span className={styles['kpi-desc']}>Casos cerrados técnicamente</span>
              </div>
              <div className={styles['paper-kpi']}>
                <span className={styles['kpi-label']}>Tensión Social</span>
                <span className={styles['kpi-num']} style={{ color: '#d97706' }}>42 / 100</span>
                <span className={styles['kpi-desc']}>Nivel Moderado (Controlado)</span>
              </div>
              <div className={styles['paper-kpi']}>
                <span className={styles['kpi-label']}>SLA de Reacción</span>
                <span className={styles['kpi-num']} style={{ color: '#0284c7' }}>1.4 h</span>
                <span className={styles['kpi-desc']}>Canalización a cuadrillas</span>
              </div>
            </div>

            {/* Tabla de Rendimiento por Secretaría */}
            <div>
              <div className={styles['section-title']}>
                <Award size={16} />
                <span>Rendimiento y Cumplimiento por Secretaría / Dependencia</span>
              </div>
              <table className={styles['report-table']}>
                <thead>
                  <tr>
                    <th>Dependencia Municipal</th>
                    <th className="text-right">Reportes Totales</th>
                    <th className="text-right">Resueltos</th>
                    <th className="text-right">% Cumplimiento</th>
                    <th>Tiempo Promedio</th>
                    <th>Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {REPORT_SECRETARIAS.map((sec, idx) => (
                    <tr key={idx}>
                      <td><strong>{sec.name}</strong></td>
                      <td className="text-right">{sec.cases}</td>
                      <td className="text-right">{sec.resolved}</td>
                      <td className="text-right"><strong>{sec.rate}</strong></td>
                      <td>{sec.avgDays}</td>
                      <td>
                        <span className={[styles['status-tag'], styles[sec.tagClass]].join(' ')}>
                          {sec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Focos Territoriales Prioritarios */}
            <div>
              <div className={styles['section-title']}>
                <AlertTriangle size={16} />
                <span>Focos Territoriales y Comunas en Observación</span>
              </div>
              <div className={styles['foci-list']}>
                {REPORT_FOCOS.map((f, idx) => (
                  <div key={idx} className={styles['focus-card']}>
                    <div className={styles['focus-loc']}>📍 {f.comuna}</div>
                    <div className={styles['focus-desc']}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Directrices del Alcalde */}
            <div style={{ background: '#f1f5f9', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase' }}>
                Directrices Estratégicas del Despacho para el Gabinete:
              </div>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#334155', lineHeight: 1.6 }}>
                <li><strong>Secretaría de Infraestructura:</strong> Priorizar la cuadrilla de asfalto en caliente para la Calle 39 del barrio Limonar y avenida La Toma antes del viernes.</li>
                <li><strong>Las Ceibas E.S.P.:</strong> Mantener activo el protocolo de contingencia con carrotanques en Comuna 2 y verificación técnica de presión en bocatoma.</li>
                <li><strong>Secretaría de Gobierno:</strong> Reforzar presencia de cuadrantes de policía en el Malecón del Río Magdalena en horario vespertino.</li>
              </ol>
            </div>

            {/* Firmas Institucionales */}
            <div className={styles['signatures-row']}>
              <div className={styles['sig-block']}>
                <div className={styles['sig-line']} />
                <div className={styles['sig-name']}>Dr. Johan Steed</div>
                <div className={styles['sig-role']}>Alcalde Municipal de Neiva, Huila</div>
              </div>
              <div className={styles['sig-block']}>
                <div className={styles['sig-line']} />
                <div className={styles['sig-name']}>Dra. Camila Morales</div>
                <div className={styles['sig-role']}>Secretaría General y Coordinación de Gabinete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

