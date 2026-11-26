"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './TopBar.module.scss';
import { ThemeToggle } from './ThemeToggle';
import { Menu, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api/client';

interface TopBarProps {
  onToggleMenu?: () => void;
  isMenuOpen?: boolean;
}

interface AlertItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: string;
  priority: string;
}

function getCategoryIcon(cat?: string, prio?: string): string {
  if (prio === 'Alta') return '🚨';
  const c = (cat || '').toLowerCase();
  if (c.includes('servicio') || c.includes('agua') || c.includes('ceibas')) return '💧';
  if (c.includes('vial') || c.includes('infraestructura') || c.includes('malla')) return '🚧';
  if (c.includes('movilidad') || c.includes('tránsito') || c.includes('semáforo')) return '🚦';
  if (c.includes('alumbrado') || c.includes('luz') || c.includes('led')) return '💡';
  if (c.includes('seguridad') || c.includes('policía')) return '🛡️';
  if (c.includes('salud') || c.includes('hospital')) return '🏥';
  return '📌';
}

export function TopBar({ onToggleMenu, isMenuOpen = true }: TopBarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // This menu is a recent-case shortcut, not an unread-notification counter.
  useEffect(() => {
    if (!notifOpen) return;
    const controller = new AbortController();
    API.cases.getPage(new URLSearchParams({limit:'5',skip:'0'}), {signal:controller.signal})
      .then(page => setAlerts(page.items.map(c => ({
        id:c.id, title:c.title, desc:c.content.slice(0,80),
        time:c.date_time || 'Fecha no disponible',
        icon:getCategoryIcon(c.category,c.priority), priority:c.priority,
      }))))
      .catch(() => { if (!controller.signal.aborted) setAlerts([]); });
    return () => controller.abort();
  }, [notifOpen, user?.id]);

  const displayName = user?.full_name || 'Usuario';
  const roleLabel = user?.role || '';
  const initial = displayName.charAt(0).toUpperCase();

  // Cerrar menús al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles['topbar-left']}>
        {onToggleMenu && (
          <button 
            type="button"
            className={styles['menu-btn']} 
            onClick={onToggleMenu}
            aria-label={isMenuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
            title={isMenuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
            aria-expanded={isMenuOpen}
            aria-controls="civia-sidebar"
          >
            <Menu size={20} />
            <span>Menú</span>
          </button>
        )}
        <div className={styles['system-status']}>
          <div className={styles['status-dot']} />
          <span>CIVIA · Neiva</span>
        </div>
      </div>

      <div className={styles['topbar-right']}>
        <ThemeToggle />

        {/* Campana de Notificaciones en Vivo */}
        <div className={styles['bell-container']} ref={notifRef}>
          <button
            type="button"
            className={[styles['bell-btn'], notifOpen ? styles.active : ''].join(' ')}
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            aria-label="Ver casos recientes"
          >
            <Bell size={18} />
          </button>

          {notifOpen && (
            <div className={styles['notifications-dropdown']}>
              <div className={styles['notifications-header']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                  <h4>Casos recientes</h4>
                </div>
                <span>Hasta cinco registros</span>
              </div>
              <div className={styles['notifications-list']}>
                {alerts.map((n) => (
                  <Link
                    key={n.id}
                    href={`/cases/${n.id}`}
                    className={styles['notification-item']}
                    onClick={() => setNotifOpen(false)}
                  >
                    <span className={styles['notif-icon']}>{n.icon}</span>
                    <div className={styles['notif-content']}>
                      <div className={styles['notif-title']}>{n.title}</div>
                      <div className={styles['notif-desc']}>{n.desc}</div>
                      <div className={styles['notif-meta']}>
                        <span>{n.id}</span>
                        <span>•</span>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className={styles['notifications-footer']}>
                <Link href="/cases" onClick={() => setNotifOpen(false)}>
                  Ver todos los casos de Neiva →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Perfil de Usuario y Cambio de Rol */}
        <div className={styles['user-dropdown-container']} ref={userRef}>
          <button 
            type="button"
            className={styles['user-profile-btn']} 
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
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
                <p className={styles['menu-user-email']}>{user?.email || ''}</p>
              </div>
              <div className={styles['menu-divider']} />
              <Link href="/account" className={styles['menu-account-link']} onClick={() => setDropdownOpen(false)}>Mi cuenta y seguridad</Link>
              <button 
                type="button"
                className={styles['menu-logout-btn']} 
                onClick={() => {
                  setDropdownOpen(false);
                  void logout();
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
