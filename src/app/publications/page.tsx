'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Newspaper, Radio } from 'lucide-react';
import { SocialPublications } from '@/components/publications/SocialPublications';
import { NewsMonitor } from '@/components/publications/NewsMonitor';
import styles from './news.module.scss';

function Publications() {
  const params = useSearchParams();
  const social = params.get('view') === 'social' || params.has('source');
  return <div className="page">
    <nav className={styles.navigation} aria-label="Contenido de publicaciones">
      <Link href="/publications" aria-current={!social ? 'page' : undefined}><Newspaper size={18} />Noticias de Neiva y Huila</Link>
      <Link href="/publications?view=social" aria-current={social ? 'page' : undefined}><Radio size={18} />Redes conectadas</Link>
    </nav>
    {social ? <SocialPublications /> : <NewsMonitor />}
  </div>;
}

export default function PublicationsPage() {
  return <Suspense fallback={<div className="page" role="status">Cargando publicaciones…</div>}><Publications /></Suspense>;
}
