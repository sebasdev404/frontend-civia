'use client';

import { useRef, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { API } from '@/lib/api/client';
import { ContactOrigin, CONTACT_PHONE_HELP } from '@/lib/contact-origin';
import ContactOriginFields from './ContactOriginFields';
import styles from '@/app/citizens/citizens.module.scss';

export default function CitizenCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [origin, setOrigin] = useState<ContactOrigin | ''>('');
  const [observation, setObservation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  return <div className={styles['modal-overlay']} onClick={() => !busy && onClose()}>
    <section className={styles['modal-card']} role="dialog" aria-modal="true" aria-labelledby="citizen-create-title" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '90dvh' }}>
      <form className={styles['contact-create-form']} onSubmit={async e => {
        e.preventDefault();
        if (pending.current || !origin) return;
        const data = new FormData(e.currentTarget);
        pending.current = true; setBusy(true); setError('');
        try {
          await API.citizens.create({ name: String(data.get('name')), phone: String(data.get('phone')), neighborhood: String(data.get('neighborhood')), zone: String(data.get('zone')), notes: String(data.get('notes')), contact_origin: origin, origin_observation: observation });
          onCreated(); onClose();
        } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar el ciudadano'); }
        finally { pending.current = false; setBusy(false); }
      }}>
        <div className={styles['modal-header']}><h3 id="citizen-create-title"><UserPlus size={20} /> Agregar ciudadano</h3><button type="button" aria-label="Cerrar" className={styles['modal-close-btn']} disabled={busy} onClick={onClose}><X size={20} /></button></div>
        <div className={`${styles['modal-body']} ${styles['contact-form']}`}>
          <p>Registra un contacto con nombre, teléfono y origen. La cédula no es necesaria. Un teléfono solo puede pertenecer a un registro.</p>
          <div className={styles['contact-form-grid']}>
            <label>Nombre completo *<input name="name" required maxLength={100} autoComplete="name" disabled={busy} /></label>
            <label>Teléfono *<input name="phone" required maxLength={30} type="tel" inputMode="tel" autoComplete="tel" aria-describedby="contact-phone-help" disabled={busy} /></label>
          </div>
          <p id="contact-phone-help" className={styles['field-hint']}>{CONTACT_PHONE_HELP}</p>
          <ContactOriginFields origin={origin} observation={observation} disabled={busy} onChange={(value, text) => { setOrigin(value); setObservation(text); }} />
          <div className={styles['contact-form-grid']}>
            <label>Barrio (opcional)<input name="neighborhood" maxLength={150} disabled={busy} /></label>
            <label>Comuna o zona (opcional)<input name="zone" maxLength={100} disabled={busy} /></label>
          </div>
          <label>Notas del contacto (opcional)<textarea name="notes" rows={2} maxLength={2000} disabled={busy} /></label>
          {error && <p role="alert" className={styles['contact-error']}>{error}</p>}
        </div>
        <div className={styles['modal-footer']}><button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="btn-primary" type="submit" disabled={busy || !origin}>{busy ? 'Guardando…' : 'Guardar ciudadano'}</button></div>
      </form>
    </section>
  </div>;
}
