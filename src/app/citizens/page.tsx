"use client";
import React, { useState } from 'react';
import styles from './citizens.module.scss';
import { Search, UserCheck, Shield, HeartHandshake, PhoneCall } from 'lucide-react';

const MOCK_CITIZENS = [
  { id: 'CIUD-01', name: 'Juan Pérez', handle: '@JuanPerezCol', neighborhood: 'Los Pinos', reports: 6, status: 'Líder Comunitario', sentiment: 'Crítico' },
  { id: 'CIUD-02', name: 'María Gómez', handle: '@MariaGomez_99', neighborhood: 'Centro', reports: 3, status: 'Ciudadano Activo', sentiment: 'Positivo' },
  { id: 'CIUD-03', name: 'Carlos Albornoz', handle: '@CiudadanoAlerta', neighborhood: 'Parque Principal', reports: 9, status: 'Veedor Ciudadano', sentiment: 'Preocupado' },
  { id: 'CIUD-04', name: 'Elena Restrepo', handle: '@ElenaR_Vecina', neighborhood: 'Comuna Occidental', reports: 2, status: 'Ciudadano Activo', sentiment: 'Neutral' },
  { id: 'CIUD-05', name: 'Albeiro Castro', handle: '@AlbeiroTransporte', neighborhood: 'Calle 80', reports: 5, status: 'Líder Gremial', sentiment: 'Crítico' },
];

export default function CitizensPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_CITIZENS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Directorio de Ciudadanos y Líderes</h1>
        <p>Seguimiento individual, historial de interacción y atención prioritaria comunitaria</p>
      </div>

      <div className={styles['stats-grid']}>
        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>Ciudadanos Monitoreados</div>
          <div className={styles['stat-value']}>1,420</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>Líderes Comunitarios</div>
          <div className={styles['stat-value']} style={{ color: 'var(--blue-600)' }}>48</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>Tasa de Respuesta</div>
          <div className={styles['stat-value']} style={{ color: 'var(--emerald-600)' }}>94%</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>Interacciones Gestionadas</div>
          <div className={styles['stat-value']}>3,890</div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', maxWidth: '400px', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre, barrio o usuario..." 
          style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-input)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles['citizens-table-card']}>
        <table className={styles.table}>
          <thead className={styles['table-head']}>
            <tr>
              <th>Ciudadano</th>
              <th>Barrio / Localidad</th>
              <th>Rol Comunitario</th>
              <th>Reportes Totales</th>
              <th>Tono Habitual</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody className={styles['table-body']}>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div className={styles['citizen-info']}>
                    <div className={styles['citizen-avatar']}>{c.name.charAt(0)}</div>
                    <div>
                      <div className={styles['citizen-name']}>{c.name}</div>
                      <div className={styles['citizen-handle']}>{c.handle}</div>
                    </div>
                  </div>
                </td>
                <td>{c.neighborhood}</td>
                <td>
                  <span className="badge-tag">{c.status}</span>
                </td>
                <td><strong>{c.reports} reportes</strong></td>
                <td>
                  <span className={c.sentiment === 'Positivo' ? 'badge-baja' : c.sentiment === 'Crítico' ? 'badge-alta' : 'badge-media'}>
                    {c.sentiment}
                  </span>
                </td>
                <td>
                  <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    <PhoneCall size={13} /> Contactar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
