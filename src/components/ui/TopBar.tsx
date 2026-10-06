"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Shield, ChevronDown } from 'lucide-react';
import styles from './TopBar.module.scss';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

interface TopBarProps {
  onToggleMenu?: () => void;
}

export function TopBar({ onToggleMenu }: TopBarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadgeClass = (role?: string) => {
    if (role === 'ALCALDE') return styles['badge-alcalde'];
    if (role === 'SECRETARIO') return styles['badge-secretario'];
    return styles['badge-operador'];
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'ALCALDE') return 'Alcalde';
    if (role === 'SECRETARIO') return 'Secretario';
    return 'Operador';
  };

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

        <div className={styles['user-menu-container']} ref={dropdownRef}>
          <button 
            type="button"
            className={styles['user-profile']} 
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
          >
            <div className={styles['user-avatar']}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'J'}
            </div>
            <div className={styles['user-text-wrap']}>
              <span className={styles['user-name']}>
                {user?.full_name || 'Johan Steed'}
              </span>
              <span className={[styles['role-pill'], getRoleBadgeClass(user?.role)].join(' ')}>
                {getRoleLabel(user?.role)}
              </span>
            </div>
            <ChevronDown size={14} className={styles['user-chevron']} />
          </button>

          {dropdownOpen && (
            <div className={styles['user-dropdown']}>
              <div className={styles['dropdown-header']}>
                <div className={styles['dropdown-user-name']}>{user?.full_name || 'Johan Steed'}</div>
                <div className={styles['dropdown-user-email']}>{user?.email || 'alcalde@civia.gov.co'}</div>
                <div className={styles['dropdown-department']}>
                  <Shield size={12} />
                  <span>{user?.department || 'Despacho del Alcalde'}</span>
                </div>
              </div>

              <div className={styles['dropdown-divider']} />

              <button 
                type="button"
                className={styles['dropdown-item-logout']}
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
