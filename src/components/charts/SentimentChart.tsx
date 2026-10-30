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

const RUEDA_SENTIMIENTOS_METRICS = [
  {
    category: 'Paz o tranquilidad',
    emoji: '🕊️',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    percent: 42.5,
    cases: 773,
    subEmotions: 'Serenidad, Gratitud, Amor, Confianza, Relajación, Bienestar'
  },
  {
    category: 'Enojo o ira',
    emoji: '😡',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
    percent: 26.8,
    cases: 487,
    subEmotions: 'Rabia, Frustración, Celos, Irritación, Furia, Resentimiento'
  },
  {
    category: 'Alegría',
    emoji: '😊',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    percent: 21.1,
    cases: 384,
    subEmotions: 'Entusiasmo, Diversión, Emoción, Creatividad, Orgullo, Energía'
  },
  {
    category: 'Miedo',
    emoji: '😨',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    percent: 6.0,
    cases: 109,
    subEmotions: 'Ansiedad, Inseguridad, Confusión, Rechazo, Debilidad, Impotencia'
  },
  {
    category: 'Poder o fortaleza',
    emoji: '💪',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.3)',
    percent: 2.1,
    cases: 39,
    subEmotions: 'Confianza, Seguridad en sí mismo, Satisfacción, Valoración personal, Reconocimiento'
  },
  {
    category: 'Tristeza',
    emoji: '😢',
    color: '#818cf8',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.3)',
    percent: 1.5,
    cases: 28,
    subEmotions: 'Soledad, Culpa, Vergüenza, Aburrimiento, Desánimo, Apatía'
  }
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
          <span>🟢 Alegría / Paz:</span>
          <strong>{cur.positivo}%</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#f59e0b' }}>
          <span>🟡 Miedo / Observación:</span>
          <strong>{cur.neutro}%</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
          <span>🔴 Enojo / Indignación:</span>
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
      {/* Rueda de Sentimientos - Distribución de los 1,820 Casos Reales */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ☸️ Rueda de Sentimientos CIVIA (1,820 Casos)
          </span>
          <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>6 Ejes Emocionales Oficiales</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          {RUEDA_SENTIMIENTOS_METRICS.map((emo) => (
            <div 
              key={emo.category} 
              style={{ 
                padding: '8px 10px', 
                background: emo.bg, 
                border: `1px solid ${emo.border}`, 
                borderRadius: '8px',
                transition: 'transform 0.15s ease'
              }}
              title={`Sub-emociones: ${emo.subEmotions}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: emo.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{emo.emoji}</span> {emo.category}
                </span>
                <strong style={{ fontSize: '0.95rem', color: emo.color }}>{emo.percent}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                <span>{emo.cases} casos</span>
                <span style={{ fontStyle: 'italic' }}>{emo.subEmotions.split(',')[0]}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 220, minHeight: 220 }}>
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
            <Area type="monotone" dataKey="positivo" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPositivo)" name="Paz y Alegría" />
            <Area type="monotone" dataKey="neutro" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorNeutro)" name="Miedo / Observación" />
            <Area type="monotone" dataKey="alerta" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAlerta)" name="Enojo / Indignación" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          Paz / Alegría (63.6%)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          Enojo / Ira (26.8%)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          Miedo (6.0%)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#a855f7' }} />
          Poder / Fortaleza (2.1%)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#818cf8' }} />
          Tristeza (1.5%)
        </span>
      </div>
    </div>
  );
}

export default SentimentChart;
