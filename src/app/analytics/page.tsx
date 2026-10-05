"use client";
import React from 'react';
import styles from './analytics.module.scss';
import SentimentChart from '@/components/charts/SentimentChart';
import CategoryChart from '@/components/charts/CategoryChart';
import { TrendingUp, MessageSquare, Zap, Clock } from 'lucide-react';

const CHANNELS = [
  { name: 'Facebook', percentage: 48, mentions: '616 reportes', color: '#1877F2' },
  { name: 'Twitter / X', percentage: 32, mentions: '410 reportes', color: '#000000' },
  { name: 'Instagram', percentage: 14, mentions: '180 reportes', color: '#E1306C' },
  { name: 'WhatsApp Bot', percentage: 6, mentions: '78 reportes', color: '#25D366' },
];

export default function AnalyticsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Análisis de Inteligencia Social</h1>
        <p>Métricas consolidadas, tendencias virales y pronósticos de respuesta ciudadana</p>
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
            <span className="badge-alta" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>#ReciboDelAgua (340)</span>
            <span className="badge-media" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Huecos Carrera 5ta (210)</span>
            <span className="badge-alta" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Inseguridad Parque (185)</span>
            <span className="badge-baja" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Alcaldía Responde (142)</span>
            <span className="badge-tag" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Alumbrado Público (98)</span>
            <span className="badge-tag" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Semáforos (64)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
