"use client";

import React, { useState } from 'react';
import styles from './TopBar.module.scss';
import { ThemeToggle } from './ThemeToggle';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TopBarProps {
  onToggleMenu?: () => void;
}

export function TopBar({ onToggleMenu }: TopBarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.full_name || 'Johan Steed';
  const roleLabel = user?.role || 'ALCALDE';
  const initial = displayName.charAt(0).toUpperCase();

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
            <Menu size={20} />
          </button>
        )}
        <div className={styles['system-status']}>
          <div className={styles['status-dot']} />
          <span>CIVIA Intelligence System • Neiva, Huila</span>
        </div>
      </div>

      <div className={styles['topbar-right']}>
        <ThemeToggle />

        <div className={styles['user-dropdown-container']}>
          <button 
            type="button"
            className={styles['user-profile-btn']} 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className={styles['user-avatar']}>{initial}</div>
            <div className={styles['user-info-text']}>
              <span className={styles['user-name']}>{displayName}</span>
              <span className={styles['user-role-badge']}>{roleLabel}</span>
            </div>
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div className={styles['user-menu-dropdown']}>
              <div className={styles['menu-user-header']}>
                <p className={styles['menu-user-name']}>{displayName}</p>
                <p className={styles['menu-user-email']}>{user?.email || 'alcalde@civia.gov.co'}</p>
              </div>
              <div className={styles['menu-divider']} />
              <button 
                type="button"
                className={styles['menu-logout-btn']} 
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
