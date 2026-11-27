"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, X } from 'lucide-react';
import logo from '../../../public/logo.png';
import styles from './Sidebar.module.scss';
import { getNavigationItem, navigationItems } from '@/lib/navigation';
import { APP_NAME } from '@/lib/brand';

interface SidebarProps {
  isMobileOpen?: boolean;
  desktopCollapsed?: boolean;
  isHidden?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, desktopCollapsed = false, isHidden = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const activeItem = getNavigationItem(pathname);
  const groups = [...new Set(navigationItems.map(item => item.group))];

  return (
    <aside id="civia-sidebar" aria-label="Navegación principal" aria-hidden={isHidden} inert={isHidden} className={[styles.sidebar, isMobileOpen ? styles['mobile-open'] : '', desktopCollapsed ? styles['desktop-collapsed'] : ''].join(' ').trim()}>
      <div className={styles['sidebar-header']}>
        <Link href="/dashboard" onClick={onClose} className={styles['sidebar-logo']} aria-label={`${APP_NAME}, ir al inicio`}>
          <Image src={logo} alt="" width={48} loading="eager" className={styles['logo-icon']} />
          <span>{APP_NAME}</span>
        </Link>
        {onClose && (
          <button 
            type="button" 
            className={styles['close-mobile-btn']}
            onClick={onClose}
            aria-label="Cerrar navegación"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className={styles['sidebar-nav']} aria-label={`Secciones de ${APP_NAME}`}>
        {groups.map(group => <div className={styles.group} key={group}>
        <div className={styles['sidebar-label']}>{group}</div>
        {navigationItems.filter(item => item.group === group).map((item) => {
          const isActive = activeItem?.href === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              prefetch={false}
              onClick={onClose}
              aria-current={isActive ? 'page' : undefined}
              className={[styles['nav-link'], isActive ? styles.active : ''].join(' ').trim()}
            >
              <Icon size={20} />
              <span className={styles.linkText}><strong>{item.label}</strong><small>{item.description}</small></span>
            </Link>
          );
        })}</div>)}
      </nav>
      <div className={styles['sidebar-footer']}>
        <span>¿No sabes por dónde empezar?</span>
        <Link href="/dashboard#start-here" onClick={onClose}>Ver accesos del inicio <ArrowUpRight size={16} /></Link>
      </div>
    </aside>
  );
}
