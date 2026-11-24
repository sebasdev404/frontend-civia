"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, BookOpen, ChevronDown, CircleHelp, Search, X } from 'lucide-react';
import { getNavigationItem } from '@/lib/navigation';
import { helpArticles } from '@/lib/help';
import styles from './HelpCenter.module.scss';

function searchable(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function HelpCenter() {
  const pathname = usePathname();
  const current = getNavigationItem(pathname);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setOpen(false); setSearch(''); setExpanded(null); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !widgetRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const term = searchable(search.trim());
  const articles = helpArticles.filter(article => searchable(`${article.title} ${article.keywords} ${article.steps.join(' ')}`).includes(term));

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return <div className={styles.widget} ref={widgetRef}>
    <section id="civia-help-panel" hidden={!open} role="dialog" aria-modal="false" aria-labelledby="civia-help-title" className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.heading}><BookOpen size={20} /><div><h2 id="civia-help-title">Centro de ayuda</h2><p>Cómo funciona CIVIA</p></div></div>
        <button type="button" onClick={close} className={styles.close} aria-label="Cerrar centro de ayuda"><X size={20} /></button>
      </header>
      <div className={styles.searchArea}>
        <label htmlFor="civia-help-search">¿Qué necesitas saber?</label>
        <div className={styles.search}><Search size={17} /><input id="civia-help-search" ref={searchRef} type="search" placeholder="Buscar: comentarios, videos, casos…" value={search} onChange={event => setSearch(event.target.value)} /></div>
      </div>
      <div className={styles.body}>
        {current && !term && <div className={styles.context}><span>ESTÁS EN {current.label.toUpperCase()}</span><p>{current.purpose}</p></div>}
        <h3 className={styles.sectionTitle}>{term ? `${articles.length} temas encontrados` : 'Guías y preguntas frecuentes'}</h3>
        {articles.map(article => <div key={article.id} className={styles.article}>
          <button type="button" className={styles.question} aria-expanded={expanded === article.id} aria-controls={`help-answer-${article.id}`} onClick={() => setExpanded(expanded === article.id ? null : article.id)}>
            <span>{article.title}</span><ChevronDown size={17} className={expanded === article.id ? styles.rotated : ''} />
          </button>
          <div id={`help-answer-${article.id}`} hidden={expanded !== article.id} className={styles.answer}>
            <ol>{article.steps.map(step => <li key={step}>{step}</li>)}</ol>
            <Link href={article.href} onClick={() => setOpen(false)}>{article.linkLabel}<ArrowRight size={15} /></Link>
          </div>
        </div>)}
        {!articles.length && <div className={styles.empty}><p>No encontramos una guía con ese texto.</p><button type="button" onClick={() => setSearch('')}>Ver todos los temas</button></div>}
      </div>
      <footer className={styles.footer}>Puedes seguir trabajando mientras consultas esta ayuda.</footer>
    </section>
    <button type="button" ref={triggerRef} className={styles.trigger} aria-label={open ? 'Cerrar ayuda de CIVIA' : 'Abrir ayuda de CIVIA'} aria-expanded={open} aria-controls="civia-help-panel" aria-haspopup="dialog" onClick={() => setOpen(!open)}>
      {open ? <X size={24} /> : <CircleHelp size={27} />}<span className={styles.tooltip}>Ayuda</span>
    </button>
  </div>;
}
