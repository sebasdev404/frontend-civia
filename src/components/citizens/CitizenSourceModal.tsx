'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { API } from '@/lib/api/client';
import styles from '@/app/citizens/citizens.module.scss';

interface SourceCitizen {
  name: string;
  source_data: { file_name: string; sheet_name: string; row_number: number; fields: Record<string, string | number | boolean | null> } | null;
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
    <div className={styles['modal-header']}><h3 id="citizen-source-title">Datos importados{citizen ? ` · ${citizen.name}` : ''}</h3><button type="button" aria-label="Cerrar" className={styles['modal-close-btn']} onClick={onClose}><X size={20} /></button></div>
    <div className={styles['modal-body']}>
      {error ? <p role="alert">{error}</p> : !citizen ? <p role="status">Cargando…</p> : citizen.source_data ? <>
        <p>{citizen.source_data.file_name} · {citizen.source_data.sheet_name} · fila {citizen.source_data.row_number}</p>
        <dl>{Object.entries(citizen.source_data.fields).map(([header, value]) => <div key={header} style={{ borderBottom: '1px solid var(--border-color)', paddingBlock: 10 }}><dt style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '.8rem' }}>{header}</dt><dd style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{value === null || value === '' ? 'No disponible' : String(value)}</dd></div>)}</dl>
      </> : <p>Este ciudadano no tiene un archivo de origen registrado.</p>}
    </div>
  </section></div>;
}
