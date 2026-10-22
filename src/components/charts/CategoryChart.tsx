"use client";

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryItem {
  name: string;
  department: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
}

const data: CategoryItem[] = [
  { name: 'Servicios Públicos', department: 'Las Ceibas E.S.P.', value: 512, percentage: 28.5, color: '#3b82f6', icon: '💧' },
  { name: 'Infraestructura y Vías', department: 'Sec. Infraestructura', value: 448, percentage: 25.0, color: '#f97316', icon: '🚧' },
  { name: 'Seguridad y Convivencia', department: 'Sec. Gobierno / Policía', value: 358, percentage: 19.9, color: '#ef4444', icon: '🛡️' },
  { name: 'Medio Ambiente y Aseo', department: 'Sec. Medio Ambiente', value: 234, percentage: 13.0, color: '#10b981', icon: '🌿' },
  { name: 'Salud y Educación (PAE)', department: 'Sec. Salud / Educación', value: 143, percentage: 8.0, color: '#8b5cf6', icon: '🏥' },
  { name: 'Movilidad y Tránsito', department: 'Sec. Movilidad', value: 100, percentage: 5.6, color: '#eab308', icon: '🚦' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item: CategoryItem = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: `1px solid ${item.color}`,
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        fontSize: '0.8rem',
        minWidth: '220px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
          <span>{item.icon}</span>
          <span style={{ color: item.color }}>{item.name}</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Responsable: {item.department}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
          <span>Casos Registrados:</span>
          <strong>{item.value} ({item.percentage}%)</strong>
        </div>
      </div>
    );
  }
  return null;
};

export function CategoryChart() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Cargando categorías...</div>;
  }

  const totalCases = data.reduce((acc, cur) => acc + cur.value, 0);

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
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Métrica Central en la Dona */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>
              {totalCases.toLocaleString('es-CO')}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Casos Neiva
            </span>
          </div>
        </div>

        {/* Desglose Detallado con porcentajes y cantidades */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((cat, idx) => (
            <div 
              key={cat.name} 
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                background: activeIndex === idx ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
                border: `1px solid ${activeIndex === idx ? cat.color : 'var(--border)'}`,
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {cat.department}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block' }}>
                  {cat.value}
                </strong>
                <span style={{ fontSize: '0.67rem', color: cat.color, fontWeight: 700 }}>
                  {cat.percentage}%
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
