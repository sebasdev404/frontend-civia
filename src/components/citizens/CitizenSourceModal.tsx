'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { API } from '@/lib/api/client';
import styles from '@/app/citizens/citizens.module.scss';

interface SourceCitizen {
  name: string;
  contact_origin: string | null;
  origin_observation: string | null;
  source_data: { registration?: string; contact_origin?: string; origin_observation?: string; file_name?: string; sheet_name?: string; row_number?: number; fields?: Record<string, string | number | boolean | null>; history?: { contact_origin?: string; origin_observation?: string; file_name?: string; sheet_name?: string; row_number?: number; fields?: Record<string, unknown> }[] } | null;
}

export default function CitizenSourceModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [citizen, setCitizen] = useState<SourceCitizen | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    API.citizens.getById(id).then(data => { if (active) setCitizen(data); }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos'); });
    return () => { active = false; };
  }, [id]);
  return <div className={styles['modal-overlay']} onClick={onClose}><section className={styles['modal-card']} role="dialog" aria-modal="true" aria-labelledby="citizen-source-title" onClick={e => e.stopPropagation()} style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}>
    <div className={styles['modal-header']}><h3 id="citizen-source-title">Origen y datos{citizen ? ` · ${citizen.name}` : ''}</h3><button type="button" aria-label="Cerrar" className={styles['modal-close-btn']} onClick={onClose}><X size={20} /></button></div>
    <div className={styles['modal-body']}>
      {error ? <p role="alert">{error}</p> : !citizen ? <p role="status">Cargando…</p> : citizen.source_data ? <>
        <p><strong>Origen:</strong> {citizen.contact_origin || 'No registrado en la carga original'}</p>
        {citizen.origin_observation && <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{citizen.origin_observation}</p>}
        <p>{citizen.source_data.file_name ? `${citizen.source_data.file_name} · ${citizen.source_data.sheet_name} · fila ${citizen.source_data.row_number}` : 'Registro individual'}</p>
        <dl>{Object.entries(citizen.source_data.fields || {}).map(([header, value]) => <div key={header} style={{ borderBottom: '1px solid var(--border-color)', paddingBlock: 10 }}><dt style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '.8rem' }}>{header}</dt><dd style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{value === null || value === '' ? 'No disponible' : String(value)}</dd></div>)}</dl>
        {!!citizen.source_data.history?.length && <details><summary>Procedencias anteriores ({citizen.source_data.history.length})</summary>{citizen.source_data.history.map((entry, index) => <div key={index} style={{ paddingBlock: 12, overflowWrap: 'anywhere' }}><strong>{entry.contact_origin || 'Origen no indicado'}</strong><p>{entry.origin_observation}</p><p>{entry.file_name || 'Registro individual'}{entry.row_number ? ` · fila ${entry.row_number}` : ''}</p><details><summary>Datos conservados</summary><dl>{Object.entries(entry.fields || {}).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value == null ? 'No disponible' : String(value)}</dd></div>)}</dl></details></div>)}</details>}
      </> : <p>Este ciudadano no tiene un archivo de origen registrado.</p>}
    </div>
  </section></div>;
}
