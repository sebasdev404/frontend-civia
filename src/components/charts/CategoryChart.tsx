"use client";

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { API } from '@/lib/api/client';

interface CategoryItem {
  name: string;
  department: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
}

const CATEGORY_META: Record<string, { department: string; color: string; icon: string }> = {
  'Servicios Públicos': { department: 'Las Ceibas E.S.P.', color: '#3b82f6', icon: '💧' },
  'Infraestructura': { department: 'Sec. Infraestructura', color: '#f97316', icon: '🚧' },
  'Infraestructura Vial': { department: 'Sec. Infraestructura', color: '#f97316', icon: '🚧' },
  'Movilidad': { department: 'Sec. Movilidad y Tránsito', color: '#eab308', icon: '🚦' },
  'Seguridad': { department: 'Sec. Gobierno y Convivencia', color: '#ef4444', icon: '🛡️' },
  'Medio Ambiente': { department: 'Sec. Medio Ambiente', color: '#10b981', icon: '🌿' },
  'Salud': { department: 'Sec. Salud Municipal', color: '#8b5cf6', icon: '🏥' },
  'Educación': { department: 'Sec. Educación Municipal', color: '#ec4899', icon: '🎓' },
  'Alumbrado Público': { department: 'Alumbrado Público ESIP', color: '#06b6d4', icon: '💡' },
  'Atención Ciudadana': { department: 'Despacho Municipal', color: '#6366f1', icon: '🏛️' },
  'General': { department: 'Despacho Municipal', color: '#64748b', icon: '🏛️' },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item: CategoryItem = payload[0].payload;
    return (
      <div style={{
        backgroundColor: '#0f172a',
        border: `1.5px solid ${item.color}`,
        borderRadius: '10px',
        padding: '12px 16px',
        color: '#ffffff',
        boxShadow: '0 20px 30px rgba(0,0,0,0.95), 0 4px 12px rgba(0,0,0,0.8)',
        fontSize: '0.82rem',
        minWidth: '240px',
        position: 'relative',
        zIndex: 9999,
        opacity: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '6px' }}>
          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
          <span style={{ color: item.color, fontSize: '0.95rem' }}>{item.name}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
          Responsable: <strong style={{ color: '#f1f5f9' }}>{item.department}</strong>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: '6px'
        }}>
          <span style={{ color: '#cbd5e1' }}>Casos Registrados:</span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 800,
            color: '#ffffff'
          }}>
            {item.value} ({item.percentage}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function CategoryChart() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [data, setData] = useState<CategoryItem[]>([]);
  const [totalCases, setTotalCases] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        const summary = await API.analytics.getSummary();
        if (isMounted && summary?.categories_distribution) {
          const dist = summary.categories_distribution;
          const total = summary.total_cases || Object.values(dist).reduce((a: any, b: any) => a + b, 0);
          setTotalCases(total);

          const items: CategoryItem[] = Object.entries(dist)
            .map(([catName, count]: [string, any]) => {
              const meta = CATEGORY_META[catName] || { department: 'Despacho Municipal', color: '#94a3b8', icon: '📋' };
              const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
              return {
                name: catName,
                department: meta.department,
                value: count,
                percentage: pct,
                color: meta.color,
                icon: meta.icon,
              };
            })
            .sort((a, b) => b.value - a.value);

          setData(items);
        }
      } catch (err) {
        console.warn('Error fetching dynamic categories:', err);
      } finally {
        if (isMounted) setMounted(true);
      }
    }

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  if (!mounted || data.length === 0) {
    return <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Cargando categorías en tiempo real...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'center' }}>
        {/* Gráfico de Dona con KPI central */}
        <div style={{ position: 'relative', width: '100%', height: 260, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke={activeIndex === index ? '#fff' : 'transparent'}
                    strokeWidth={2}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Métrica Central en la Dona */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            opacity: activeIndex !== null ? 0.08 : 1,
            transition: 'opacity 0.2s ease'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
              Total Casos
            </span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
              {totalCases.toLocaleString()}
            </strong>
            <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>100% Meta</span>
          </div>
        </div>

        {/* Leyenda interactiva */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
          {data.slice(0, 7).map((item, idx) => (
            <div 
              key={item.name} 
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                background: activeIndex === idx ? 'rgba(59, 130, 246, 0.18)' : 'rgba(15, 23, 42, 0.65)',
                border: activeIndex === idx ? `1px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
                  {item.icon} {item.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>{item.value}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '38px', textAlign: 'right', fontWeight: 600 }}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;
