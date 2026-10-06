"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/context/AuthContext";
import styles from "./AppShell.module.scss";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Evitar scroll de fondo mientras el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Guardia de Seguridad y Redirección
  useEffect(() => {
    if (isLoading) return;

    if (!user && pathname !== '/login') {
      router.replace('/login');
    } else if (user && pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  // Si está verificando sesión con backend o cargando
  if (isLoading) {
    return (
      <div className={styles['auth-loading-screen']}>
        <div className={styles['logo-badge']}>C</div>
        <div className={styles['loading-text']}>
          <h3>CIVIA INTELLIGENCE</h3>
          <p>Verificando credenciales de seguridad...</p>
        </div>
        <div className={styles.spinner} />
      </div>
    );
  }

  // En la vista de login, no mostrar la estructura del panel de administración
  if (pathname === '/login') {
    return <>{children}</>;
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
      {/* Overlay oscuro para dispositivos móviles / tablets */}
      {mobileMenuOpen && (
        <div 
          className={styles['mobile-backdrop']} 
          onClick={() => setMobileMenuOpen(false)} 
          aria-label="Cerrar navegación"
        />
      )}

      {/* Sidebar: columna fija en desktop, drawer deslizable en móvil */}
      <Sidebar 
        isMobileOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      <div className={styles['app-main-container']}>
        <TopBar onToggleMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main className={styles['app-main']}>
          {children}
        </main>
      </div>
    </div>
  );
}
