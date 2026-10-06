"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import styles from "./AppShell.module.scss";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

  // En la vista de login, no mostrar la estructura del panel de administración
  if (pathname === '/login') {
    return <>{children}</>;
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
