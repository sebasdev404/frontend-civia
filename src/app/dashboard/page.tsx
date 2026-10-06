"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, AlertTriangle, MapPin, CheckCircle, Flame, 
  ArrowUpRight, RefreshCw, Radio, Sparkles, Building2,
  Users, ShieldCheck, Wrench, MessageSquare, PlusCircle, 
  PhoneCall, Layers, Server, Cpu, Database, CheckCircle2, Clock
} from 'lucide-react';
import styles from './dashboard.module.scss';
import SentimentChart from '@/components/charts/SentimentChart';
import CategoryChart from '@/components/charts/CategoryChart';
import { API } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';

interface DashboardCase {
  id: string;
  source: string;
  title: string;
  priority: string;
  status: string;
  location: string;
  dateTime: string;
  category: string;
  priority_action?: boolean;
  assigned_department?: string;
  assigned_to?: string;
}

const FALLBACK_DASHBOARD_CASES: DashboardCase[] = [
  {
    id: 'CASO-001',
    source: 'Facebook',
    title: 'No más abusos con el recibo del agua y cortes de Las Ceibas!',
    priority: 'Alta',
    status: 'Pendiente',
    location: 'Las Granjas - Comuna 2',
    dateTime: 'Hace 20 min',
    category: 'Servicios Públicos',
    priority_action: true,
    assigned_department: 'Las Ceibas - Empresas Públicas de Neiva E.S.P.',
    assigned_to: 'Cuadrilla 4 - Acueducto',
  },
  {
    id: 'CASO-004',
    source: 'Facebook',
    title: 'Rebosamiento de aguas residuales e inundación en canaleta barrial',
    priority: 'Alta',
    status: 'Pendiente',
    location: 'Canaima - Comuna 6',
    dateTime: 'Hace 45 min',
    category: 'Servicios Públicos',
    priority_action: true,
    assigned_department: 'Las Ceibas - Empresas Públicas de Neiva E.S.P.',
    assigned_to: 'Equipo Técnico Alcantarillado',
  },
  {
    id: 'CASO-005',
    source: 'Facebook',
    title: 'Colapso en urgencias del Hospital Universitario de Neiva',
    priority: 'Alta',
    status: 'En Gestión',
    location: 'Quirinal - Comuna 3',
    dateTime: 'Hace 1 hora',
    category: 'Salud',
    priority_action: false,
    assigned_department: 'Secretaría de Salud Municipal',
    assigned_to: 'Dra. Patricia Charry',
  },
  {
    id: 'CASO-007',
    source: 'Facebook',
    title: 'Semáforos apagados en Avenida Circunvalar con Carrera 5ta',
    priority: 'Alta',
    status: 'Pendiente',
    location: 'Centro - Av. Circunvalar',
    dateTime: 'Hace 2 horas',
    category: 'Movilidad',
    priority_action: false,
    assigned_department: 'Secretaría de Movilidad y Tránsito',
    assigned_to: 'Técnico de Señalización',
  },
  {
    id: 'CASO-008',
    source: 'Instagram',
    title: 'Luminarias LED fundidas en vía principal de Ipanema',
    priority: 'Baja',
    status: 'Resuelto',
    location: 'Ipanema - Comuna 7',
    dateTime: 'Hace 3 horas',
    category: 'Alumbrado Público',
    priority_action: false,
    assigned_department: 'Alumbrado Público Neiva',
    assigned_to: 'Cuadrilla Móvil LED',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'ALCALDE';

  const [cases, setCases] = useState<DashboardCase[]>(FALLBACK_DASHBOARD_CASES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await API.cases.getAll();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const parsed = data.map((item: any) => ({
            id: item.id,
            source: item.source || 'Facebook',
            title: item.title,
            priority: item.priority || 'Media',
            status: item.status || 'Pendiente',
            location: item.location || 'Neiva',
            dateTime: item.date_time || item.dateTime || 'Reciente',
            category: item.category || 'General',
            priority_action: Boolean(item.priority_action),
            assigned_department: item.assigned_department || 'Despacho Municipal',
            assigned_to: item.assigned_to || 'Sin asignar',
          }));
          setCases(parsed);
        }
      } catch (err) {
        console.warn('Usando datos de respaldo para dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Métricas generales
  const totalReportes = 1280 + cases.length;
  const criticalPending = cases.filter(c => c.priority === 'Alta' && c.status !== 'Resuelto').length;
  const mayoralPriorityCount = cases.filter(c => c.priority_action).length;
  const resolvedCount = cases.filter(c => c.status === 'Resuelto').length;
  const resolvedRate = Math.round((resolvedCount / Math.max(cases.length, 1)) * 100);

  // Casos prioritarios para Alcalde
  const mayoralCases = cases.filter(c => c.priority_action || c.priority === 'Alta');

  // Casos para Secretario (filtrados o de su secretaría)
  const secretaryCases = cases.filter(c => 
    c.assigned_department?.includes('Movilidad') || 
    c.assigned_department?.includes('Ceibas') ||
    c.assigned_department?.includes('Servicios')
  );

  return (
    <div className="page">
      {/* ─── ENCABEZADO DIFERENCIADO POR ROL ──────────────────────── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1>
              {role === 'ALCALDE' && 'Dashboard Ejecutivo'}
              {role === 'SECRETARIO' && 'Dashboard Sectorial'}
              {role === 'OPERADOR' && 'Bandeja Operativa de Monitoreo'}
              {role === 'ADMIN' && 'Dashboard Técnico & Gobernanza'}
            </h1>
            <span className={styles['role-badge-pill']}>
              {role === 'ALCALDE' && '👑 Alcalde: Johan Steed'}
              {role === 'SECRETARIO' && '👔 Dra. Camila Morales (Secretaría)'}
              {role === 'OPERADOR' && '🛠️ Carlos Mendoza (Operador)'}
              {role === 'ADMIN' && '⚙️ Ing. Sofía Valderrama (Admin TI)'}
            </span>
          </div>
          <p>
            {role === 'ALCALDE' && 'Dirección estratégica, índice de tensión social y supervisión de dependencias en Neiva'}
            {role === 'SECRETARIO' && 'Gestión técnica sectorial, asignación de cuadrillas y validación de cierre técnico'}
            {role === 'OPERADOR' && 'Validación de clasificación IA en comentarios de Meta, agrupación de necesidades y contacto ciudadano'}
            {role === 'ADMIN' && 'Monitoreo de infraestructura, integraciones Meta Graph API, motor IA y auditoría'}
          </p>
        </div>
        
        {/* Widget de Estado de Escucha Meta */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text-secondary)'
        }}>
          <Radio size={14} className="text-emerald-500 animate-pulse" />
          <span>Meta Escucha Activa: Facebook Page & Instagram (@JohanSteed)</span>
        </div>
      </div>

      {/* ─── BARRA DE ACCIONES RÁPIDAS PARA OPERADOR / SECRETARIO / ADMIN ─── */}
      {role === 'OPERADOR' && (
        <div className={styles['quick-action-bar']}>
          <Link href="/cases" className={styles['quick-btn']}>
            <MessageSquare size={16} style={{ color: 'var(--blue-600)' }} />
            <span>Revisar Comentarios Meta (7 pendientes)</span>
          </Link>
          <Link href="/cases" className={styles['quick-btn']}>
            <Layers size={16} style={{ color: 'var(--amber-600)' }} />
            <span>Agrupar Comentarios en Caso</span>
          </Link>
          <Link href="/citizens" className={styles['quick-btn']}>
            <PhoneCall size={16} style={{ color: 'var(--emerald-600)' }} />
            <span>Contactar Líder JAC / Registrar Minuta</span>
          </Link>
          <Link href="/map" className={styles['quick-btn']}>
            <MapPin size={16} style={{ color: 'var(--blue-500)' }} />
            <span>Mapa Operativo de Incidentes</span>
          </Link>
        </div>
      )}

      {role === 'SECRETARIO' && (
        <div className={styles['quick-action-bar']}>
          <Link href="/cases" className={styles['quick-btn']}>
            <Building2 size={16} style={{ color: 'var(--blue-600)' }} />
            <span>Ver Casos de mi Dependencia ({secretaryCases.length})</span>
          </Link>
          <Link href="/cases" className={styles['quick-btn']}>
            <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)' }} />
            <span>Validar Cierre Definitivo de Casos</span>
          </Link>
          <Link href="/map" className={styles['quick-btn']}>
            <MapPin size={16} style={{ color: 'var(--amber-600)' }} />
            <span>Mapa Sectorial de Comunas</span>
          </Link>
        </div>
      )}

      {role === 'ADMIN' && (
        <div className={styles['quick-action-bar']}>
          <Link href="/settings" className={styles['quick-btn']}>
            <RefreshCw size={16} style={{ color: 'var(--emerald-600)' }} />
            <span>Diagnóstico en Vivo de Servicios</span>
          </Link>
          <Link href="/settings" className={styles['quick-btn']}>
            <Cpu size={16} style={{ color: 'var(--amber-600)' }} />
            <span>Configuración Modelo IA (GPT-4o)</span>
          </Link>
          <Link href="/cases" className={styles['quick-btn']}>
            <Database size={16} style={{ color: 'var(--blue-600)' }} />
            <span>Auditoría de Casos y Registros</span>
          </Link>
        </div>
      )}

      {/* ─── GRID DE MÉTRICAS SEGÚN ROL ───────────────────────────── */}
      <div className={styles['metrics-grid']}>
        {role === 'ALCALDE' && (
          <>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.blue].join(' ')}>
                <Activity size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Necesidades Detectadas</div>
                <div className={styles['metric-value']}>{totalReportes.toLocaleString()}</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Facebook (64%) • Instagram (36%)
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.amber].join(' ')}>
                <Activity size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Índice de Tensión Social</div>
                <div className={styles['metric-value']} style={{ color: 'var(--amber-600)' }}>42 / 100</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Nivel Moderado (Bajo control)
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.red].join(' ')}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Casos Críticos en Neiva</div>
                <div className={styles['metric-value']}>{criticalPending}</div>
                <div className={[styles['metric-delta'], styles.down].join(' ')}>
                  Requieren despacho prioritario
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.red].join(' ')} style={{ background: '#fee2e2', color: '#b91c1c' }}>
                <Flame size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Prioridad Institucional</div>
                <div className={styles['metric-value']} style={{ color: '#b91c1c' }}>{mayoralPriorityCount}</div>
                <div className={[styles['metric-delta'], styles.down].join(' ')} style={{ color: '#b91c1c' }}>
                  SLA Despacho Alcalde &lt; 24h
                </div>
              </div>
            </div>
          </>
        )}

        {role === 'SECRETARIO' && (
          <>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.blue].join(' ')}>
                <Building2 size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Casos de la Dependencia</div>
                <div className={styles['metric-value']}>{secretaryCases.length}</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Movilidad & Servicios Públicos
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.amber].join(' ')}>
                <Wrench size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>En Gestión / Cuadrilla</div>
                <div className={styles['metric-value']} style={{ color: 'var(--amber-600)' }}>2</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Cuadrillas en terreno
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.emerald].join(' ')}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Solución Registrada</div>
                <div className={styles['metric-value']}>2</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Trabajo técnico finalizado
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.red].join(' ')}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Pendiente Validación Cierre</div>
                <div className={styles['metric-value']} style={{ color: 'var(--red-600)' }}>1</div>
                <div className={[styles['metric-delta'], styles.down].join(' ')}>
                  Requiere su firma de cierre
                </div>
              </div>
            </div>
          </>
        )}

        {role === 'OPERADOR' && (
          <>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.blue].join(' ')}>
                <MessageSquare size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Comentarios Meta Nuevos</div>
                <div className={styles['metric-value']}>28</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Facebook (18) • Instagram (10)
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.amber].join(' ')}>
                <Sparkles size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Pendiente Validación IA</div>
                <div className={styles['metric-value']} style={{ color: 'var(--amber-600)' }}>8</div>
                <div className={[styles['metric-delta'], styles.down].join(' ')}>
                  Revisar toponimia e intención
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.emerald].join(' ')}>
                <Layers size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Comentarios Agrupables</div>
                <div className={styles['metric-value']}>14</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Afines (Limonar / Las Granjas)
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.blue].join(' ')}>
                <Users size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Casos en Atención</div>
                <div className={styles['metric-value']}>6</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Seguimiento con líderes JAC
                </div>
              </div>
            </div>
          </>
        )}

        {role === 'ADMIN' && (
          <>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.emerald].join(' ')}>
                <Radio size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Conectores Meta API</div>
                <div className={styles['metric-value']}>2 / 2</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  FB Page & IG Graph v19.0
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.blue].join(' ')}>
                <Clock size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Último Sync Webhook</div>
                <div className={styles['metric-value']}>Hace 2m</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Latencia promedio: 140ms
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.amber].join(' ')}>
                <Cpu size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Consumo Modelo IA</div>
                <div className={styles['metric-value']} style={{ color: 'var(--amber-600)' }}>14.2k</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Tokens procesados hoy
                </div>
              </div>
            </div>
            <div className={styles['metric-card']}>
              <div className={[styles['metric-icon'], styles.blue].join(' ')}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className={styles['metric-label']}>Usuarios del Sistema</div>
                <div className={styles['metric-value']}>4</div>
                <div className={[styles['metric-delta'], styles.up].join(' ')}>
                  Admin, Alcalde, Secretario, Operador
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── GRÁFICOS DE INTELIGENCIA (Para Alcalde, Secretario y Operador) ─── */}
      {role !== 'ADMIN' && (
        <div className={styles['charts-grid']}>
          <div className={styles['chart-card']}>
            <div className={styles['chart-header']}>
              <div className={styles['chart-title']}>Evolución del Sentimiento Ciudadano (Neiva)</div>
              <span className="badge-tag">Últimos 7 días</span>
            </div>
            <SentimentChart />
          </div>
          
          <div className={styles['chart-card']}>
            <div className={styles['chart-header']}>
              <div className={styles['chart-title']}>Casos por Dependencia y Categoría</div>
              <span className="badge-tag">Distribución</span>
            </div>
            <CategoryChart />
          </div>
        </div>
      )}

      {/* ─── SECCIÓN DE CASOS / ALERTAS SEGÚN ROL ───────────────────── */}
      <div className={styles['alerts-section']}>
        <div className={styles['alerts-header']}>
          <div>
            <h2 className={styles['chart-title']}>
              {role === 'ALCALDE' && 'Casos Prioritarios y Sello de Despacho en Neiva'}
              {role === 'SECRETARIO' && 'Casos Asignados a la Secretaría (Movilidad / Servicios)'}
              {role === 'OPERADOR' && 'Comentarios Meta y Casos Pendientes de Gestión'}
              {role === 'ADMIN' && 'Registro Técnico de Transacciones y Eventos'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {role === 'ALCALDE' && 'Supervisión ejecutiva de incidentes críticos para prevención de crisis'}
              {role === 'SECRETARIO' && 'Casos que requieren asignación técnica, seguimiento o validación de cierre'}
              {role === 'OPERADOR' && 'Validación humana de clasificación IA y agrupación de comentarios similares'}
              {role === 'ADMIN' && 'Eventos registrados por el pipeline de Meta y estado de servicios locales'}
            </p>
          </div>
          <Link href="/cases" className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
            Ver todos los casos <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className={styles['alerts-list']}>
          {(role === 'SECRETARIO' ? secretaryCases : mayoralCases).slice(0, 4).map(alert => (
            <div key={alert.id} className={styles['alert-item']}>
              <div className={styles['alert-info']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={styles['alert-title']}>{alert.title}</span>
                  {alert.priority_action && (
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171',
                      borderRadius: '999px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 
                    }}>
                      <Flame size={11} /> Prioridad Institucional
                    </span>
                  )}
                  {role === 'SECRETARIO' && alert.assigned_to && (
                    <span className="badge-tag" style={{ fontSize: '0.65rem' }}>
                      👷 {alert.assigned_to}
                    </span>
                  )}
                </div>
                <span className={styles['alert-meta']}>
                  {alert.id} • {alert.location} • Red: {alert.source} • {alert.dateTime}
                  {alert.assigned_department && ` • Dependencia: ${alert.assigned_department}`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <span className={alert.priority === 'Alta' ? 'badge-alta' : 'badge-media'}>
                  {alert.priority}
                </span>
                <Link href={'/cases/' + alert.id} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                  {role === 'SECRETARIO' ? 'Gestionar' : role === 'OPERADOR' ? 'Atender' : 'Supervisar'} <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
