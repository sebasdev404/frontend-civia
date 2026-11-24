"use client";

import Link from 'next/link';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="page"><div className="page-header"><h1>No pudimos abrir esta sección</h1><p>Puedes intentar de nuevo o volver al inicio para continuar con otra tarea.</p></div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><button type="button" className="btn-primary" onClick={reset}>Intentar de nuevo</button><Link href="/dashboard" className="btn-secondary">Volver al inicio</Link></div></div>;
}
