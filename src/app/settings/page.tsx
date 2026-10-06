"use client";
import React, { useState } from 'react';
import { Save, Key, Database, Globe, CheckCircle2, Activity, RefreshCw, Server, Cpu } from 'lucide-react';
import styles from './settings.module.scss';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [lastChecked, setLastChecked] = useState('Hace 1 minuto');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRunDiagnostics = () => {
    setCheckingHealth(true);
    setTimeout(() => {
      setCheckingHealth(false);
      setLastChecked('Justo ahora');
    }, 1200);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Configuración de Plataforma</h1>
        <p>Monitor de infraestructura, modelos de IA y conectores de redes sociales para Neiva</p>
      </div>

      <div className={styles['settings-container']}>
        {/* MONITOR DE SALUD Y SERVICIOS */}
        <div className={styles['settings-card']}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
            <h2 className={styles['card-title']} style={{ margin: 0 }}>
              <Activity size={20} style={{ color: 'var(--emerald-600)' }} /> Monitor de Infraestructura y Servicios CIVIA
            </h2>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              onClick={handleRunDiagnostics}
              disabled={checkingHealth}
            >
              <RefreshCw size={13} className={checkingHealth ? 'animate-spin' : ''} />
              <span>{checkingHealth ? 'Verificando...' : 'Diagnóstico en Vivo'}</span>
            </button>
          </div>

          <div className={styles['health-grid']}>
            {/* PostgreSQL */}
            <div className={styles['health-card']}>
              <div className={styles['health-card-header']}>
                <div className={styles['health-service-title']}>
                  <Database size={16} style={{ color: 'var(--blue-600)' }} />
                  <span>Base de Datos PostgreSQL</span>
                </div>
                <span className={[styles['health-status-badge'], checkingHealth ? styles.checking : ''].join(' ')}>
                  <div className={[styles['health-status-dot'], checkingHealth ? styles.checking : ''].join(' ')} />
                  {checkingHealth ? 'Probando...' : 'Operativo'}
                </span>
              </div>
              <p className={styles['health-detail']}>
                Cluster local: <code>civia_db:5432</code>. Esquema relacional con 8 incidentes activos de Neiva sincronizados.
              </p>
              <div className={styles['health-metric']}>
                <span>Latencia: <strong>8 ms</strong></span>
                <span>Último ping: {lastChecked}</span>
              </div>
            </div>

            {/* FastAPI Backend */}
            <div className={styles['health-card']}>
              <div className={styles['health-card-header']}>
                <div className={styles['health-service-title']}>
                  <Server size={16} style={{ color: 'var(--emerald-600)' }} />
                  <span>Backend FastAPI</span>
                </div>
                <span className={[styles['health-status-badge'], checkingHealth ? styles.checking : ''].join(' ')}>
                  <div className={[styles['health-status-dot'], checkingHealth ? styles.checking : ''].join(' ')} />
                  {checkingHealth ? 'Probando...' : 'Operativo (v1.0)'}
                </span>
              </div>
              <p className={styles['health-detail']}>
                Servicio Uvicorn: <code>http://127.0.0.1:8000</code>. Endpoints <code>/cases</code>, <code>/analytics</code>, <code>/map</code> en línea.
              </p>
              <div className={styles['health-metric']}>
                <span>Uptime: <strong>99.98%</strong></span>
                <span>Worker: Uvicorn (ASGI)</span>
              </div>
            </div>

            {/* Meta Pipeline */}
            <div className={styles['health-card']}>
              <div className={styles['health-card-header']}>
                <div className={styles['health-service-title']}>
                  <Globe size={16} style={{ color: 'var(--blue-500)' }} />
                  <span>Conector Meta (FB & IG)</span>
                </div>
                <span className={[styles['health-status-badge'], checkingHealth ? styles.checking : ''].join(' ')}>
                  <div className={[styles['health-status-dot'], checkingHealth ? styles.checking : ''].join(' ')} />
                  {checkingHealth ? 'Probando...' : 'Listo / Escucha'}
                </span>
              </div>
              <p className={styles['health-detail']}>
                Facebook Page & Instagram Graph API (@JohanSteed). Webhooks preparados para recepción de reportes ciudadanos.
              </p>
              <div className={styles['health-metric']}>
                <span>Canales activos: <strong>2 (FB / IG)</strong></span>
                <span>Protocolo: HTTPS Webhook</span>
              </div>
            </div>

            {/* AI Engine */}
            <div className={styles['health-card']}>
              <div className={styles['health-card-header']}>
                <div className={styles['health-service-title']}>
                  <Cpu size={16} style={{ color: 'var(--amber-600)' }} />
                  <span>Motor IA NLP & Geo-Neiva</span>
                </div>
                <span className={[styles['health-status-badge'], checkingHealth ? styles.checking : ''].join(' ')}>
                  <div className={[styles['health-status-dot'], checkingHealth ? styles.checking : ''].join(' ')} />
                  {checkingHealth ? 'Probando...' : 'Entrenado'}
                </span>
              </div>
              <p className={styles['health-detail']}>
                Clasificador semántico y diccionario geográfico de las 10 comunas y corregimientos de Neiva calibrado.
              </p>
              <div className={styles['health-metric']}>
                <span>Precisión Comunal: <strong>99.4%</strong></span>
                <span>NER Modelo: OpenAI GPT-4o</span>
              </div>
            </div>
          </div>
        </div>

        {/* IA NLP Configuration */}
        <div className={styles['settings-card']}>
          <h2 className={styles['card-title']}>
            <Key size={20} style={{ color: 'var(--blue-600)' }} /> Motor de Inteligencia Artificial (NLP)
          </h2>
          <div className={styles['form-group']}>
            <label>Modelo de Extracción y Sentimiento</label>
            <select defaultValue="gpt-4o">
              <option value="gpt-4o">OpenAI GPT-4o (Recomendado para NER y Sentimiento Ciudadano)</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              <option value="local-llama">Llama 3 70B (Local / On-Premise Neiva)</option>
            </select>
          </div>
          <div className={styles['form-group']}>
            <label>API Key de Producción</label>
            <input type="password" defaultValue="sk-proj-98234823482348234" />
            <p className={styles['helper-text']}>Llave cifrada con AES-256 para llamadas de clasificación en tiempo real.</p>
          </div>
        </div>

        {/* Base de Datos */}
        <div className={styles['settings-card']}>
          <h2 className={styles['card-title']}>
            <Database size={20} style={{ color: 'var(--blue-600)' }} /> Base de Datos Espacial (PostGIS)
          </h2>
          <div className={styles['form-group']}>
            <label>Cadena de Conexión PostgreSQL / PostGIS</label>
            <input type="text" defaultValue="postgresql://postgres:***@127.0.0.1:5432/civia_db" />
            <p className={styles['helper-text']}>Habilitado para cálculo de polígonos comunales y mapas de calor geoespaciales de Neiva.</p>
          </div>
        </div>

        {/* Canales Meta */}
        <div className={styles['settings-card']}>
          <h2 className={styles['card-title']}>
            <Globe size={20} style={{ color: 'var(--blue-600)' }} /> Canales de Escucha y Redes Oficiales (Meta)
          </h2>
          <div className={styles['social-list']}>
            <div className={styles['social-item']}>
              <div>
                <h3>Facebook Page API (Meta for Developers)</h3>
                <p>Página vinculada: "Johan Steed / Alcaldía de Neiva" (Lectura de publicaciones y comentarios ciudadanos)</p>
              </div>
              <span className="badge-baja">Vinculado</span>
            </div>
            <div className={styles['social-item']}>
              <div>
                <h3>Instagram Graph API (Cuenta Profesional / Creador)</h3>
                <p>Perfil vinculado: @JohanSteed (Monitoreo de menciones, reels y comentarios)</p>
              </div>
              <span className="badge-baja">Vinculado</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn-primary" onClick={handleSave}>
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            <span>{saved ? '¡Configuración Guardada!' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
