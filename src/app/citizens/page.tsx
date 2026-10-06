"use client";
import React, { useState } from 'react';
import styles from './citizens.module.scss';
import { Search, PhoneCall, X, Send, CheckCircle2, MessageSquare, PhoneOutgoing, Building } from 'lucide-react';

interface CitizenItem {
  id: string;
  name: string;
  handle: string;
  neighborhood: string;
  reports: number;
  status: string;
  sentiment: string;
  network: string;
}

const MOCK_CITIZENS: CitizenItem[] = [
  { id: 'CIUD-01', name: 'Juan Pérez', handle: '@JuanPerezNeiva', neighborhood: 'Las Granjas (Comuna 2)', reports: 6, status: 'Presidente JAC', sentiment: 'Crítico', network: 'Facebook' },
  { id: 'CIUD-02', name: 'María Gómez', handle: '@MariaGomez_Huila', neighborhood: 'Centro - Av. La Toma', reports: 3, status: 'Comerciante / Veedor', sentiment: 'Positivo', network: 'Instagram' },
  { id: 'CIUD-03', name: 'Veeduría Malecón', handle: '@NeivaAlerta', neighborhood: 'El Malecón (Comuna 4)', reports: 8, status: 'Veedor de Seguridad', sentiment: 'Preocupado', network: 'Instagram' },
  { id: 'CIUD-04', name: 'Líder Canaima', handle: '@LiderCanaimaNeiva', neighborhood: 'Canaima (Comuna 6)', reports: 7, status: 'Líder Comunitario JAC', sentiment: 'Crítico', network: 'Facebook' },
  { id: 'CIUD-05', name: 'Veeduría Salud Huila', handle: '@VeeduriaSaludHuila', neighborhood: 'Quirinal (Comuna 3)', reports: 5, status: 'Veedor Sector Salud', sentiment: 'Crítico', network: 'Facebook' },
  { id: 'CIUD-06', name: 'Comunidad Ipanema', handle: '@VecinosIpanema', neighborhood: 'Ipanema (Comuna 7)', reports: 4, status: 'Junta de Vecinos', sentiment: 'Positivo', network: 'Instagram' },
  { id: 'CIUD-07', name: 'Neiva Sostenible', handle: '@NeivaSostenible', neighborhood: 'San Martín (Comuna 2)', reports: 5, status: 'Colectivo Ambiental', sentiment: 'Preocupado', network: 'Instagram' },
];

export default function CitizensPage() {
  const [search, setSearch] = useState('');
  const [selectedLeader, setSelectedLeader] = useState<CitizenItem | null>(null);
  const [contactMode, setContactMode] = useState<'META_DM' | 'PHONE'>('META_DM');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const filtered = MOCK_CITIZENS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenContact = (leader: CitizenItem) => {
    setSelectedLeader(leader);
    setSendSuccess(false);
    setMessageContent(
      `Estimado(a) ${leader.name}, nos comunicamos desde el despacho de la Alcaldía de Neiva en seguimiento a los reportes de ${leader.neighborhood}. Estamos priorizando la atención con las secretarías correspondientes.`
    );
  };

  const handleApplyTemplate = (type: string) => {
    if (!selectedLeader) return;
    if (type === 'radicado') {
      setMessageContent(`Estimado(a) ${selectedLeader.name}, su solicitud referente a ${selectedLeader.neighborhood} cuenta con radicado oficial y fue remitida al equipo de respuesta rápida.`);
    } else if (type === 'mesa') {
      setMessageContent(`Estimado(a) ${selectedLeader.name}, le extendemos una cordial invitación a la Mesa Técnica Comunal en el Despacho Municipal para evaluar soluciones en ${selectedLeader.neighborhood}.`);
    } else if (type === 'cuadrilla') {
      setMessageContent(`Estimado(a) ${selectedLeader.name}, le confirmamos que la cuadrilla operativa ya está en terreno atendiendo la contingencia en ${selectedLeader.neighborhood}.`);
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
          <div className={styles['stat-title']}>Ciudadanos Monitoreados</div>
          <div className={styles['stat-value']}>1,420</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-title']}>Líderes Comunitarios</div>
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

      <div style={{ marginBottom: '1.5rem', maxWidth: '400px', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre, barrio o usuario..." 
          style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-input)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles['citizens-table-card']}>
        <table className={styles.table}>
          <thead className={styles['table-head']}>
            <tr>
              <th>Ciudadano</th>
              <th>Barrio / Localidad</th>
              <th>Rol Comunitario</th>
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
                    </div>
                  </div>
                </td>
                <td>{c.neighborhood}</td>
                <td>
                  <span className="badge-tag">{c.status}</span>
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
                    <PhoneCall size={13} /> Contactar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL INTERACTIVO DE CONTACTO A LÍDER */}
      {selectedLeader && (
        <div className={styles['modal-overlay']} onClick={() => setSelectedLeader(null)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h3>Contactar Líder Comunitario</h3>
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
              <div className={styles['leader-summary-box']}>
                <div className={styles['citizen-avatar']}>{selectedLeader.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedLeader.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedLeader.status} • {selectedLeader.neighborhood}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                    Canal: {selectedLeader.network} ({selectedLeader.handle})
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Canal de Comunicación Institucional:
                </label>
                <div className={styles['contact-channels']}>
                  <button
                    type="button"
                    className={[styles['channel-tab'], contactMode === 'META_DM' ? styles.active : ''].join(' ')}
                    onClick={() => setContactMode('META_DM')}
                  >
                    <MessageSquare size={14} /> Mensaje Directo ({selectedLeader.network})
                  </button>
                  <button
                    type="button"
                    className={[styles['channel-tab'], contactMode === 'PHONE' ? styles.active : ''].join(' ')}
                    onClick={() => setContactMode('PHONE')}
                  >
                    <PhoneOutgoing size={14} /> Registro Llamada Telefónica
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Plantillas Rápidas de Respuesta Oficial:
                </label>
                <div className={styles['quick-templates']}>
                  <button type="button" className={styles['template-chip']} onClick={() => handleApplyTemplate('radicado')}>
                    📄 Radicado Oficial
                  </button>
                  <button type="button" className={styles['template-chip']} onClick={() => handleApplyTemplate('mesa')}>
                    🤝 Convocatoria Mesa
                  </button>
                  <button type="button" className={styles['template-chip']} onClick={() => handleApplyTemplate('cuadrilla')}>
                    🚜 Despacho Cuadrilla
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {contactMode === 'META_DM' ? 'Mensaje Oficial a Enviar:' : 'Minuta / Registro de la Conversación:'}
                </label>
                <textarea
                  className={styles['modal-textarea']}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Escriba el mensaje o minuta institucional..."
                />
              </div>

              {sendSuccess && (
                <div className={styles['success-alert']}>
                  <CheckCircle2 size={16} />
                  <span>
                    {contactMode === 'META_DM'
                      ? `¡Mensaje enviado exitosamente a ${selectedLeader.handle} vía ${selectedLeader.network}!`
                      : `¡Llamada registrada y archivada en la ficha de ${selectedLeader.name}!`}
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
                disabled={isSending || sendSuccess || !messageContent.trim()}
              >
                {isSending ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>{contactMode === 'META_DM' ? 'Enviar Mensaje Meta' : 'Guardar Minuta'}</span>
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
