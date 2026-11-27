import Link from 'next/link';

export default function NotFound() {
  return <div className="page"><div className="page-header"><h1>No encontramos esta página</h1><p>El enlace puede haber cambiado. Vuelve al inicio o abre una sección desde el menú.</p></div><Link href="/dashboard" className="btn-primary">Ir al inicio de Ordenemos a Neiva</Link></div>;
}
