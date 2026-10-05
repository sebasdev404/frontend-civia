"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import styles from "./ThemeToggle.module.scss";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 64, height: 32 }} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      className={styles['theme-toggle']}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema claro y oscuro"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div className={styles['toggle-icons']}>
        <Sun size={14} />
        <Moon size={14} />
      </div>
      <span className={[styles['theme-toggle-thumb'], isDark ? styles.dark : styles.light].join(' ')}>
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  );
}

