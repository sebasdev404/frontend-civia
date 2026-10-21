"use client";
import React, { useState } from 'react';
import styles from './analytics.module.scss';
import SentimentChart from '@/components/charts/SentimentChart';
import CategoryChart from '@/components/charts/CategoryChart';
import { TrendingUp, MessageSquare, MapPin, ArrowUpRight, Zap, Clock, FileText } from 'lucide-react';
import { ExecutiveReportModal } from '@/components/reports/ExecutiveReportModal';

const CHANNELS = [
  { name: 'Facebook (Página Oficial / Comentarios)', percentage: 64, mentions: '822 reportes', color: '#1877F2' },
  { name: 'Instagram (@JohanSteed / Menciones)', percentage: 36, mentions: '462 reportes', color: '#E1306C' },
];

export default function AnalyticsPage() {
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Análisis de Inteligencia Social</h1>
          <p>Métricas consolidadas, tendencias virales y pronósticos de respuesta ciudadana en Neiva</p>
        </div>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={() => setReportModalOpen(true)}
          style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
        >
          <FileText size={16} />
          <span>Informe Consejo de Gobierno</span>
        </button>
      </div>

      <div className={styles['kpi-grid']}>
        <div className={styles['kpi-card']}>
          <div className={styles['kpi-title']}>Índice de Tensión Social</div>
          <div className={styles['kpi-value']} style={{ color: 'var(--amber-600)' }}>42 / 100</div>
          <div className={styles['kpi-sub']}>Nivel Moderado (Bajo control)</div>
        </div>

        <div className={styles['kpi-card']}>
          <div className={styles['kpi-title']}>Sentimiento Neto Positivo</div>
          <div className={styles['kpi-value']} style={{ color: 'var(--emerald-600)' }}>+58.2%</div>
          <div className={styles['kpi-sub']}>+4.1% respecto a semana pasada</div>
        </div>

        <div className={styles['kpi-card']}>
          <div className={styles['kpi-title']}>Tiempo Promedio de Reacción</div>
          <div className={styles['kpi-value']}>1.4 h</div>
          <div className={styles['kpi-sub']}>Meta de gestión: &lt; 2 horas</div>
        </div>

        <div className={styles['kpi-card']}>
          <div className={styles['kpi-title']}>Menciones Monitoreadas</div>
          <div className={styles['kpi-value']}>1,284</div>
          <div className={styles['kpi-sub']}>100% categorizadas con IA</div>
        </div>
      </div>

      <div className={styles['analytics-grid']}>
        <div className={styles['analytics-card']}>
          <div className={styles['card-title']}>Tendencia de Aprobación vs Indignación</div>
          <SentimentChart />
        </div>

        <div className={styles['analytics-card']}>
          <div className={styles['card-title']}>Volumen por Canales de Escucha</div>
          <div className={styles['channels-list']}>
            {CHANNELS.map(ch => (
              <div key={ch.name} className={styles['channel-row']}>
                <div className={styles['channel-info']}>
                  <span>{ch.name} ({ch.mentions})</span>
                  <span>{ch.percentage}%</span>
                </div>
                <div className={styles['channel-bar-bg']}>
                  <div 
                    className={styles['channel-bar-fill']} 
                    style={{ width: `${ch.percentage}%`, background: ch.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles['analytics-grid']}>
        <div className={styles['analytics-card']}>
          <div className={styles['card-title']}>Categorías más Demandadas</div>
          <CategoryChart />
        </div>

        <div className={styles['analytics-card']}>
          <div className={styles['card-title']}>Términos y Frases más Mencionadas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '1rem 0' }}>
            <span className="badge-alta" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>#LasCeibasResponde (340)</span>
            <span className="badge-alta" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>#AguaLasGranjas (285)</span>
            <span className="badge-media" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Pavimentación La Toma (210)</span>
            <span className="badge-alta" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Inundación Canaima (185)</span>
            <span className="badge-media" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Seguridad Malecón (142)</span>
            <span className="badge-baja" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Alumbrado Ipanema (98)</span>
            <span className="badge-tag" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Semáforos Circunvalar (64)</span>
          </div>
        </div>
      </div>

            {/* ─── RANKING Y DISTRIBUCIÓN TERRITORIAL POR BARRIO ─── */}
      <div className={styles['analytics-card']} style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div className={styles['card-title']} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
              <MapPin size={18} style={{ color: 'var(--blue-600)' }} />
              <span>Ranking de Barrios con Mayor Nivel de Problemáticas (Top 10 Neiva)</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Índice de calor territorial: volumen de quejas, fallas en servicios públicos y deterioro de malla vial
            </p>
          </div>
          <span className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-600)', border: '1px solid rgba(59, 130, 246, 0.25)', fontWeight: 700 }}>
            Cobertura 10 Comunas & Corregimientos
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {[
            { rank: 1, name: 'Las Granjas', commune: 'Comuna 2', issues: 74, pct: 100, category: 'Servicios Públicos', desc: 'Presión en acueducto Las Ceibas y bacheo en Cra 2da', badge: 'badge-alta' },
            { rank: 2, name: 'Canaima', commune: 'Comuna 6', issues: 68, pct: 92, category: 'Servicios Públicos', desc: 'Rebosamiento colector de aguas negras e inundaciones', badge: 'badge-alta' },
            { rank: 3, name: 'Centro - Av. La Toma', commune: 'Comuna 3', issues: 53, pct: 72, category: 'Infraestructura', desc: 'Bacheo vial comercial y sincronización semafórica', badge: 'badge-media' },
            { rank: 4, name: 'El Malecón - La Gaitana', commune: 'Comuna 4', issues: 48, pct: 65, category: 'Seguridad', desc: 'Hurtos a deportistas en sendero y luminarias apagadas', badge: 'badge-alta' },
            { rank: 5, name: 'Las Palmas', commune: 'Comuna 10', issues: 42, pct: 57, category: 'Seguridad', desc: 'Solicitud de patrullaje continuo y vías de acceso', badge: 'badge-alta' },
            { rank: 6, name: 'Chicalá - Camilo Torres', commune: 'Comuna 1', issues: 39, pct: 52, category: 'Infraestructura', desc: 'Deterioro de carpeta asfáltica en ruta de buses', badge: 'badge-media' },
            { rank: 7, name: 'Darío Echandía', commune: 'Comuna 9', issues: 35, pct: 47, category: 'Alumbrado Público', desc: 'Parques sin iluminación y demoras en reposición ESIP', badge: 'badge-media' },
            { rank: 8, name: 'Quirinal - Hospital', commune: 'Comuna 3', issues: 31, pct: 42, category: 'Salud / Movilidad', desc: 'Congestión en accesos a urgencias hospitalarias', badge: 'badge-alta' },
            { rank: 9, name: 'Ipanema', commune: 'Comuna 7', issues: 26, pct: 35, category: 'Movilidad', desc: 'Demarcación de cruces peatonales y reductores', badge: 'badge-baja' },
            { rank: 10, name: 'El Caguán', commune: 'Rural Sur', issues: 22, pct: 30, category: 'Vías Rurales', desc: 'Mantenimiento de placa huellas y recolección rural', badge: 'badge-media' }
          ].map((item) => (
            <div 
              key={item.name}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--bg-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: item.rank <= 3 ? '#ef4444' : 'var(--text-muted)' }}>
                    #{item.rank}
                  </span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({item.commune})
                    </span>
                  </div>
                </div>
                <span className={item.badge} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  {item.category}
                </span>
              </div>

              {/* Barra visual de severidad */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.desc}</span>
                  <strong style={{ color: item.rank <= 3 ? '#ef4444' : 'var(--text-primary)' }}>{item.issues} casos</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${item.pct}%`, 
                      height: '100%', 
                      background: item.rank <= 3 ? '#ef4444' : item.rank <= 7 ? '#f59e0b' : '#3b82f6',
                      borderRadius: '999px'
                    }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* MODAL DE INFORME EJECUTIVO PARA CONSEJO DE GOBIERNO */}
      <ExecutiveReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
      />
    </div>
  );
}
