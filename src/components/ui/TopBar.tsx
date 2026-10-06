"use client";

import React from 'react';
import { Menu } from 'lucide-react';
import styles from './TopBar.module.scss';
import { ThemeToggle } from './ThemeToggle';

interface TopBarProps {
  onToggleMenu?: () => void;
}

export function TopBar({ onToggleMenu }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles['topbar-left']}>
        {onToggleMenu && (
          <button 
            type="button"
            className={styles['mobile-menu-btn']}
            onClick={onToggleMenu}
            aria-label="Abrir navegación"
          >
            <Menu size={22} />
          </button>
        )}
        <div className={styles['system-status']}>
          <div className={styles['status-dot']} />
          <span className={styles['status-full']}>CIVIA Intelligence System • En Línea</span>
          <span className={styles['status-short']}>En Línea</span>
        </div>
      </div>

      <div className={styles['topbar-right']}>
        <ThemeToggle />

        <div className={styles['user-profile']}>
          <div className={styles['user-avatar']}>J</div>
          <span className={styles['user-name']}>Johan Steed</span>
        </div>
      </div>
    </header>
  );
}
