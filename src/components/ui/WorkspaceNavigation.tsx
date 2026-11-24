"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, Home } from 'lucide-react';
import { getNavigationItem, navigationItems, workflowSteps } from '@/lib/navigation';
import styles from './WorkspaceNavigation.module.scss';

export function WorkspaceNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const current = getNavigationItem(pathname);
  if (!current) return null;
  const isDetail = pathname.startsWith('/cases/');
  const isPublicationDetail = pathname.startsWith('/publications/');

  return <div className={styles.workspace}>
    <div className={styles.bar}>
      <nav aria-label="Tu ubicación" className={styles.breadcrumb}>
        <Link href="/dashboard"><Home size={16} /><span>Inicio</span></Link>
        {current.href !== '/dashboard' && <><ChevronRight size={15} aria-hidden="true" />{isDetail
          ? <><Link href="/cases?view=cases">Casos</Link><ChevronRight size={15} aria-hidden="true" /><span aria-current="page">Detalle del caso</span></>
          : isPublicationDetail ? <><Link href={`/publications?source=${encodeURIComponent(pathname.split('/')[2])}`}>Publicaciones</Link><ChevronRight size={15} aria-hidden="true" /><span aria-current="page">Detalle de publicación</span></>
          : <span aria-current="page">{current.label}</span>}</>}
      </nav>
      <div className={styles.tools}>
        <label className={styles.jump}><span>Ir a</span><select aria-label="Ir a otra sección" value={current.href} onChange={e => router.push(e.target.value)}>
          {navigationItems.map(item => <option value={item.href} key={item.href}>{item.label}</option>)}
        </select></label>
      </div>
    </div>
  </div>;
}

export function StartHere() {
  return <section id="start-here" className={styles.start} aria-labelledby="start-here-title">
    <div className={styles.startTitle}><div><span className={styles.eyebrow}>TU RUTA DE TRABAJO</span><h2 id="start-here-title">¿Por dónde quieres empezar?</h2></div><p>De los comentarios a la atención ciudadana, en tres pasos.</p></div>
    <div className={styles.workflow}>{workflowSteps.map((step, index) => {
      const Icon = step.icon;
      return <Link href={step.href} className={styles.step} key={step.href}><span className={styles.stepNumber}>{index + 1}</span><Icon size={23} /><h3>{step.label}</h3><p>{step.description}</p><span className={styles.open}>Abrir sección <ArrowRight size={17} /></span></Link>;
    })}</div>
  </section>;
}
