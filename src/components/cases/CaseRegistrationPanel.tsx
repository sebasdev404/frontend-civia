'use client';
import { useState } from 'react';
import { API } from '@/lib/api/client';
import styles from './CaseReopenPanel.module.scss';

export interface Registration { id:string; number:string; institution:string; issued_on:string; evidence_reference:string; actor_name:string; created_at:string; reason:string; is_current:boolean; cancelled_at?:string|null; cancellation_reason?:string|null }
export function CaseRegistrationPanel({id,revision,records,legacy,editable,busy,save}:{id:string;revision:string;records:Registration[];legacy?:string;editable:boolean;busy:boolean;save:(action:()=>Promise<unknown>,message:string)=>Promise<boolean>}) {
  const [mode,setMode]=useState<'register'|'cancel'|''>('');
  const [number,setNumber]=useState(''),[institution,setInstitution]=useState(''),[issued,setIssued]=useState(''),[evidence,setEvidence]=useState(''),[reason,setReason]=useState('');
  const [confirmed,setConfirmed]=useState(false);
  const current=records.find(row=>row.is_current);
  return <section className={styles.panel} aria-labelledby="registration-heading">
    <h3 id="registration-heading">Radicación externa</h3>
    <p>El ID de Ordenemos a Neiva identifica este expediente. Una radicación externa se registra únicamente a partir del soporte emitido por la entidad.</p>
    {current ? <p><strong>{current.number}</strong> · {current.institution}<br/>Fecha del documento: {current.issued_on}<br/>Soporte declarado: {current.evidence_reference}</p> : <p>{legacy ? `Referencia histórica sin soporte registrado: ${legacy}`:'Sin radicación externa registrada.'}</p>}
    {editable && !mode && <div><button type="button" className="btn-secondary" disabled={busy} onClick={()=>{setMode('register');setReason('');setConfirmed(false);}}>{current?'Registrar corrección':'Registrar radicado externo'}</button>{current && <button type="button" className="btn-ghost" disabled={busy} onClick={()=>{setMode('cancel');setReason('');setConfirmed(false);}}>Retirar referencia vigente</button>}</div>}
    {mode && <form onSubmit={async event=>{
      event.preventDefault();
      const success=await save(()=>mode==='register'?API.cases.registerReference(id,{number,institution,issued_on:issued,evidence_reference:evidence,reason,confirmed_review:confirmed,expected_revision:revision}):API.cases.cancelReference(id,{reason,confirmed_review:confirmed,expected_revision:revision}),mode==='register'?'Referencia externa registrada con su soporte. No se envió correspondencia.':'Referencia retirada; el registro anterior se conserva en el historial.');
      if(success){setMode('');setReason('');setConfirmed(false);}
    }}><fieldset disabled={busy}>
      {mode==='register' && <><label>Número del documento externo<input required maxLength={100} value={number} onChange={e=>setNumber(e.target.value)}/></label><label>Entidad emisora<input required minLength={3} maxLength={160} value={institution} onChange={e=>setInstitution(e.target.value)}/></label><label>Fecha de radicación<input required type="date" value={issued} onChange={e=>setIssued(e.target.value)}/></label><label>Referencia del soporte<input required minLength={5} maxLength={2000} value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Documento, enlace o referencia verificable"/></label></>}
      <label>{mode==='cancel'?'Motivo para retirar la referencia':'Motivo del registro o corrección'}<textarea required minLength={20} maxLength={10000} rows={3} value={reason} onChange={e=>setReason(e.target.value)}/></label>
      <label className={styles.confirmation}><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>Cotejé los datos con el soporte externo. Ordenemos a Neiva conserva mi declaración y no acredita recepción por la entidad.</span></label>
      <button className="btn-primary" disabled={!confirmed||reason.trim().length<20}>{mode==='cancel'?'Confirmar retirada':'Guardar referencia'}</button><button className="btn-ghost" type="button" onClick={()=>setMode('')}>Cancelar</button>
    </fieldset></form>}
    {!!records.length && <details><summary>Registros y correcciones ({records.length})</summary>{records.map(row=><article key={row.id}><p><strong>{row.number}</strong> · {row.institution} · {row.is_current?'Vigente':row.cancelled_at?'Retirado':'Anterior'}<br/>{row.reason}<br/>Soporte: {row.evidence_reference}<br/>Registró {row.actor_name} · {new Date(row.created_at).toLocaleString('es-CO',{timeZone:'America/Bogota'})}{row.cancellation_reason&&<><br/>Motivo de retirada: {row.cancellation_reason}</>}</p></article>)}</details>}
  </section>;
}
