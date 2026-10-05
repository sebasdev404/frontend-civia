"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', positivo: 42, negativo: 24, alerta: 8 },
  { name: 'Mar', positivo: 38, negativo: 35, alerta: 16 },
  { name: 'Mié', positivo: 49, negativo: 22, alerta: 6 },
  { name: 'Jue', positivo: 54, negativo: 18, alerta: 4 },
  { name: 'Vie', positivo: 36, negativo: 44, alerta: 22 },
  { name: 'Sáb', positivo: 63, negativo: 14, alerta: 3 },
  { name: 'Dom', positivo: 58, negativo: 16, alerta: 5 },
];

export function SentimentChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Cargando gráfico de sentimiento...</div>;
  }

  return (
    <div style={{ width: '100%', height: 300, minHeight: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPositivo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorNegativo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAlerta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border)', 
              borderRadius: '8px', 
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-md)'
            }} 
          />
          <Area type="monotone" dataKey="positivo" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPositivo)" name="Aprobación / Positivo" />
          <Area type="monotone" dataKey="negativo" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorNegativo)" name="Preocupación" />
          <Area type="monotone" dataKey="alerta" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerta)" name="Riesgo / Indignación" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SentimentChart;
