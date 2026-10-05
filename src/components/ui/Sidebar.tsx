"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map as MapIcon, FolderOpen, PieChart, Users, Settings } from 'lucide-react';
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles['sidebar-header']}>
        <div className={styles['sidebar-logo']}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            C
          </div>
          <span>CIVIA</span>
        </div>
      </div>
      
      <div className={styles['sidebar-nav']}>
        <div className={styles['sidebar-label']}>PRINCIPAL</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
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
