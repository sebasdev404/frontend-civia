import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail, Globe } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad y Tratamiento de Datos | Proyecto CIVIA',
  description: 'Política oficial de privacidad y tratamiento de datos de Proyecto CIVIA conforme a la Ley 1581 de 2012 y Términos de la Plataforma Meta.',
};

export default function PrivacyPolicyPage() {
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
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Política de Privacidad y Tratamiento de Datos
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Proyecto CIVIA • Inteligencia Ciudadana y Escucha Social • App ID Meta: 2097352517811401
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ fontSize: '0.9375rem', lineHeight: '1.7', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem' }}>
              1. Identificación del Proyecto y Responsable
            </h2>
            <p>
              El sistema <strong>CIVIA (Centro Integrado de Vigilancia e Inteligencia Administrativa)</strong> es una plataforma tecnológica independiente de analítica de datos, escucha ciudadana y monitoreo del debate público en redes sociales, administrada por el equipo de Proyecto CIVIA.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. Finalidad del Uso de la API de Meta (Facebook e Instagram)
            </h2>
            <p>
              CIVIA integra la <strong>Meta Graph API</strong> para consultar exclusivamente publicaciones públicas y comentarios abiertos realizados de manera libre y voluntaria por usuarios en los canales monitoreados. La finalidad comprende:
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li>Análisis de sentimiento y percepción ciudadana sobre problemáticas urbanas y comunitarias.</li>
              <li>Categorización temática de necesidades ciudadanas (infraestructura, seguridad, medio ambiente, movilidad).</li>
              <li>Elaboración de informes cuantitativos agregados sobre tendencias de opinión social.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem' }}>
              3. Datos Recopilados y Permisos Solicitados
            </h2>
            <p>
              A través de los permisos públicos de la Meta Graph API, la aplicación únicamente accede a la información pública del comentario (texto del comentario, fecha y nombre de perfil público que Meta proporciona). CIVIA <strong>no accede ni almacena contraseñas, mensajes privados, listas de contactos ni información confidencial de navegación</strong>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem' }}>
              4. Protección de Datos (Ley 1581 de 2012)
            </h2>
            <p>
              El tratamiento de la información se rige por la <strong>Ley 1581 de 2012</strong> de la República de Colombia y las normas de protección de datos personales. Los titulares tienen derecho a solicitar la actualización, rectificación o eliminación de cualquier dato recopilado.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem' }}>
              5. Supresión y Eliminación de Datos
            </h2>
            <p>
              Cualquier usuario puede solicitar la exclusión inmediata de sus interacciones públicas escribiendo al correo de contacto registrado: <code>johansteedfernandez@hotmail.com</code>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          <span>Última actualización: Octubre 2026 • Neiva, Huila</span>
          <span>Proyecto CIVIA • Social Intelligence</span>
        </div>
      </div>
    </div>
  );
}

