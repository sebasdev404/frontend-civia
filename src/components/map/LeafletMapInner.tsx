"use client";

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapIncident {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  category: string;
  priority: 'Alta' | 'Media' | 'Baja';
  sentiment: string;
  source: string;
  neighborhood: string;
  zone: string;
  status: string;
  reportsCount: number;
  dateTime: string;
  isNew?: boolean;
}

export interface LeafletMapInnerProps {
  incidents: MapIncident[];
  selectedIncident: MapIncident | null;
  onSelectIncident: (inc: MapIncident) => void;
  center: [number, number];
  zoom: number;
  isDark: boolean;
}

function MapController({
  center,
  zoom,
  selectedIncident,
}: {
  center: [number, number];
  zoom: number;
  selectedIncident: MapIncident | null;
}) {
  const map = useMap();
  const prevCenterRef = useRef(center);
  const prevZoomRef = useRef(zoom);
  const prevIncidentIdRef = useRef<string | null>(null);

  // Invalidate size on mount to ensure proper dimensioning
  useEffect(() => {
    if (!map) return;
    map.whenReady(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        // Safe fallback
      }
    });
  }, [map]);

  // Navigate when zone changes
  useEffect(() => {
    if (!map) return;

    const hasCenterChanged =
      prevCenterRef.current[0] !== center[0] ||
      prevCenterRef.current[1] !== center[1];
    const hasZoomChanged = prevZoomRef.current !== zoom;

    if (hasCenterChanged || hasZoomChanged) {
      prevCenterRef.current = center;
      prevZoomRef.current = zoom;

      map.whenReady(() => {
        try {
          map.flyTo(center, zoom, { duration: 1.2 });
        } catch {
          try {
            map.setView(center, zoom);
          } catch (e) {
            // Safe fallback
          }
        }
      });
    }
  }, [center, zoom, map]);

  // Navigate when an incident is selected
  useEffect(() => {
    if (!map || !selectedIncident) return;

    if (prevIncidentIdRef.current !== selectedIncident.id) {
      prevIncidentIdRef.current = selectedIncident.id;
      map.whenReady(() => {
        try {
          map.flyTo([selectedIncident.lat, selectedIncident.lng], 15, { duration: 1 });
        } catch {
          try {
            map.setView([selectedIncident.lat, selectedIncident.lng], 15);
          } catch (e) {
            // Safe fallback
          }
        }
      });
    }
  }, [selectedIncident, map]);

  return null;
}

export default function LeafletMapInner({
  incidents,
  selectedIncident,
  onSelectIncident,
  center,
  zoom,
  isDark,
}: LeafletMapInnerProps) {
  // Stadia Maps con la API Key oficial del usuario
  const STADIA_API_KEY = 'febdb3c1-d95f-4788-bf11-41b9b851542b';
  
  const tileUrl = isDark
    ? `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`
    : `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', background: isDark ? '#090d16' : '#f1f5f9' }}
      zoomControl={true}
    >
      <MapController center={center} zoom={zoom} selectedIncident={selectedIncident} />

      <TileLayer
        key={isDark ? 'stadia-dark' : 'stadia-light'}
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={tileUrl}
        maxZoom={20}
      />

      {incidents.map((inc) => {
        const isSelected = selectedIncident?.id === inc.id;
        const color = inc.priority === 'Alta' ? '#ef4444' : inc.priority === 'Media' ? '#f59e0b' : '#10b981';
        const baseRadius = inc.priority === 'Alta' ? 14 : inc.priority === 'Media' ? 10 : 8;
        const radius = isSelected ? baseRadius + 6 : baseRadius;

        return (
          <React.Fragment key={inc.id}>
            {/* Anillo exterior pulsante para incidentes de alta prioridad o recién llegados */}
            {(inc.isNew || inc.priority === 'Alta') && (
              <CircleMarker
                center={[inc.lat, inc.lng]}
                radius={radius + 10}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
            )}

            {/* Marcador Principal */}
            <CircleMarker
              center={[inc.lat, inc.lng]}
              radius={radius}
              pathOptions={{
                color: isSelected ? '#ffffff' : color,
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.85,
                weight: isSelected ? 3.5 : 2,
              }}
              eventHandlers={{
                click: () => onSelectIncident(inc),
              }}
            >
              <Popup>
                <div style={{ padding: '6px', maxWidth: '250px', color: '#0f172a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      ● {inc.priority === 'Alta' ? 'Crítico / Alta' : inc.priority === 'Media' ? 'Media' : 'Baja'}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>{inc.id}</span>
                  </div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 6px 0', lineHeight: 1.35, color: '#0f172a' }}>
                    {inc.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.45 }}>
                    📍 {inc.neighborhood} • <strong>{inc.category}</strong>
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>
                      🔥 {inc.reportsCount} reportes
                    </span>
                    <button
                      onClick={() => onSelectIncident(inc)}
                      style={{
                        padding: '4px 10px',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
