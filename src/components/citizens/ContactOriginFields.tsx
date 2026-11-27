'use client';

import { CONTACT_ORIGINS, ContactOrigin } from '@/lib/contact-origin';
import styles from '@/app/citizens/citizens.module.scss';

export default function ContactOriginFields({ origin, observation, disabled, onChange }: {
  origin: ContactOrigin | ''; observation: string; disabled: boolean;
  onChange: (origin: ContactOrigin | '', observation: string) => void;
}) {
  return <fieldset disabled={disabled} className={styles['contact-origin-fields']}>
    <legend>Procedencia del contacto</legend>
    <label>Origen *
      <select required value={origin} onChange={e => onChange(e.target.value as ContactOrigin, observation)}>
        <option value="" disabled>Selecciona de dónde viene</option>
        {CONTACT_ORIGINS.map(value => <option key={value}>{value}</option>)}
      </select>
    </label>
    <label><span>Observación del origen <span className={styles['field-hint']}>(opcional)</span></span>
      <textarea rows={3} maxLength={2000} value={observation} onChange={e => onChange(origin, e.target.value)} placeholder="Por ejemplo: nombre del censo, formulario, evento o persona que lo refiere." />
    </label>
  </fieldset>;
}
