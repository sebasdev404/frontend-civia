"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import styles from './map.module.scss';
import ThermometerMap, { MapIncident } from '@/components/map/ThermometerMap';
import { 
  Layers, Search, TrendingUp, Filter, AlertCircle, ArrowUpRight, 
  RotateCcw, Radio, X, MapPin, MessageSquare, CheckCircle2, ChevronDown
} from 'lucide-react';
import { API } from '@/lib/api/client';

const INITIAL_INCIDENTS: MapIncident[] = [];

const ZONE_COORDINATES: Record<string, { center: [number, number]; zoom: number }> = {
  all: { center: [2.9273, -75.2819], zoom: 13 },
  'comuna-1': { center: [2.9480, -75.2950], zoom: 14 },
  'comuna-2': { center: [2.9420, -75.2850], zoom: 14 },
  'comuna-3': { center: [2.9340, -75.2820], zoom: 14 },
  'comuna-4': { center: [2.9290, -75.2890], zoom: 14 },
  'comuna-5': { center: [2.9320, -75.2720], zoom: 14 },
  'comuna-6': { center: [2.9050, -75.2850], zoom: 14 },
  'comuna-7': { center: [2.9180, -75.2680], zoom: 14 },
  'comuna-8': { center: [2.9230, -75.2600], zoom: 14 },
  'comuna-9': { center: [2.9600, -75.2920], zoom: 14 },
  'comuna-10': { center: [2.9380, -75.2620], zoom: 14 },
  'caguan': { center: [2.8600, -75.2750], zoom: 14 },
};

export default function MapPage() {
  const [incidents, setIncidents] = useState<MapIncident[]>(INITIAL_INCIDENTS);
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null);
  const [mapError, setMapError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedBarrio, setSelectedBarrio] = useState<string | null>(null);
  const [customCenterZoom, setCustomCenterZoom] = useState<{ center: [number, number]; zoom: number } | null>(null);

  const topBarrios = useMemo(() => {
    const groups = new Map<string, { neighborhood: string; zone_key: string; commune: string; lat: number; lng: number; total_issues: number; top_category: string }>();
    for (const item of incidents) {
      const row = groups.get(item.neighborhood);
      if (row) row.total_issues += 1;
      else groups.set(item.neighborhood, { neighborhood: item.neighborhood, zone_key: item.zone, commune: item.zone, lat: item.lat, lng: item.lng, total_issues: 1, top_category: 'Menciones con origen trazable' });
    }
    return [...groups.values()].sort((a, b) => b.total_issues - a.total_issues);
  }, [incidents]);

  const handleSelectBarrio = (barrio: (typeof topBarrios)[number]) => {
    if (selectedBarrio === barrio.neighborhood) {
      setSelectedBarrio(null);
      setSelectedZone('all');
      setSearch('');
      setCustomCenterZoom({ center: [2.9273, -75.2819], zoom: 13 });
      setSelectedIncident(null);
      return;
    }

    setSelectedBarrio(barrio.neighborhood);
    const targetZone = barrio.zone_key || (
      barrio.commune?.toLowerCase().includes('comuna 2') ? 'comuna-2' :
      barrio.commune?.toLowerCase().includes('comuna 6') ? 'comuna-6' :
      barrio.commune?.toLowerCase().includes('comuna 3') ? 'comuna-3' :
      barrio.commune?.toLowerCase().includes('comuna 4') ? 'comuna-4' :
      barrio.commune?.toLowerCase().includes('comuna 10') ? 'comuna-10' :
      barrio.commune?.toLowerCase().includes('comuna 1') ? 'comuna-1' : 'all'
    );

    setSelectedZone(targetZone);
    setSearch('');
    setCustomCenterZoom({ center: [barrio.lat, barrio.lng], zoom: 15 });
    
    const match = incidents.find(i => 
      i.neighborhood.toLowerCase().includes(barrio.neighborhood.toLowerCase())
    );
    if (match) setSelectedIncident(match);
  };

  // Carga inicial en vivo desde backend PostgreSQL / API
  useEffect(() => {
    let isMounted = true;
    async function loadIncidents() {
      try {
        const data = await API.map.getIncidents();
        if (isMounted && Array.isArray(data)) {
          const parsed: MapIncident[] = data.map((item: MapIncident & {reports_count?:number;date_time?:string;is_new?:boolean}) => ({
            id: item.id,
            lat: item.lat,
            lng: item.lng,
            title: item.title,
            description: item.description,
            category: item.category,
            priority: item.priority,
            sentiment: item.sentiment,
            source: item.source || 'Facebook',
            neighborhood: item.neighborhood,
            zone: item.zone,
            status: item.status,
            reportsCount: item.reports_count || item.reportsCount || 1,
            dateTime: item.date_time || item.dateTime || 'Reciente',
            isNew: item.is_new,
          }));
          setIncidents(parsed);
        }
      } catch (err) {
        setMapError('No se pudo actualizar el mapa. Reintenta recargando la página.');
      }
    }
    loadIncidents();
    return () => { isMounted = false; };
  }, []);

  // Filtrado compuesto avanzado
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        search === '' ||
        inc.title.toLowerCase().includes(search.toLowerCase()) ||
        inc.description.toLowerCase().includes(search.toLowerCase()) ||
        inc.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
        inc.id.toLowerCase().includes(search.toLowerCase());

      const matchPriority = selectedPriority === 'all' || inc.priority === selectedPriority;
      const matchCategory = selectedCategory === 'all' || inc.category === selectedCategory;
      const matchSource = selectedSource === 'all' || inc.source === selectedSource;
      const matchStatus = selectedStatus === 'all' || inc.status === selectedStatus;
      const matchZone = selectedZone === 'all' || inc.zone === selectedZone;

      return matchSearch && matchPriority && matchCategory && matchSource && matchStatus && matchZone;
    });
  }, [incidents, search, selectedPriority, selectedCategory, selectedSource, selectedStatus, selectedZone]);

  // Contadores para insignias de filtro
  const counts = useMemo(() => {
    return {
      all: incidents.length,
      Alta: incidents.filter((i) => i.priority === 'Alta').length,
      Media: incidents.filter((i) => i.priority === 'Media').length,
      Baja: incidents.filter((i) => i.priority === 'Baja').length,
      pendientes: incidents.filter((i) => i.status === 'Pendiente').length,
      enGestion: incidents.filter((i) => i.status === 'En Gestión').length,
    };
  }, [incidents]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedPriority('all');
    setSelectedCategory('all');
    setSelectedSource('all');
    setSelectedStatus('all');
    setSelectedZone('all');
    setSelectedIncident(null);
    setSelectedBarrio(null);
    setCustomCenterZoom(null);
  };

  const currentZoneSettings = ZONE_COORDINATES[selectedZone] || ZONE_COORDINATES.all;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mapa de reportes</h1>
        <p>Explora menciones territoriales de comentarios capturados. Selecciona una zona para consultar su evidencia.</p>
      </div>

      <details className={styles['context-note']}><summary>Ubicaciones aproximadas, no reportes confirmados<ChevronDown size={17} /></summary><p>Solo aparecen menciones de lugares presentes en el comentario original capturado. Los puntos representan referencias de barrio o comuna, no direcciones exactas ni GPS del ciudadano. Una mención no confirma un problema. Se excluyen registros sin origen trazable o sin lugar explícito.</p></details>
      {mapError && <p role="alert" style={{ color: 'var(--red-600)', padding: 12 }}>{mapError}</p>}

      <div className={styles['map-layout']}>
        {/* ─── Sidebar de Filtros Completos ─── */}
        <aside className={styles['map-sidebar']}>
          <div className={styles['sidebar-header']}>
            <button type="button" className={styles['mobile-filter-toggle']} aria-expanded={filtersOpen} aria-controls="map-territorial-filters" onClick={() => setFiltersOpen(value => !value)}><Layers size={18} /><span>Filtros territoriales</span><ChevronDown size={16} /></button>
            <div className={styles['sidebar-title']}>
              <Layers size={18} style={{ color: 'var(--blue-600)' }} />
              <span>Filtros Territoriales</span>
            </div>
            <button className={styles['clear-btn']} onClick={handleResetFilters} title="Limpiar todos los filtros">
              <RotateCcw size={12} style={{ display: 'inline', marginRight: 4 }} />
              Limpiar
            </button>
          </div>

          <div id="map-territorial-filters" className={`${styles['filter-contents']} ${filtersOpen ? styles['filters-open'] : ''}`}>
          {/* ─── RANKING Y FILTRO DE BARRIOS CON MAYOR PROBLEMÁTICA (HEATMAP) ─── */}
          <div className={styles['top-barrios-box']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                <TrendingUp size={15} style={{ color: '#ef4444' }} />
                <span>Menciones por zona</span>
              </div>
              <span className="badge-alta" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                Capturas
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 6px' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {selectedBarrio ? `Filtro activo: ${selectedBarrio}` : 'Haz clic en un barrio para filtrar sus casos:'}
              </p>
              {selectedBarrio && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--blue-500)', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  onClick={() => {
                    setSelectedBarrio(null);
                    setSelectedZone('all');
                    setCustomCenterZoom({ center: [2.9273, -75.2819], zoom: 13 });
                  }}
                >
                  Ver toda la ciudad
                </button>
              )}
            </div>

            <div className={styles['barrios-scroll-list']}>
              {topBarrios.slice(0, 5).map((b, idx) => (
                <button
                  key={b.neighborhood}
                  type="button"
                  className={[styles['barrio-item-btn'], selectedBarrio === b.neighborhood ? styles.active : ''].join(' ')}
                  onClick={() => handleSelectBarrio(b)}
                  title={`Enfocar ${b.neighborhood} (${b.top_category})`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.72rem', color: idx < 3 ? '#ef4444' : 'var(--text-muted)' }}>
                      #{idx + 1}
                    </span>
                    <div style={{ minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.neighborhood}
                      </div>
                      <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>
                        {b.top_category} • {b.commune}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#ef4444' }}>
                      {b.total_issues}
                    </span>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>menciones</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Búsqueda por texto */}
          <div className={styles['filter-group']}>
            <label>Búsqueda Rápida</label>
            <div className={styles['search-input-wrap']}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Palabra, barrio o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Prioridad / Nivel de Riesgo */}
          <div className={styles['filter-group']}>
            <label>Nivel de Prioridad / Riesgo</label>
            <div className={styles['priority-pills']}>
              <button
                className={[styles['pill-btn'], selectedPriority === 'all' ? styles.active : ''].join(' ')}
                onClick={() => setSelectedPriority('all')}
              >
                <span>Todos</span>
                <span className={styles['pill-count']}>{counts.all}</span>
              </button>
              <button
                className={[styles['pill-btn'], styles.alta, selectedPriority === 'Alta' ? styles.active : ''].join(' ')}
                onClick={() => setSelectedPriority('Alta')}
              >
                <span>🔴 Crítico / Alta</span>
                <span className={styles['pill-count']}>{counts.Alta}</span>
              </button>
              <button
                className={[styles['pill-btn'], styles.media, selectedPriority === 'Media' ? styles.active : ''].join(' ')}
                onClick={() => setSelectedPriority('Media')}
              >
                <span>🟡 Media</span>
                <span className={styles['pill-count']}>{counts.Media}</span>
              </button>
              <button
                className={[styles['pill-btn'], styles.baja, selectedPriority === 'Baja' ? styles.active : ''].join(' ')}
                onClick={() => setSelectedPriority('Baja')}
              >
                <span>🟢 Baja</span>
                <span className={styles['pill-count']}>{counts.Baja}</span>
              </button>
            </div>
          </div>

          {/* 3. Categoría de Problemática */}
          <div className={styles['filter-group']}>
            <label>Categoría del Problema</label>
            <select
              className={styles['filter-select']}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              <option value="Servicios Públicos">Servicios Públicos (Agua, luz, gas)</option>
              <option value="Seguridad">Seguridad y Convivencia</option>
              <option value="Infraestructura">Infraestructura y Vías</option>
              <option value="Salud">Salud y Hospitales</option>
              <option value="Movilidad">Movilidad y Tránsito</option>
              <option value="Medio Ambiente">Medio Ambiente y Basuras</option>
            </select>
          </div>

          {/* 4. Zona o Comuna */}
          <div className={styles['filter-group']}>
            <label>Comuna / Territorio (Neiva)</label>
            <select
              className={styles['filter-select']}
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="all">📍 Toda Neiva (Vista General)</option>
              <option value="comuna-1">Comuna 1 - Norte / Cándido Leguízamo</option>
              <option value="comuna-2">Comuna 2 - Nororiente / Las Granjas</option>
              <option value="comuna-3">Comuna 3 - Quirinal / Campo Núñez</option>
              <option value="comuna-4">Comuna 4 - Centro Histórico / Malecón</option>
              <option value="comuna-5">Comuna 5 - Oriente / Buganviles</option>
              <option value="comuna-6">Comuna 6 - Sur / Canaima - Timanco</option>
              <option value="comuna-7">Comuna 7 - Suroriente / Ipanema</option>
              <option value="comuna-8">Comuna 8 - Suroriente / Las Américas</option>
              <option value="comuna-9">Comuna 9 - Norte Alto / Galindo</option>
              <option value="comuna-10">Comuna 10 - Oriente Alto / Las Catleyas</option>
              <option value="caguan">Corregimiento El Caguán</option>
            </select>
          </div>

          {/* 5. Red Social / Canal de Origen */}
          <div className={styles['filter-group']}>
            <label>Canal de Escucha (Meta)</label>
            <select
              className={styles['filter-select']}
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="all">Meta: Facebook e Instagram</option>
              <option value="Facebook">Facebook (Página Oficial)</option>
              <option value="Instagram">Instagram (@JohanSteed)</option>
            </select>
          </div>

          {/* 6. Estado del Reporte */}
          <div className={styles['filter-group']}>
            <label>Estado de Gestión</label>
            <select
              className={styles['filter-select']}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente de atención ({counts.pendientes})</option>
              <option value="En Gestión">En Gestión ({counts.enGestion})</option>
              <option value="Resuelto">Resuelto</option>
            </select>
          </div>

          {/* Convenciones */}
          <div className={styles['legend-box']}>
            <span className={styles['legend-title']}>Convenciones del Termómetro</span>
            <div className={styles['legend-items']}>
              <span style={{ color: 'var(--red-600)' }}>● <strong>Rojo:</strong> Alerta crítica / Riesgo de bloqueo</span>
              <span style={{ color: 'var(--amber-600)' }}>● <strong>Naranja:</strong> Inseguridad o falla moderada</span>
              <span style={{ color: 'var(--emerald-600)' }}>● <strong>Verde:</strong> Reporte leve o solucionado</span>
            </div>
          </div>
          </div>
        </aside>

        {/* ─── Contenedor del Mapa ─── */}
        <div className={styles['map-content']}>
          {/* Barra superior de métricas en vivo */}
          <div className={styles['map-stats-bar']}>
            <div className={styles['stats-badges']}>
              <span>📍 Mostrando: <strong>{filteredIncidents.length} de {incidents.length} focos</strong></span>
              <span>🔴 <strong>{filteredIncidents.filter(i => i.priority === 'Alta').length}</strong> Críticos</span>
              <span>🟡 <strong>{filteredIncidents.filter(i => i.priority === 'Media').length}</strong> Moderados</span>
              <span>🟢 <strong>{filteredIncidents.filter(i => i.priority === 'Baja').length}</strong> Leves</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={14} style={{ color: 'var(--emerald-400)' }} />
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Menciones capturadas · ubicación aproximada</span>
            </div>
          </div>

          {/* Mapa de Leaflet */}
          <ThermometerMap
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            center={customCenterZoom?.center || currentZoneSettings.center}
            zoom={customCenterZoom?.zoom || currentZoneSettings.zoom}
          />

          {/* Tarjeta flotante de incidente seleccionado */}
          {selectedIncident && (
            <div className={styles['incident-card']}>
              <div className={styles['incident-card-header']}>
                <span className={selectedIncident.priority === 'Alta' ? 'badge-alta' : selectedIncident.priority === 'Media' ? 'badge-media' : 'badge-baja'}>
                  Prioridad {selectedIncident.priority}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedIncident.id}</span>
                <button
                  className={styles['close-card-btn']}
                  onClick={() => setSelectedIncident(null)}
                  title="Cerrar detalle"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className={styles['incident-card-title']}>{selectedIncident.title}</h3>
              {(() => {
                const parts = (selectedIncident.description || '').split('[Argumento Geográfico]:');
                const commentBody = parts[0]?.trim();
                const geoArgument = parts[1]?.trim();
                return (
                  <>
                    <p className={styles['incident-card-desc']}>
                      {commentBody ? String.fromCharCode(34) + commentBody + String.fromCharCode(34) : selectedIncident.description}
                    </p>
                    {geoArgument && (
                      <div style={{
                        background: 'rgba(37, 99, 235, 0.12)',
                        border: '1px solid rgba(59, 130, 246, 0.35)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        color: '#93c5fd',
                        margin: '10px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>📍</span>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--text-link)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Justificación Geográfica Verificada
                          </span>
                          <span>{geoArgument}</span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                <span className="badge-tag">📍 {selectedIncident.neighborhood}</span>
                <span className="badge-tag">{selectedIncident.category}</span>
                <span className="badge-tag">📡 {selectedIncident.source}</span>
                <span className="badge-blue">🔥 {selectedIncident.reportsCount} reportes ciudadanos</span>
              </div>

              <div className={styles['incident-card-footer']}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Estado: <strong>{selectedIncident.status}</strong>
                </span>
                <Link
                  href={'/cases/' + selectedIncident.id}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                >
                  Despachar Caso <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
