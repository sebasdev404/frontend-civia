'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import styles from './CaseReopenPanel.module.scss';

export function CaseReopenPanel({ busy, onReopen }: { busy: boolean; onReopen: (reason: string, confirmed: boolean) => Promise<boolean> }) {
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (expanded) reasonRef.current?.focus(); }, [expanded]);

  return <div className={styles.panel}>
    <button ref={triggerRef} type="button" className="btn-secondary" disabled={busy} aria-expanded={expanded} aria-controls="case-reopen-form" onClick={() => setExpanded(!expanded)}><RotateCcw size={16} />Reabrir para revisión</button>
    {expanded && <form id="case-reopen-form" onSubmit={async event => {
      event.preventDefault();
      if (busy || !confirmed || reason.trim().length < 20) return;
      if (await onReopen(reason.trim(), confirmed)) { setExpanded(false); setReason(''); setConfirmed(false); }
    }}>
      <p>Volverá a Pendiente para revisar y asignar de nuevo. El cierre anterior, su soporte y las actuaciones se conservan en el historial. La asignación y el borrador anteriores dejan de estar activos.</p>
      <fieldset disabled={busy}>
        <label>Motivo de la reapertura<textarea ref={reasonRef} required minLength={20} maxLength={10000} rows={4} value={reason} onChange={event => setReason(event.target.value)} placeholder="Explica qué información nueva o qué situación obliga a revisar la decisión." /></label>
        <label className={styles.confirmation}><input required type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span>Revisé la decisión anterior y corresponde revisar el caso de nuevo.</span></label>
        <button className="btn-primary" disabled={!confirmed || reason.trim().length < 20}>{busy ? 'Guardando…' : 'Confirmar reapertura'}</button>
        <button type="button" className="btn-ghost" onClick={() => { setExpanded(false); triggerRef.current?.focus(); }}>Cancelar</button>
      </fieldset>
    </form>}
  </div>;
}
