"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { MapIncident } from './types';
import type LeafletMapInnerComponent from './LeafletMapInner';
import 'leaflet/dist/leaflet.css';

export * from './types';

interface ThermometerMapProps {
  incidents: MapIncident[];
  selectedIncident: MapIncident | null;
  onSelectIncident: (inc: MapIncident) => void;
  center: [number, number];
  zoom: number;
}

const InnerMap = dynamic<React.ComponentProps<typeof LeafletMapInnerComponent>>(
  () => import('./LeafletMapInner'),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Cargando mapa en tiempo real...
      </div>
    ),
  }
);

export default function ThermometerMap(props: ThermometerMapProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Iniciando radar satelital...
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <InnerMap {...props} isDark={isDark} />
    </div>
  );
}
