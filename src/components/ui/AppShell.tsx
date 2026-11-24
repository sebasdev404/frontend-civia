"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { HelpCenter } from "./HelpCenter";
import { useAuth } from "@/context/AuthContext";
import styles from "./AppShell.module.scss";

function subscribeToViewport(callback: () => void) {
  const viewport = window.matchMedia('(max-width: 1024px)');
  viewport.addEventListener('change', callback);
  return () => viewport.removeEventListener('change', callback);
}

const getMobileViewport = () => window.matchMedia('(max-width: 1024px)').matches;
const getServerViewport = () => false;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const isMobile = useSyncExternalStore(subscribeToViewport, getMobileViewport, getServerViewport);
  const isMenuOpen = isMobile ? mobileMenuOpen : !desktopCollapsed;
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Evitar scroll de fondo mientras el menú móvil está abierto
  useEffect(() => {
    if (!isMobile || !mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen, isMobile]);

  useEffect(() => {
    if (!isMobile || !mobileMenuOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const sidebar = document.getElementById('civia-sidebar');
    const focusable = () => Array.from(sidebar?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []).filter(element => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('keydown', handleEscape); previousFocus?.focus(); };
  }, [mobileMenuOpen, isMobile]);

  // Guardia de Seguridad y Redirección
  useEffect(() => {
    if (isLoading) return;

    if (!user && pathname !== '/login') {
      router.replace('/login');
    } else if (user && pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  // En la vista de login, nunca mostrar pantalla de carga de administración
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Si está verificando sesión con backend o cargando (con escape automático a los 800ms)
  if (isLoading) {
    return (
      <div className={styles['auth-loading-screen']}>
        <div className={styles['logo-badge']}>C</div>
        <div className={styles['loading-text']}>
          <h3>CIVIA INTELLIGENCE</h3>
          <p>Cargando plataforma...</p>
        </div>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Si no hay usuario y no es /login, mostrar pantalla de redirección
  if (!user) {
    return (
      <div className={styles['auth-loading-screen']}>
        <div className={styles['logo-badge']}>C</div>
        <div className={styles['loading-text']}>
          <h3>CIVIA</h3>
          <p>Redirigiendo a inicio de sesión seguro...</p>
        </div>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles['app-shell']}>
      <a href="#main-content" className={styles.skipLink}>Saltar al contenido</a>
      {/* Overlay oscuro para dispositivos móviles / tablets */}
      {isMobile && mobileMenuOpen && (
        <button
          type="button"
          className={styles['mobile-backdrop']} 
          onClick={() => setMobileMenuOpen(false)} 
          aria-label="Cerrar navegación"
        />
      )}

      {/* Sidebar: columna fija en desktop, drawer deslizable en móvil */}
      <Sidebar 
        isMobileOpen={mobileMenuOpen} 
        isHidden={!isMenuOpen}
        desktopCollapsed={desktopCollapsed}
        onClose={() => setMobileMenuOpen(false)} 
      />

      <div className={[styles['app-main-container'], desktopCollapsed ? styles['sidebar-collapsed'] : ''].join(' ')}>
        <TopBar isMenuOpen={isMenuOpen} onToggleMenu={() => {
          if (isMobile) setMobileMenuOpen(prev => !prev);
          else setDesktopCollapsed(prev => !prev);
        }} />
        <main id="main-content" tabIndex={-1} className={styles['app-main']}>
          <WorkspaceNavigation />
          {children}
        </main>
      </div>
      {!(isMobile && mobileMenuOpen) && <HelpCenter />}
    </div>
  );
}
