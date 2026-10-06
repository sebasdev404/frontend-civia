"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map as MapIcon, FolderOpen, PieChart, Users, Settings, X } from 'lucide-react';
import styles from './Sidebar.module.scss';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/cases', label: 'Casos', icon: FolderOpen, badge: '12' },
  { href: '/map', label: 'Mapa Interactivo', icon: MapIcon },
  { href: '/analytics', label: 'Análisis', icon: PieChart },
  { href: '/citizens', label: 'Ciudadanos', icon: Users },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={[styles.sidebar, isMobileOpen ? styles['mobile-open'] : ''].join(' ').trim()}>
      
      
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
      
      <div className={styles['sidebar-footer']}>
        <ThemeToggle />
      </div>
    </aside>
  );
}

