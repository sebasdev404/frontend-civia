'use client';

import { useRef, useState } from 'react';
import { X, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { API } from '@/lib/api/client';
import styles from '@/app/citizens/citizens.module.scss';
import ContactOriginFields from './ContactOriginFields';
import { ContactOrigin, CONTACT_PHONE_HELP } from '@/lib/contact-origin';

interface ImportResult {
  preview: boolean;
  file_name: string;
  sheet_name: string;
  columns: string[];
  column_mapping: Record<string, string[]>;
  summary: {
    total_processed: number; new_citizens_added: number; existing_updated: number;
    unchanged: number; duplicates: number; rejected: number; with_phone: number; without_phone: number;
  };
  sample: { name: string; phone: string | null; whatsapp_username: string | null; zone: string | null }[];
  issues: { row: number; reason: string }[];
}

const fieldLabels: Record<string, string> = {
  name: 'Nombre', phone: 'Teléfono', whatsapp_username: 'Usuario WhatsApp',
  profile_name: 'Nombre de perfil', agenda_name: 'Nombre en agenda',
  zone: 'Comuna mencionada', neighborhood: 'Barrio', notes: 'Notas',
};

export default function CitizenImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState<ContactOrigin | ''>('');
  const [observation, setObservation] = useState('');
  const process = async (preview: boolean) => {
    if (!file || !origin || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const response: ImportResult = await API.citizens.importFile(file, preview, { contact_origin: origin, origin_observation: observation });
      setResult(response);
      if (!preview) onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar el archivo');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const summary = result?.summary;
  const completed = result && !result.preview;
  return (
    <div className={styles['modal-overlay']} onClick={() => !busy && onClose()}>
      <section className={styles['modal-card']} role="dialog" aria-modal="true" aria-labelledby="citizen-import-title" onClick={e => e.stopPropagation()} style={{ maxWidth: 760, maxHeight: '90dvh' }}>
        <div className={styles['modal-header']}>
          <h3 id="citizen-import-title"><FileSpreadsheet size={20} /> Importar ciudadanos</h3>
          <button type="button" className={styles['modal-close-btn']} aria-label="Cerrar" disabled={busy} onClick={onClose}><X size={20} /></button>
        </div>
        <div className={`${styles['modal-body']} ${styles['import-body']}`}>
          <p>Sube un Excel (.xlsx) o CSV de hasta 10 MB y 10.000 contactos. Cada contacto debe tener nombre y teléfono. Usa la hoja Contactos.</p>
          <ContactOriginFields origin={origin} observation={observation} disabled={busy || !!completed} onChange={(value, text) => { setOrigin(value); setObservation(text); setResult(null); setError(''); }} />
          <p className={styles['field-hint']}>El origen y la observación se aplican a toda esta carga. Si hay varias procedencias, realiza una carga para cada una.</p>
          <div className={styles['import-template']}>
            <div>
              <strong>1. Descarga y completa la plantilla</strong>
              <p>Conserva los encabezados. Cada fila debe tener Nombre y Teléfono. Las demás columnas son opcionales.</p>
            </div>
            <a className="btn-secondary" href="/templates/plantilla-ciudadanos.csv" download="plantilla-ciudadanos.csv"><Download size={16} /> Descargar plantilla CSV</a>
            <p>La plantilla está vacía. Guarda como CSV UTF-8 o como Excel (.xlsx), con los teléfonos como texto. {CONTACT_PHONE_HELP}</p>
          </div>
          <label className={styles['import-file']}>
            <strong>2. Selecciona tu archivo y revisa la vista previa</strong>
            <input type="file" aria-label="Archivo de contactos" accept=".xlsx,.csv" disabled={busy} onChange={e => { setFile(e.target.files?.[0] || null); setResult(null); setError(''); }} />
          </label>
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>Un teléfono existente se relaciona con su contacto, sin crear otro ciudadano ni reemplazar sus datos. Se conservan las columnas originales y el historial de procedencias. Los registros sin teléfono válido se señalan para corregir.</p>
          {error && <p role="alert" style={{ color: 'var(--red-600)' }}>{error}</p>}
          {summary && result && <>
            <div role="status" style={{ padding: 12, background: 'rgba(59,130,246,.1)', borderRadius: 8 }}>
              <strong>{completed ? 'Importación guardada' : 'Vista previa'} · {summary.total_processed} filas</strong>
              <p>{summary.new_citizens_added} nuevos · {summary.existing_updated} actualizados · {summary.unchanged} sin cambios · {summary.duplicates} repetidos · {summary.rejected} rechazados</p>
              <p>{summary.with_phone} teléfonos válidos · Origen: {origin}</p>
              <small>Hoja: {result.sheet_name} · {result.columns.length} columnas conservadas</small>
            </div>
            <details><summary>Relación de columnas</summary><dl>{Object.entries(result.column_mapping).map(([field, headers]) => <div key={field} style={{ marginBlock: 8 }}><dt style={{ fontWeight: 700 }}>{fieldLabels[field] || field}</dt><dd>{headers.join(' / ')}</dd></div>)}</dl><p>Las demás columnas están disponibles en «Datos importados» de cada ciudadano.</p></details>
            {!completed && <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', textAlign: 'left' }}><caption style={{ textAlign: 'left', marginBottom: 8 }}>Primeros {result.sample.length} contactos válidos</caption><thead><tr><th>Nombre</th><th>Teléfono / usuario</th><th>Comuna</th></tr></thead><tbody>{result.sample.map((row, index) => <tr key={index}><td>{row.name}</td><td>{row.phone || row.whatsapp_username}</td><td>{row.zone || 'No especificada'}</td></tr>)}</tbody></table></div>}
            {result.issues.length > 0 && <details open><summary>Filas para revisar ({summary.rejected + summary.duplicates})</summary><ul>{result.issues.map((issue, index) => <li key={index}>Fila {issue.row}: {issue.reason}</li>)}</ul></details>}
          </>}
        </div>
        <div className={styles['modal-footer']} style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn-ghost" disabled={busy} onClick={onClose}>{completed ? 'Cerrar' : 'Cancelar'}</button>
          {!completed && <button type="button" className="btn-primary" disabled={!file || !origin || busy || (!!summary && summary.new_citizens_added + summary.existing_updated + summary.unchanged === 0)} onClick={() => process(!result)}><Upload size={15} /> {busy ? 'Procesando…' : result ? 'Importar en Ciudadanos' : 'Revisar archivo'}</button>}
        </div>
      </section>
    </div>
  );
}
