"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './TopBar.module.scss';
import { ThemeToggle } from './ThemeToggle';
import { Menu, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TopBarProps {
  onToggleMenu?: () => void;
}

const NOTIFICATIONS = [
  {
    id: 'CASO-001',
    title: 'Prioridad Inmediata Alcaldía',
    desc: 'Parque Las Granjas (Comuna 2): Inseguridad y falta de patrullaje reportada en Facebook.',
    time: 'Hace 15m',
    icon: '🚨',
  },
  {
    id: 'CASO-004',
    title: 'Emergencia Sanitaria',
    desc: 'Canaima (Comuna 6): Desbordamiento de aguas servidas requiere intervención Las Ceibas E.S.P.',
    time: 'Hace 45m',
    icon: '💧',
  },
  {
    id: 'CASO-007',
    title: 'Alerta de Movilidad',
    desc: 'Av. Circunvalar con Cra 5 (Comuna 1): Semáforos averiados generan congestión vial.',
    time: 'Hace 2h',
    icon: '🚦',
  },
  {
    id: 'CASO-008',
    title: 'Cierre Técnico de Reporte',
    desc: 'Ipanema (Comuna 7): Luminarias LED reparadas satisfactoriamente por Alumbrado Público.',
    time: 'Hace 3h',
    icon: '💡',
  },
];

export function TopBar({ onToggleMenu }: TopBarProps) {
  const { user, logout, switchDemoUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const displayName = user?.full_name || 'Johan Steed';
  const roleLabel = user?.role || 'ALCALDE';
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

        {/* Campana de Notificaciones en Vivo */}
        <div className={styles['bell-container']} ref={notifRef}>
          <button
            type="button"
            className={[styles['bell-btn'], notifOpen ? styles.active : ''].join(' ')}
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            aria-label="Notificaciones del sistema"
          >
            <Bell size={18} />
            <span className={styles['bell-badge']}>3</span>
          </button>

          {notifOpen && (
            <div className={styles['notifications-dropdown']}>
              <div className={styles['notifications-header']}>
                <h4>Alertas Neiva</h4>
                <span>3 Críticas</span>
              </div>
              <div className={styles['notifications-list']}>
                {NOTIFICATIONS.map((n) => (
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
                <p className={styles['menu-user-email']}>{user?.email || 'alcalde@civia.gov.co'}</p>
              </div>
              <div className={styles['menu-divider']} />
              <div style={{ padding: '4px 8px 4px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Cambiar Rol (Demostración)
                </span>
              </div>
              <button
                type="button"
                className={[styles['role-switch-btn'], roleLabel === 'ALCALDE' ? styles.active : ''].join(' ')}
                onClick={() => {
                  switchDemoUser('ALCALDE');
                  setDropdownOpen(false);
                }}
              >
                👑 Alcalde (Johan Steed)
              </button>
              <button
                type="button"
                className={[styles['role-switch-btn'], roleLabel === 'SECRETARIO' ? styles.active : ''].join(' ')}
                onClick={() => {
                  switchDemoUser('SECRETARIO');
                  setDropdownOpen(false);
                }}
              >
                👔 Secretario (Dra. Camila Morales)
              </button>
              <button
                type="button"
                className={[styles['role-switch-btn'], roleLabel === 'OPERADOR' ? styles.active : ''].join(' ')}
                onClick={() => {
                  switchDemoUser('OPERADOR');
                  setDropdownOpen(false);
                }}
              >
                🛠️ Operador (Carlos Mendoza)
              </button>
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
