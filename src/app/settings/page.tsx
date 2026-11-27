'use client';
import { Suspense,useCallback,useEffect,useState } from 'react';
import Link from 'next/link';
import { useRouter,useSearchParams } from 'next/navigation';
import { API } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_PASSWORD_PATTERN, PASSWORD_RULES, passwordPolicyError } from '@/lib/password-policy';
import styles from './administration.module.scss';

interface Account {id:string;full_name:string;email:string;role:string;department?:string;is_active:boolean;account_revision:string;welcome_email_status?:string|null;welcome_email_detail?:string|null}
interface Service {status:string;detail:string;latency_ms?:number|null;uptime_seconds?:number}
interface Budget {status:string;detail:string;initial_budget_usd:number|null;remaining_usd:number|null;consumed_usd:number|null;billing_url:string;budget_source:string}
const emptyForm={full_name:'',email:'',password:'1234',role:'OPERADOR',department:'',is_active:true,reason:''};
const accountRoles=[['ADMIN','Administrador'],['ALCALDE','Alcalde'],['SECRETARIO','Secretaría'],['OPERADOR','Operador']];

function Settings() {
  const {user}=useAuth(),router=useRouter(),params=useSearchParams();
  const view=params.get('view')||'users';
  const [accounts,setAccounts]=useState<Account[]>([]),[services,setServices]=useState<Record<string,Service>>({}),[budget,setBudget]=useState<Budget|null>(null);
  const [loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[search,setSearch]=useState('');
  const [editor,setEditor]=useState<Account|'new'|null>(null),[form,setForm]=useState(emptyForm),[deleting,setDeleting]=useState<Account|null>(null);
  const [amount,setAmount]=useState(''),[remaining,setRemaining]=useState('');
  const refresh=useCallback(async()=>{
    if(user?.role!=='ADMIN')return;
    setLoading(true);setError('');
    try {
      if(view==='users')setAccounts(await API.auth.getUsers());
      else if(view==='services') {const data=await API.system.getDiagnostics();setServices(Object.fromEntries(Object.entries(data).filter(([key])=>key!=='timestamp')) as Record<string,Service>);}
      else {const data=await API.ai.getCredits();setBudget(data);setAmount(data.initial_budget_usd==null?'':String(data.initial_budget_usd));setRemaining(data.remaining_usd==null?'':String(data.remaining_usd));}
    } catch(failure){setError(failure instanceof Error?failure.message:'No se pudo consultar el servidor.');}
    finally{setLoading(false);}
  },[user?.role,view]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- The effect owns this asynchronous request and its loading lifecycle.
  useEffect(()=>{void refresh();},[refresh]);
  if(user?.role!=='ADMIN')return <div className="page"><h1>Administración</h1><p>Esta sección requiere una cuenta administradora.</p><Link href="/account">Ir a mi cuenta y seguridad</Link></div>;
  function edit(account:Account|'new') {setEditor(account);setError('');setNotice('');setForm(account==='new'?emptyForm:{...emptyForm,...account,department:account.department||'',reason:''});}
  async function saveAccount(event:React.FormEvent) {
    event.preventDefault();if(!editor||busy)return;setError('');setNotice('');
    if(editor==='new'&&form.password!=='1234'){const passwordError=passwordPolicyError(form.password);if(passwordError){setError(passwordError);return;}}
    setBusy(true);
    try {
      let message='Cuenta guardada en el servidor.';
      if(editor==='new') {
        const created=await API.auth.createUser({email:form.email,password:form.password,full_name:form.full_name,role:form.role,department:form.department});
        message=`Cuenta creada. ${created.welcome_email_detail || 'Correo de bienvenida pendiente de envío.'}`;
      } else await API.auth.updateUser(editor.id,{full_name:form.full_name,role:form.role,department:form.department,is_active:form.is_active,reason:form.reason,expected_revision:editor.account_revision});
      setEditor(null);setForm(emptyForm);setNotice(message);await refresh();
    } catch(failure){setError(failure instanceof Error?failure.message:'No se pudo guardar la cuenta.');}
    finally{setBusy(false);}
  }
  return <div className="page">
    <header className="page-header"><div><h1>Administración de Ordenemos a Neiva</h1><p>Cuentas, estado consultado y conexiones del servidor.</p></div><Link className="btn-secondary" href="/audit">Auditoría y eventos</Link></header>
    <nav className={styles.tabs} aria-label="Administración">{[['users','Cuentas y permisos'],['services','Estado del sistema'],['connections','Conexiones y presupuesto']].map(([key,label])=><button key={key} className={view===key?'btn-primary':'btn-secondary'} aria-pressed={view===key} onClick={()=>{setEditor(null);setNotice('');router.replace('/settings?view='+key);}}>{label}</button>)}<button className="btn-secondary" disabled={loading||busy} onClick={()=>void refresh()}>{loading?'Consultando…':'Actualizar'}</button></nav>
    {error&&<p role="alert" className={styles.error}>{error}</p>}{notice&&<p role="status" className={styles.notice}>{notice}</p>}
    {view==='users'&&<>
      <div className={styles.toolbar}><input aria-label="Buscar cuentas" placeholder="Buscar por nombre, correo o equipo" value={search} onChange={e=>setSearch(e.target.value)}/><button className="btn-primary" disabled={busy} onClick={()=>edit('new')}>Crear cuenta</button></div>
      <p>Secretaría consulta todos los expedientes de Ordenemos a Neiva. Las operaciones siguen limitadas por rol. Las claves no se muestran; cada titular puede cambiarlas en Mi cuenta.</p>
      {editor&&<section className={styles.card}><h2>{editor==='new'?'Nueva cuenta':'Editar cuenta'}</h2><form onSubmit={saveAccount}><fieldset disabled={busy} className={styles.form}>
        <label>Nombre completo<input required maxLength={150} value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label>
        {editor==='new'?<><label>Correo de acceso<input type="email" required autoComplete="off" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Contraseña inicial<input type="password" required minLength={4} maxLength={72} pattern={INITIAL_PASSWORD_PATTERN} title={`Usa 1234 como contraseña inicial u otra que cumpla: ${PASSWORD_RULES}`} autoComplete="new-password" aria-describedby="initial-password-help" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><small id="initial-password-help">La contraseña inicial es 1234. Si eliges otra: {PASSWORD_RULES} El usuario podrá cambiarla en Mi cuenta.</small></label></>:<p>Correo de acceso: {editor.email}</p>}
        <label>Rol<select value={form.role} disabled={editor!=='new'&&editor.id===user.id} onChange={e=>setForm({...form,role:e.target.value})}>{accountRoles.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label>Dependencia o equipo<input maxLength={150} value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/></label>
        {editor!=='new'&&<><label className={styles.check}><input type="checkbox" checked={form.is_active} disabled={editor.id===user.id} onChange={e=>setForm({...form,is_active:e.target.checked})}/>Cuenta activa</label><label>Motivo de la modificación<textarea required minLength={20} maxLength={2000} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></label><p>Un cambio de rol o activación invalida los accesos anteriores de esa cuenta.</p></>}
        <div className={styles.actions}><button className="btn-primary">{busy?'Guardando…':'Guardar cuenta'}</button><button type="button" className="btn-secondary" onClick={()=>{setEditor(null);setForm(emptyForm);}}>Cancelar</button></div>
      {editor==='new'&&<p>Al guardar, se enviarán al correo registrado las credenciales iniciales y el enlace de acceso a la plataforma.</p>}</fieldset></form></section>}
      {!loading&&accounts.length===0&&<p>No hay cuentas disponibles en esta consulta.</p>}
      <div className={styles.accounts}>{accounts.filter(account=>[account.full_name,account.email,account.department].join(' ').toLowerCase().includes(search.toLowerCase())).map(account=><article className={styles.card} key={account.id}><h2>{account.full_name}</h2><p>{account.email}</p><p>{account.role} · {account.is_active?'Activa':'Inactiva'}</p><p>{account.department||'Sin equipo registrado'}</p>{account.welcome_email_detail&&<p role="status" style={{color:account.welcome_email_status==='failed'?'var(--red-600)':'var(--text-secondary)',overflowWrap:'anywhere'}}>{account.welcome_email_detail}</p>}<div className={styles.actions}><button className="btn-secondary" disabled={busy} onClick={()=>edit(account)}>Editar</button>{account.id!==user.id&&<button className="btn-secondary" disabled={busy} onClick={()=>setDeleting(account)}>Eliminar cuenta</button>}</div>{deleting?.id===account.id&&<div role="group" aria-label="Confirmar eliminación"><p>Se eliminará el acceso de {account.full_name}. El historial de actuaciones se conserva. Puedes desactivar la cuenta desde Editar para conservar también su perfil.</p><button className="btn-primary" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await API.auth.deleteUser(account.id);setDeleting(null);setNotice('Cuenta eliminada.');await refresh();}catch(failure){setError(failure instanceof Error?failure.message:'No se confirmó la eliminación.');}finally{setBusy(false);}}}>Confirmar eliminación</button><button className="btn-secondary" disabled={busy} onClick={()=>setDeleting(null)}>Cancelar</button></div>}</article>)}</div>
    </>}
    {view==='services'&&<div className={styles.accounts}>{Object.entries(services).map(([key,service])=><section className={styles.card} key={key}><h2>{({postgres:'Base de datos',backend:'API',meta:'Meta',ai:'Análisis',smtp:'Correo'})[key]||key}</h2><strong>{service.status}</strong><p>{service.detail}</p>{service.latency_ms!=null&&<p>Latencia consultada: {service.latency_ms} ms</p>}{service.uptime_seconds!=null&&<p>Tiempo desde inicio del servicio: {service.uptime_seconds} segundos</p>}</section>)}</div>}
    {view!=='users'&&view!=='services'&&<section className={styles.card}><h2>Conexión de análisis y presupuesto declarado</h2><p>{budget?.status||'Sin consultar'}</p><p>{budget?.detail||'No hay datos disponibles.'}</p><p>Las credenciales de Meta, OpenAI y SMTP se administran en el servidor y no se introducen en esta pantalla.</p>
      {budget&&<><a href={budget.billing_url} target="_blank" rel="noopener noreferrer">Consultar facturación en OpenAI</a><p>Presupuesto registrado: {budget.initial_budget_usd==null?'No disponible':`USD ${budget.initial_budget_usd.toFixed(2)}`} · Saldo declarado: {budget.remaining_usd==null?'No disponible':`USD ${budget.remaining_usd.toFixed(2)}`}</p><form onSubmit={async event=>{event.preventDefault();setBusy(true);setError('');try{await API.ai.syncBalance({initial_budget:Number(amount),real_balance:Number(remaining)});setNotice('Declaración guardada. No acredita saldo consultado al proveedor.');await refresh();}catch(failure){setError(failure instanceof Error?failure.message:'No se confirmó el guardado.');}finally{setBusy(false);}}}><fieldset disabled={busy} className={styles.form}><label>Presupuesto declarado (USD)<input type="number" min={0} max={1000000} step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>Saldo declarado (USD)<input type="number" min={0} max={1000000} step="0.01" required value={remaining} onChange={e=>setRemaining(e.target.value)}/></label><button className="btn-primary">Guardar declaración administrativa</button></fieldset></form></>}
    </section>}
  </div>;
}
export default function SettingsPage(){return <Suspense fallback={<p role="status">Cargando administración…</p>}><Settings/></Suspense>;}
