"use client";
import React, { useState } from 'react';
import styles from './citizens.module.scss';
import { 
  Search, PhoneCall, X, Send, CheckCircle2, MessageSquare, 
  PhoneOutgoing, Mail, MapPin, AlertCircle, Info, ShieldCheck, UserCheck, AlertTriangle
} from 'lucide-react';

interface CitizenItem {
  id: string;
  name: string;
  handle: string;
  neighborhood: string;
  reports: number;
  communityRole: 'Ciudadano' | 'Líder Comunitario' | 'Presidente JAC' | 'Veedor Ciudadano';
  origenDato: 'CIUDADANO' | 'OPERADOR' | 'FORMULARIO';
  metaDirectAllowed: boolean;
  phone?: string;
  email?: string;
  sentiment: string;
  network: string;
}

const MOCK_CITIZENS: CitizenItem[] = [
  { 
    id: 'CIUD-01', 
    name: 'Juan Pérez', 
    handle: '@JuanPerezNeiva', 
    neighborhood: 'Las Granjas (Comuna 2)', 
    reports: 6, 
    communityRole: 'Presidente JAC', 
    origenDato: 'OPERADOR', 
    metaDirectAllowed: false, 
    phone: '312 456 7890', 
    email: 'juan.perez@jacgranjas.org', 
    sentiment: 'Crítico', 
    network: 'Facebook' 
  },
  { 
    id: 'CIUD-02', 
    name: 'María Gómez', 
    handle: '@MariaGomez_Huila', 
    neighborhood: 'Centro - Av. La Toma', 
    reports: 3, 
    communityRole: 'Ciudadano', 
    origenDato: 'CIUDADANO', 
    metaDirectAllowed: true, 
    phone: '315 987 6543', 
    email: 'maria.gomez@gmail.com', 
    sentiment: 'Positivo', 
    network: 'Instagram' 
  },
  { 
    id: 'CIUD-03', 
    name: 'Veeduría Malecón', 
    handle: '@NeivaAlerta', 
    neighborhood: 'El Malecón (Comuna 4)', 
    reports: 8, 
    communityRole: 'Veedor Ciudadano', 
    origenDato: 'FORMULARIO', 
    metaDirectAllowed: true, 
    phone: 'No registrado', 
    email: 'veeduria.malecon@redveedurias.co', 
    sentiment: 'Preocupado', 
    network: 'Instagram' 
  },
  { 
    id: 'CIUD-04', 
    name: 'Carlos Alberto Díaz', 
    handle: '@CarlosDiaz_Canaima', 
    neighborhood: 'Canaima (Comuna 6)', 
    reports: 7, 
    communityRole: 'Líder Comunitario', 
    origenDato: 'OPERADOR', 
    metaDirectAllowed: false, 
    phone: '320 123 4567', 
    sentiment: 'Crítico', 
    network: 'Facebook' 
  },
  { 
    id: 'CIUD-05', 
    name: 'Dra. Patricia Charry', 
    handle: '@DraPatriciaCharry', 
    neighborhood: 'Quirinal (Comuna 3)', 
    reports: 5, 
    communityRole: 'Ciudadano', 
    origenDato: 'CIUDADANO', 
    metaDirectAllowed: false, 
    phone: 'No suministrado', 
    sentiment: 'Crítico', 
    network: 'Facebook' 
  },
  { 
    id: 'CIUD-06', 
    name: 'Vecinos Ipanema', 
    handle: '@VecinosIpanema', 
    neighborhood: 'Ipanema (Comuna 7)', 
    reports: 4, 
    communityRole: 'Líder Comunitario', 
    origenDato: 'FORMULARIO', 
    metaDirectAllowed: true, 
    phone: '310 555 4321', 
    sentiment: 'Positivo', 
    network: 'Instagram' 
  },
  { 
    id: 'CIUD-07', 
    name: 'Neiva Sostenible', 
    handle: '@NeivaSostenible', 
    neighborhood: 'San Martín (Comuna 2)', 
    reports: 5, 
    communityRole: 'Veedor Ciudadano', 
    origenDato: 'OPERADOR', 
    metaDirectAllowed: false, 
    phone: 'No registrado', 
    sentiment: 'Preocupado', 
    network: 'Instagram' 
  },
];

export default function CitizensPage() {
  const [search, setSearch] = useState('');
  const [selectedLeader, setSelectedLeader] = useState<CitizenItem | null>(null);
  const [contactMode, setContactMode] = useState<'META_DM' | 'PHONE' | 'VISIT' | 'EMAIL'>('PHONE');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const filtered = MOCK_CITIZENS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase()) ||
    c.communityRole.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenContact = (leader: CitizenItem) => {
    setSelectedLeader(leader);
    setSendSuccess(false);
    // Prioritise phone or meta depending on availability
    if (leader.metaDirectAllowed) {
      setContactMode('META_DM');
      setMessageContent(
        `Estimado(a) ${leader.name}, desde la Alcaldía de Neiva hacemos seguimiento a sus reportes en ${leader.neighborhood}. Estamos coordinando la intervención institucional.`
      );
    } else {
      setContactMode('PHONE');
      setMessageContent(
        `Llamada efectuada con ${leader.name} (${leader.communityRole}) sobre la problemática de ${leader.neighborhood}. Se confirma recepción y se coordina seguimiento.`
      );
    }
  };

  const handleSelectMode = (mode: 'META_DM' | 'PHONE' | 'VISIT' | 'EMAIL') => {
    setContactMode(mode);
    if (!selectedLeader) return;
    if (mode === 'META_DM') {
      setMessageContent(`Estimado(a) ${selectedLeader.name}, desde la Alcaldía de Neiva le informamos avances sobre la atención prioritaria en ${selectedLeader.neighborhood}.`);
    } else if (mode === 'PHONE') {
      setMessageContent(`Minuta de llamada con ${selectedLeader.name} (${selectedLeader.communityRole}): Se concertaron puntos clave sobre ${selectedLeader.neighborhood}.`);
    } else if (mode === 'VISIT') {
      setMessageContent(`Registro de visita en terreno a ${selectedLeader.neighborhood}. Contacto directo con ${selectedLeader.name} para verificación de la situación reportada.`);
    } else if (mode === 'EMAIL') {
      setMessageContent(`Oficio de respuesta institucional dirigido a ${selectedLeader.name} (${selectedLeader.email || 'correo pendiente'}) respecto al caso en ${selectedLeader.neighborhood}.`);
    }
  };

  const handleApplyTemplate = (type: string) => {
    if (!selectedLeader) return;
    if (type === 'radicado') {
      setMessageContent(`Estimado(a) ${selectedLeader.name}, su solicitud referente a ${selectedLeader.neighborhood} cuenta con radicado oficial y fue remitida al despacho sectorial.`);
    } else if (type === 'mesa') {
      setMessageContent(`Estimado(a) ${selectedLeader.name}, le extendemos invitación a la Mesa Técnica de concertación comunitaria para evaluar soluciones en ${selectedLeader.neighborhood}.`);
    } else if (type === 'cuadrilla') {
      setMessageContent(`Estimado(a) ${selectedLeader.name}, le confirmamos que la cuadrilla operativa ya fue despachada para atender el sector de ${selectedLeader.neighborhood}.`);
    }
  };

  const handleSendMessage = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => {
        setSelectedLeader(null);
        setSendSuccess(false);
      }, 1800);
    }, 800);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Directorio de Ciudadanos y Líderes</h1>
        <p>Seguimiento individual, historial de interacción y atención prioritaria comunitaria en Neiva</p>
      </div>

      <div className={styles['stats-grid']}>
        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>Ciudadanos Registrados</div>
          <div className={styles['stat-value']}>1,420</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>Líderes & JAC Validados</div>
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

      {/* Nota aclaratoria sobre política de datos personales */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '10px 16px',
        marginBottom: '1.5rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Info size={16} style={{ color: 'var(--blue-600)', flexShrink: 0 }} />
        <span>
          <strong>Protección de Datos & Políticas Meta:</strong> Meta no suministra datos personales privados (teléfono, correo o cédula). La información de contacto se almacena exclusivamente cuando es entregada voluntariamente por el ciudadano o recopilada y verificada en terreno por el operador institucional.
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem', maxWidth: '400px', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre, barrio, usuario o rol..." 
          style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-input)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles['citizens-table-card']}>
        <table className={styles.table}>
          <thead className={styles['table-head']}>
            <tr>
              <th>Ciudadano / Contacto</th>
              <th>Barrio / Localidad</th>
              <th>Rol Comunitario</th>
              <th>Origen del Dato</th>
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
                      <div className={styles['citizen-handle']}>{c.handle} • {c.network}</div>
                      {c.phone && c.phone !== 'No registrado' && c.phone !== 'No suministrado' && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📞 {c.phone}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{c.neighborhood}</td>
                <td>
                  <span className="badge-tag">{c.communityRole}</span>
                </td>
                <td>
                  <span className={[
                    styles['data-origin-badge'],
                    c.origenDato === 'CIUDADANO' ? styles.ciudadano : c.origenDato === 'OPERADOR' ? styles.operador : styles.formulario
                  ].join(' ')}>
                    {c.origenDato === 'CIUDADANO' && 'Voluntario en redes'}
                    {c.origenDato === 'OPERADOR' && 'Registrado por Operador'}
                    {c.origenDato === 'FORMULARIO' && 'Formulario Web'}
                  </span>
                </td>
                <td><strong>{c.reports} reportes</strong></td>
                <td>
                  <span className={c.sentiment === 'Positivo' ? 'badge-baja' : c.sentiment === 'Crítico' ? 'badge-alta' : 'badge-media'}>
                    {c.sentiment}
                  </span>
                </td>
                <td>
                  <button 
                    type="button"
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => handleOpenContact(c)}
                  >
                    <PhoneCall size={13} /> Gestionar Contacto
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL INTERACTIVO DE CONTACTO / MINUTA */}
      {selectedLeader && (
        <div className={styles['modal-overlay']} onClick={() => setSelectedLeader(null)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h3>Gestión de Contacto y Trazabilidad Ciudadana</h3>
              <button 
                type="button" 
                className={styles['modal-close-btn']}
                onClick={() => setSelectedLeader(null)}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles['modal-body']}>
              {/* Resumen del ciudadano */}
              <div className={styles['leader-summary-box']}>
                <div className={styles['citizen-avatar']}>{selectedLeader.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedLeader.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Rol: <strong>{selectedLeader.communityRole}</strong> • {selectedLeader.neighborhood}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Teléfono: <strong>{selectedLeader.phone || 'No registrado'}</strong> | Correo: <strong>{selectedLeader.email || 'No registrado'}</strong>
                  </div>
                  <div style={{ marginTop: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className={[
                      styles['data-origin-badge'],
                      selectedLeader.origenDato === 'CIUDADANO' ? styles.ciudadano : selectedLeader.origenDato === 'OPERADOR' ? styles.operador : styles.formulario
                    ].join(' ')}>
                      Origen: {selectedLeader.origenDato === 'CIUDADANO' ? 'Voluntario en redes' : selectedLeader.origenDato === 'OPERADOR' ? 'Verificado por Operador' : 'Formulario Oficial'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                      Red: {selectedLeader.network} ({selectedLeader.handle})
                    </span>
                  </div>
                </div>
              </div>

              {/* Advertencia sobre política de canal de Meta */}
              <div className={styles['contact-meta-notice']}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Políticas de contacto institucional:</strong> El envío directo vía Meta Graph API está sujeto a permisos y ventana activa de 24 horas. Para ciudadanos sin interacción reciente o con datos voluntariamente aportados, utilice Registro de Llamada, Correo o Visita en Terreno.
                </div>
              </div>

              {/* Selector de modo de contacto */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Canal de Comunicación o Registro:
                </label>
                <div className={styles['contact-channels']}>
                  <button
                    type="button"
                    className={[styles['channel-tab'], contactMode === 'META_DM' ? styles.active : ''].join(' ')}
                    onClick={() => handleSelectMode('META_DM')}
                  >
                    <MessageSquare size={13} /> Meta DM ({selectedLeader.network})
                  </button>
                  <button
                    type="button"
                    className={[styles['channel-tab'], contactMode === 'PHONE' ? styles.active : ''].join(' ')}
                    onClick={() => handleSelectMode('PHONE')}
                  >
                    <PhoneOutgoing size={13} /> Llamada Telefónica
                  </button>
                  <button
                    type="button"
                    className={[styles['channel-tab'], contactMode === 'VISIT' ? styles.active : ''].join(' ')}
                    onClick={() => handleSelectMode('VISIT')}
                  >
                    <MapPin size={13} /> Visita en Terreno
                  </button>
                  <button
                    type="button"
                    className={[styles['channel-tab'], contactMode === 'EMAIL' ? styles.active : ''].join(' ')}
                    onClick={() => handleSelectMode('EMAIL')}
                  >
                    <Mail size={13} /> Correo Institucional
                  </button>
                </div>
              </div>

              {/* Estado de permiso para Meta DM si está seleccionado */}
              {contactMode === 'META_DM' && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedLeader.metaDirectAllowed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${selectedLeader.metaDirectAllowed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  fontSize: '0.75rem',
                  color: selectedLeader.metaDirectAllowed ? '#059669' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {selectedLeader.metaDirectAllowed ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Ventana de mensajería activa (24h). Permitido el envío de mensaje institucional directo.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} />
                      <span>Ventana de 24h expirada o sin consentimiento de mensajería directa en Meta. Seleccione <strong>Llamada</strong> o <strong>Visita en Terreno</strong>.</span>
                    </>
                  )}
                </div>
              )}

              {/* Plantillas rápidas */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Plantillas Rápidas Institucionales:
                </label>
                <div className={styles['quick-templates']}>
                  <button type="button" className={styles['template-chip']} onClick={() => handleApplyTemplate('radicado')}>
                    📄 Radicado Oficial
                  </button>
                  <button type="button" className={styles['template-chip']} onClick={() => handleApplyTemplate('mesa')}>
                    🤝 Convocatoria Mesa Técnica
                  </button>
                  <button type="button" className={styles['template-chip']} onClick={() => handleApplyTemplate('cuadrilla')}>
                    🚜 Despacho Cuadrilla en Terreno
                  </button>
                </div>
              </div>

              {/* Área de texto */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {contactMode === 'META_DM' && 'Mensaje Oficial a Enviar:'}
                  {contactMode === 'PHONE' && 'Minuta de la Conversación Telefónica:'}
                  {contactMode === 'VISIT' && 'Informe de Visita y Acuerdos en Terreno:'}
                  {contactMode === 'EMAIL' && 'Cuerpo del Oficio / Correo Institucional:'}
                </label>
                <textarea
                  className={styles['modal-textarea']}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Detalle la información, compromisos o minuta del contacto..."
                />
              </div>

              {sendSuccess && (
                <div className={styles['success-alert']}>
                  <CheckCircle2 size={16} />
                  <span>
                    {contactMode === 'META_DM' && `¡Mensaje enviado a ${selectedLeader.handle} vía ${selectedLeader.network}!`}
                    {contactMode === 'PHONE' && `¡Minuta de llamada registrada en el expediente de ${selectedLeader.name}!`}
                    {contactMode === 'VISIT' && `¡Visita en terreno registrada con soporte documental!`}
                    {contactMode === 'EMAIL' && `¡Oficio remitido satisfactoriamente a ${selectedLeader.email}!`}
                  </span>
                </div>
              )}
            </div>

            <div className={styles['modal-footer']}>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => setSelectedLeader(null)}
                disabled={isSending}
              >
                Cancelar
              </button>
              <button 
                type="button"
                className="btn-primary" 
                onClick={handleSendMessage}
                disabled={
                  isSending || 
                  sendSuccess || 
                  !messageContent.trim() || 
                  (contactMode === 'META_DM' && !selectedLeader.metaDirectAllowed)
                }
              >
                {isSending ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>
                      {contactMode === 'META_DM' && (selectedLeader.metaDirectAllowed ? 'Enviar DM Meta' : 'Ventana Inactiva')}
                      {contactMode === 'PHONE' && 'Guardar Minuta de Llamada'}
                      {contactMode === 'VISIT' && 'Registrar Visita en Terreno'}
                      {contactMode === 'EMAIL' && 'Enviar Oficio por Correo'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
