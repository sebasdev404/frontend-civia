"use client";
import React, { useState } from 'react';
import styles from './analytics.module.scss';
import SentimentChart from '@/components/charts/SentimentChart';
import CategoryChart from '@/components/charts/CategoryChart';
import { TrendingUp, MessageSquare, Zap, Clock, FileText } from 'lucide-react';
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

      {/* MODAL DE INFORME EJECUTIVO PARA CONSEJO DE GOBIERNO */}
      <ExecutiveReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
      />
    </div>
  );
}
