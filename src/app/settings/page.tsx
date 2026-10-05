"use client";
import React, { useState } from 'react';
import { Save, Key, Database, Globe, CheckCircle2 } from 'lucide-react';
import styles from './settings.module.scss';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Configuración de Plataforma</h1>
        <p>Gestión de modelos de IA, bases de datos y conexiones con redes sociales</p>
      </div>

      <div className={styles['settings-container']}>
        {/* IA */}
        <div className={styles['settings-card']}>
          <h2 className={styles['card-title']}>
            <Key size={20} style={{ color: 'var(--blue-600)' }} /> Motor de Inteligencia Artificial (NLP)
          </h2>
          <div className={styles['form-group']}>
            <label>Modelo de Extracción y Sentimiento</label>
            <select defaultValue="gpt-4o">
              <option value="gpt-4o">OpenAI GPT-4o (Recomendado para NER y Sentimiento)</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              <option value="local-llama">Llama 3 70B (Local / On-Premise)</option>
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
            <input type="text" defaultValue="postgresql://postgres:***@civia-cluster.supabase.co:5432/postgres" />
            <p className={styles['helper-text']}>Habilitado para cálculo de polígonos y mapas de calor geoespaciales.</p>
          </div>
        </div>

        {/* Canales */}
        <div className={styles['settings-card']}>
          <h2 className={styles['card-title']}>
            <Globe size={20} style={{ color: 'var(--blue-600)' }} /> Canales de Escucha y Notificaciones
          </h2>
          <div className={styles['social-list']}>
            <div className={styles['social-item']}>
              <div>
                <h3>Meta Graph API (Facebook / Instagram)</h3>
                <p>Página vinculada: "Alcaldía Mayor de la Ciudad"</p>
              </div>
              <span className="badge-baja">Conectado</span>
            </div>
            <div className={styles['social-item']}>
              <div>
                <h3>WhatsApp Business API</h3>
                <p>Notificaciones automáticas a funcionarios de guardia</p>
              </div>
              <span className="badge-media">En Espera de Token</span>
            </div>
            <div className={styles['social-item']}>
              <div>
                <h3>Twitter / X Streaming API v2</h3>
                <p>Monitoreo continuo de palabras clave cívicas</p>
              </div>
              <span className="badge-baja">Activo</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn-primary" onClick={handleSave}>
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            <span>{saved ? '¡Configuración Guardada!' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
