'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { API } from '@/lib/api/client';
import styles from '@/app/citizens/citizens.module.scss';

export interface CitizenDeleteTarget { id: string; name: string }

export default function CitizenDeleteModal({ citizens, onClose, onDeleted }: {
  citizens: CitizenDeleteTarget[];
  onClose: () => void;
  onDeleted: (ids: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const count = citizens.length;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cancel.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending.current) { event.preventDefault(); onClose(); }
      if (event.key === 'Tab') {
        const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), [tabindex="0"]');
        if (!controls?.length) { event.preventDefault(); dialog.current?.focus(); return; }
        const first = controls[0], last = controls[controls.length - 1];
        if (!dialog.current?.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [onClose]);

  const remove = async () => {
    if (pending.current || count === 0) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const result = count === 1 ? await API.citizens.deleteOne(citizens[0].id) : await API.citizens.deleteMany(citizens.map(c => c.id));
      onDeleted(result.deleted_ids);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron eliminar los ciudadanos. Inténtalo nuevamente.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  return <div className={styles['modal-overlay']} onClick={() => !pending.current && onClose()}>
    <section ref={dialog} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="citizen-delete-title" aria-describedby="citizen-delete-description" className={styles['modal-card']} onClick={event => event.stopPropagation()}>
      <div className={styles['modal-header']}>
        <h3 id="citizen-delete-title">{count === 1 ? 'Eliminar ciudadano' : `Eliminar ${count} ciudadanos`}</h3>
        <button type="button" aria-label="Cerrar" className={styles['modal-close-btn']} onClick={onClose} disabled={busy}><X size={20} /></button>
      </div>
      <div className={styles['modal-body']}>
        <p id="citizen-delete-description">Se eliminarán los siguientes registros de Ciudadanos, incluidos sus datos importados. Esta acción no se puede deshacer. Los casos y comentarios se conservan.</p>
        <ul style={{ maxHeight: 220, overflowY: 'auto', margin: 0, paddingLeft: 22 }}>{citizens.map(citizen => <li key={citizen.id} style={{ paddingBlock: 4 }}>{citizen.name} <small style={{ color: 'var(--text-muted)' }}>({citizen.id})</small></li>)}</ul>
        {error && <p role="alert" style={{ color: '#f87171' }}>{error}</p>}
      </div>
      <div className={styles['modal-footer']}>
        <button ref={cancel} type="button" className="btn-ghost" disabled={busy} onClick={onClose}>Cancelar</button>
        <button type="button" className={styles['delete-btn']} disabled={busy || count === 0} onClick={remove}><Trash2 size={15} />{busy ? 'Eliminando…' : count === 1 ? 'Eliminar ciudadano' : `Eliminar ${count} ciudadanos`}</button>
      </div>
    </section>
  </div>;
}
