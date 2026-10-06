"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map as MapIcon, FolderOpen, PieChart, Users, Settings, X } from 'lucide-react';
import styles from './Sidebar.module.scss';
import { ThemeToggle } from './ThemeToggle';

import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || 'ALCALDE';

  let navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/cases', label: 'Casos', icon: FolderOpen, badge: '12' },
    { href: '/map', label: 'Mapa Interactivo', icon: MapIcon },
    { href: '/analytics', label: 'Análisis', icon: PieChart },
    { href: '/citizens', label: 'Ciudadanos', icon: Users },
    { href: '/settings', label: 'Configuración', icon: Settings },
  ];

  if (role === 'ADMIN') {
    navItems = [
      { href: '/dashboard', label: 'Dashboard Técnico', icon: Home },
      { href: '/cases', label: 'Casos y Necesidades', icon: FolderOpen, badge: '8' },
      { href: '/settings', label: 'Infraestructura & Logs', icon: Settings },
    ];
  } else if (role === 'ALCALDE') {
    navItems = [
      { href: '/dashboard', label: 'Dashboard Ejecutivo', icon: Home },
      { href: '/cases', label: 'Casos Prioritarios', icon: FolderOpen, badge: '3' },
      { href: '/map', label: 'Mapa de Calor Neiva', icon: MapIcon },
      { href: '/analytics', label: 'Inteligencia Social', icon: PieChart },
    ];
  } else if (role === 'SECRETARIO') {
    navItems = [
      { href: '/dashboard', label: 'Dashboard Sectorial', icon: Home },
      { href: '/cases', label: 'Casos Asignados', icon: FolderOpen, badge: '5' },
      { href: '/map', label: 'Mapa Comunal', icon: MapIcon },
      { href: '/analytics', label: 'Métricas de Gestión', icon: PieChart },
    ];
  } else if (role === 'OPERADOR') {
    navItems = [
      { href: '/dashboard', label: 'Bandeja Operativa', icon: Home },
      { href: '/cases', label: 'Comentarios y Casos', icon: FolderOpen, badge: '12' },
      { href: '/citizens', label: 'Directorio Ciudadano', icon: Users },
      { href: '/map', label: 'Mapa de Incidencias', icon: MapIcon },
    ];
  }

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

