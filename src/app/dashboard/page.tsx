import { Activity, AlertTriangle, MapPin, CheckCircle, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import styles from './dashboard.module.scss';
import SentimentChart from '@/components/charts/SentimentChart';
import CategoryChart from '@/components/charts/CategoryChart';

const RECENT_ALERTS = [
  { id: 'CASO-001', title: 'No más abusos con el recibo del agua', zone: 'Los Pinos', time: 'Hace 20 min', priority: 'Alta' },
  { id: 'CASO-004', title: 'Bloqueo anunciado por transportadores', zone: 'Calle 80', time: 'Hace 45 min', priority: 'Alta' },
  { id: 'CASO-003', title: 'Robo en parque principal a plena luz del día', zone: 'Parque Principal', time: 'Hace 2 horas', priority: 'Media' },
];

export default function DashboardPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Resumen analítico y monitoreo en tiempo real del clima social ciudadano</p>
      </div>

      <div className={styles['metrics-grid']}>
        <div className={styles['metric-card']}>
          <div className={[styles['metric-icon'], styles.blue].join(' ')}>
            <Activity size={24} />
          </div>
          <div>
            <div className={styles['metric-label']}>Total Casos (Mes)</div>
            <div className={styles['metric-value']}>1,284</div>
            <div className={[styles['metric-delta'], styles.up].join(' ')}>+14% vs mes anterior</div>
          </div>
        </div>
        
        <div className={styles['metric-card']}>
          <div className={[styles['metric-icon'], styles.red].join(' ')}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className={styles['metric-label']}>Críticos Pendientes</div>
            <div className={styles['metric-value']}>342</div>
            <div className={[styles['metric-delta'], styles.down].join(' ')}>18 en riesgo de escalada</div>
          </div>
        </div>
        
        <div className={styles['metric-card']}>
          <div className={[styles['metric-icon'], styles.emerald].join(' ')}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className={styles['metric-label']}>Tasa de Resolución</div>
            <div className={styles['metric-value']}>85.4%</div>
            <div className={[styles['metric-delta'], styles.up].join(' ')}>Meta esperada: 80%</div>
          </div>
        </div>
        
        <div className={styles['metric-card']}>
          <div className={[styles['metric-icon'], styles.amber].join(' ')}>
            <MapPin size={24} />
          </div>
          <div>
            <div className={styles['metric-label']}>Zonas Activas</div>
            <div className={styles['metric-value']}>12</div>
            <div className={styles['metric-delta']}>4 focos de alta prioridad</div>
          </div>
        </div>
      </div>

      <div className={styles['charts-grid']}>
        <div className={styles['chart-card']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>Evolución del Sentimiento Ciudadano</div>
            <span className="badge-tag">Últimos 7 días</span>
          </div>
          <SentimentChart />
        </div>
        
        <div className={styles['chart-card']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>Casos por Categoría</div>
            <span className="badge-tag">Distribución</span>
          </div>
          <CategoryChart />
        </div>
      </div>

      <div className={styles['alerts-section']}>
        <div className={styles['alerts-header']}>
          <div>
            <h2 className={styles['chart-title']}>Alertas Críticas Recientes</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Reportes que requieren intervención inmediata de despacho</p>
          </div>
          <Link href="/cases" className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
            Ver todos los casos <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className={styles['alerts-list']}>
          {RECENT_ALERTS.map(alert => (
            <div key={alert.id} className={styles['alert-item']}>
              <div className={styles['alert-info']}>
                <span className={styles['alert-title']}>{alert.title}</span>
                <span className={styles['alert-meta']}>{alert.id} • {alert.zone} • {alert.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={alert.priority === 'Alta' ? 'badge-alta' : 'badge-media'}>{alert.priority}</span>
                <Link href={'/cases/' + alert.id} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                  Atender
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
