"use client";

import React from 'react';
import styles from './TopBar.module.scss';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  return (
    <header className={styles.topbar}>
      <div className={styles['topbar-left']}>
        <div className={styles['system-status']}>
          <div className={styles['status-dot']} />
          <span>CIVIA Intelligence System • En Línea</span>
        </div>
      </div>

      <div className={styles['topbar-right']}>
        {/* Switch de Light and Dark ARRIBA A LA DERECHA */}
        <ThemeToggle />

        <div className={styles['user-profile']}>
          <div className={styles['user-avatar']}>A</div>
          <span className={styles['user-name']}>Johan Steed</span>
        </div>
      </div>
    </header>
  );
}
