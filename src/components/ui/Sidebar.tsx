"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map as MapIcon, FolderOpen, PieChart, Users, Settings, X } from 'lucide-react';
import styles from './Sidebar.module.scss';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || 'ALCALDE';

  // Nombres estandarizados e intuitivos para todos los roles
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/cases', label: 'Casos', icon: FolderOpen, badge: role === 'SECRETARIO' ? '5' : '12' },
    { href: '/map', label: 'Mapa Interactivo', icon: MapIcon },
    { href: '/analytics', label: 'Análisis', icon: PieChart },
    { href: '/citizens', label: 'Ciudadanos', icon: Users },
    { href: '/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className={[styles.sidebar, isMobileOpen ? styles['mobile-open'] : ''].join(' ').trim()}>
      <div className={styles['sidebar-header']}>
        <div className={styles['sidebar-logo']}>
          <div className={styles['logo-icon']}>C</div>
          <span>CIVIA</span>
        </div>
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

      <div className={styles['sidebar-nav']}>
        <div className={styles['sidebar-label']}>PRINCIPAL</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) || (item.href === '/dashboard' && pathname === '/');
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={onClose}
              className={[styles['nav-link'], isActive ? styles.active : ''].join(' ').trim()}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.badge && <span className={styles['nav-badge']}>{item.badge}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
