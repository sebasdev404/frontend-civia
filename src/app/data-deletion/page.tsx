import React from 'react';
import Link from 'next/link';
import { Trash2, ArrowLeft, CheckCircle2, Mail, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Instrucciones de Eliminación de Datos | Proyecto CIVIA',
  description: 'Instrucciones para solicitar la eliminación de datos de usuario de la plataforma Proyecto CIVIA (App ID Meta: 2097352517811401).',
};

export default function DataDeletionPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      color: '#e2e8f0',
      padding: '3rem 1.5rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #1e293b', paddingBottom: '1.5rem' }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#38bdf8',
            fontSize: '0.875rem',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            <ArrowLeft size={16} /> Volver al Tablero CIVIA
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Trash2 size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Instrucciones de Eliminación y Supresión de Datos
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Proyecto CIVIA • Conforme a los Términos de Meta y Ley 1581 de 2012
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ fontSize: '0.9375rem', lineHeight: '1.7', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>
            Proyecto CIVIA (App Meta ID: <strong>2097352517811401</strong>) respeta el derecho a la privacidad de los usuarios. Si usted ha interactuado públicamente en redes sociales y desea que cualquier registro o análisis indexado sea eliminado definitivamente de nuestra base de datos, puede hacerlo mediante:
          </p>

          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#ffffff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} /> Solicitud por Correo Electrónico Directo
            </h3>
            <p style={{ margin: 0 }}>
              Envíe un correo a <strong>johansteedfernandez@hotmail.com</strong> con el asunto <code>"Solicitud de Eliminación de Datos CIVIA"</code>, indicando:
            </p>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
              <li>Su nombre o enlace de su perfil público en Facebook o Instagram.</li>
              <li>El comentario o interacción que desea retirar.</li>
            </ul>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
              El equipo procesará la solicitud en un plazo máximo de 48 horas hábiles y le notificará la confirmación.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          <span>Proyecto CIVIA • Neiva, Huila 2026</span>
          <Link href="/privacy" style={{ color: '#38bdf8', textDecoration: 'none' }}>Ver Política de Privacidad</Link>
        </div>
      </div>
    </div>
  );
}

