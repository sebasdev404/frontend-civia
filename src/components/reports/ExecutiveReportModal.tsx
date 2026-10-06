"use client";

import React from 'react';
import { X, Printer, FileSpreadsheet, ShieldAlert, Award, FileText, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
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
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Encabezados y contenido con codificación UTF-8 BOM para soporte nativo en Excel
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
              className="btn-secondary" 
              onClick={handleExportCSV}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <FileSpreadsheet size={15} style={{ color: '#16a34a' }} />
              <span>Exportar Excel (CSV)</span>
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handlePrint}
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              <Printer size={15} />
              <span>Imprimir / PDF Oficial</span>
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

