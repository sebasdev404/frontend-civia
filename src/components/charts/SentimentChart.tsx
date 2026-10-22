"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', positivo: 52, neutro: 28, alerta: 20, evento: 'Inicio de semana: Malla vial Centro' },
  { name: 'Mar', positivo: 48, neutro: 32, alerta: 20, evento: 'Reporte fuga de agua Las Granjas' },
  { name: 'Mié', positivo: 62, neutro: 24, alerta: 14, evento: 'Anuncio bacheo nocturno Cra 2da' },
  { name: 'Jue', positivo: 68, neutro: 20, alerta: 12, evento: 'Luminarias LED en Comuna 10' },
  { name: 'Vie', positivo: 44, neutro: 26, alerta: 30, evento: 'Pico: Daño tubería matriz Las Ceibas' },
  { name: 'Sáb', positivo: 71, neutro: 18, alerta: 11, evento: 'Alcaldía al Barrio en Canaima' },
  { name: 'Dom', positivo: 65, neutro: 22, alerta: 13, evento: 'Ciclovía y balance dominical' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const cur = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        fontSize: '0.8rem',
        minWidth: '220px'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '6px', color: '#93c5fd', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          Día {label} • {cur.evento}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#10b981' }}>
          <span>🟢 Aprobación / Positivo:</span>
          <strong>{cur.positivo}%</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#f59e0b' }}>
          <span>🟡 Inquietud / Neutro:</span>
          <strong>{cur.neutro}%</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
          <span>🔴 Indignación / Crítico:</span>
          <strong>{cur.alerta}%</strong>
        </div>
      </div>
    );
  }
  return null;
};

export function SentimentChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Cargando gráfico de sentimiento...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Indicadores Clave de Resumen */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '130px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'block', fontWeight: 600 }}>🟢 APROBACIÓN PROMEDIO</span>
          <strong style={{ fontSize: '1.15rem', color: '#10b981' }}>58.2%</strong>
          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', display: 'block' }}>748 menciones favorables</span>
        </div>
        <div style={{ flex: 1, minWidth: '130px', padding: '8px 12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'block', fontWeight: 600 }}>🟡 EN OBSERVACIÓN</span>
          <strong style={{ fontSize: '1.15rem', color: '#f59e0b' }}>24.1%</strong>
          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', display: 'block' }}>310 consultas y trámites</span>
        </div>
        <div style={{ flex: 1, minWidth: '130px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: '#ef4444', display: 'block', fontWeight: 600 }}>🔴 INDIGNACIÓN / RIESGO</span>
          <strong style={{ fontSize: '1.15rem', color: '#ef4444' }}>17.7%</strong>
          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', display: 'block' }}>226 reclamos de alto impacto</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 260, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPositivo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNeutro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAlerta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={8} />
            <YAxis unit="%" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="positivo" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPositivo)" name="Aprobación" />
            <Area type="monotone" dataKey="neutro" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorNeutro)" name="Inquietud / Neutro" />
            <Area type="monotone" dataKey="alerta" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAlerta)" name="Indignación" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          Aprobación Ciudadana
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          Inquietud / Neutro
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          Indignación / Crítica
        </span>
      </div>
    </div>
  );
}

export default SentimentChart;
