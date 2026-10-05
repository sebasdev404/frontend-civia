"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './map.module.scss';
import ThermometerMap, { MapIncident } from '@/components/map/ThermometerMap';
import { 
  Layers, Search, Filter, AlertCircle, ArrowUpRight, 
  RotateCcw, Radio, X, MapPin, MessageSquare, CheckCircle2 
} from 'lucide-react';

const INITIAL_INCIDENTS: MapIncident[] = [
  {
    id: 'CASO-001',
    lat: 4.6097,
    lng: -74.0817,
    title: 'No más abusos con el recibo del agua',
    description: 'Comunidad lleva 3 semanas sin suministro regular de agua y cobros excesivos. Amenaza de bloqueo de vía principal.',
    category: 'Servicios Públicos',
    priority: 'Alta',
    sentiment: 'Indignación',
    source: 'Facebook',
    neighborhood: 'Barrio Los Pinos',
    zone: 'centro',
    status: 'Pendiente',
    reportsCount: 42,
    dateTime: 'Hace 25 min',
  },
  {
    id: 'CASO-002',
    lat: 4.6486,
    lng: -74.0628,
    title: 'Obras y baches en la Carrera 5ta',
    description: 'Avanzan reparaciones de la malla vial, conductores reportan desvíos bien señalizados pero tráfico lento.',
    category: 'Infraestructura',
    priority: 'Baja',
    sentiment: 'Aprobación',
    source: 'Instagram',
    neighborhood: 'Centro - Cra 5ta',
    zone: 'chapinero',
    status: 'En Gestión',
    reportsCount: 15,
    dateTime: 'Hace 2 horas',
  },
  {
    id: 'CASO-003',
    lat: 4.6763,
    lng: -74.0483,
    title: 'Atraco a mano armada en parque vecinal',
    description: 'Vecinos solicitan patrullaje urgente tras asalto a comerciantes en la zona comercial del parque.',
    category: 'Seguridad',
    priority: 'Media',
    sentiment: 'Preocupación',
    source: 'Twitter / X',
    neighborhood: 'Parque Principal Usaquén',
    zone: 'usaquen',
    status: 'Pendiente',
    reportsCount: 28,
    dateTime: 'Hace 45 min',
  },
  {
    id: 'CASO-004',
    lat: 4.6280,
    lng: -74.1350,
    title: 'Desbordamiento de alcantarillado e inundación',
    description: 'Aguas servidas ingresaron a 12 viviendas tras fuertes lluvias. Riesgo de salubridad infantil.',
    category: 'Servicios Públicos',
    priority: 'Alta',
    sentiment: 'Indignación',
    source: 'WhatsApp',
    neighborhood: 'El Tintal - Kennedy',
    zone: 'kennedy',
    status: 'Pendiente',
    reportsCount: 56,
    dateTime: 'Hace 10 min',
  },
  {
    id: 'CASO-005',
    lat: 4.5720,
    lng: -74.0950,
    title: 'Escasez de insumos en puesto de salud',
    description: 'Filas de adultos mayores desde las 4 AM sin entrega de medicamentos vitales para hipertensión.',
    category: 'Salud',
    priority: 'Alta',
    sentiment: 'Alerta',
    source: 'Facebook',
    neighborhood: 'La Victoria - San Cristóbal',
    zone: 'sancristobal',
    status: 'En Gestión',
    reportsCount: 33,
    dateTime: 'Hace 1 hora',
  },
  {
    id: 'CASO-006',
    lat: 4.7350,
    lng: -74.0850,
    title: 'Botadero de escombros en separador vial',
    description: 'Carretilleros arrojan desechos de construcción bloqueando el paso peatonal escolar.',
    category: 'Medio Ambiente',
    priority: 'Media',
    sentiment: 'Preocupación',
    source: 'Twitter / X',
    neighborhood: 'Rincón de Suba',
    zone: 'suba',
    status: 'Pendiente',
    reportsCount: 19,
    dateTime: 'Hace 3 horas',
  },
  {
    id: 'CASO-007',
    lat: 4.6550,
    lng: -74.0580,
    title: 'Semáforos apagados en intersección crítica',
    description: 'Cruce de la Calle 67 con Carrera 7ma sin controladores viales, alta congestión y riesgo de colisión.',
    category: 'Movilidad',
    priority: 'Media',
    sentiment: 'Alerta',
    source: 'Twitter / X',
    neighborhood: 'Chapinero Norte',
    zone: 'chapinero',
    status: 'En Gestión',
    reportsCount: 22,
    dateTime: 'Hace 35 min',
  },
  {
    id: 'CASO-008',
    lat: 4.6390,
    lng: -74.0720,
    title: 'Luminarias recuperadas en plazoleta',
    description: 'Intervención exitosa de la empresa de energía restableció la iluminación tras reporte ciudadano.',
    category: 'Infraestructura',
    priority: 'Baja',
    sentiment: 'Positivo',
    source: 'Instagram',
    neighborhood: 'Parkway - Teusaquillo',
    zone: 'centro',
    status: 'Resuelto',
    reportsCount: 9,
    dateTime: 'Hace 5 horas',
  },
];

const ZONE_COORDINATES: Record<string, { center: [number, number]; zoom: number }> = {
  all: { center: [4.6400, -74.0800], zoom: 12 },
  centro: { center: [4.6200, -74.0750], zoom: 14 },
  chapinero: { center: [4.6520, -74.0600], zoom: 14 },
  usaquen: { center: [4.6850, -74.0400], zoom: 14 },
  kennedy: { center: [4.6250, -74.1350], zoom: 14 },
  suba: { center: [4.7300, -74.0800], zoom: 13 },
  sancristobal: { center: [4.5700, -74.0950], zoom: 14 },
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
  const [isLive, setIsLive] = useState(true);

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

  // Simulación en tiempo real: Inyectar un incidente dinámico detectado por IA
  const handleSimulateAlert = () => {
    const newId = `CASO-00${incidents.length + 1}`;
    const newAlert: MapIncident = {
      id: newId,
      lat: 4.6350 + (Math.random() - 0.5) * 0.05,
      lng: -74.0900 + (Math.random() - 0.5) * 0.05,
      title: '🚨 Fuga masiva de gas en vía principal',
      description: 'Reporte ciudadano urgente desde Twitter y WhatsApp: fuerte olor a gas y evacuación preventiva en locales.',
      category: 'Servicios Públicos',
      priority: 'Alta',
      sentiment: 'Alerta',
      source: 'WhatsApp',
      neighborhood: 'Zona Comercial Quinta Paredes',
      zone: 'centro',
      status: 'Pendiente',
      reportsCount: 68,
      dateTime: 'Justo ahora (En Vivo)',
      isNew: true,
    };

    setIncidents((prev) => [newAlert, ...prev]);
    setSelectedIncident(newAlert);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedPriority('all');
    setSelectedCategory('all');
    setSelectedSource('all');
    setSelectedStatus('all');
    setSelectedZone('all');
    setSelectedIncident(null);
  };

  const currentZoneSettings = ZONE_COORDINATES[selectedZone] || ZONE_COORDINATES.all;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mapa Termómetro Ciudadano en Tiempo Real</h1>
        <p>Monitoreo geolocalizado, clusterización de problemáticas y despacho territorial de incidentes</p>
      </div>

      <div className={styles['map-layout']}>
        {/* ─── Sidebar de Filtros Completos ─── */}
        <aside className={styles['map-sidebar']}>
          <div className={styles['sidebar-header']}>
            <div className={styles['sidebar-title']}>
              <Layers size={18} style={{ color: 'var(--blue-600)' }} />
              <span>Filtros Territoriales</span>
            </div>
            <button className={styles['clear-btn']} onClick={handleResetFilters} title="Limpiar todos los filtros">
              <RotateCcw size={12} style={{ display: 'inline', marginRight: 4 }} />
              Limpiar
            </button>
          </div>

          {/* Banner de Monitoreo Activo / Tiempo Real */}
          <div className={styles['live-banner']}>
            <div className={styles['live-indicator']}>
              <div className={styles['pulse-dot']} />
              <span>{isLive ? 'Monitoreo En Vivo' : 'Pausado'}</span>
            </div>
            <button 
              className={styles['sim-button']} 
              onClick={handleSimulateAlert}
              title="Simula una nueva queja captada por la IA"
            >
              + Simular Alerta
            </button>
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
            <label>Localidad / Comuna</label>
            <select
              className={styles['filter-select']}
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="all">📍 Toda la Ciudad (Vista General)</option>
              <option value="usaquen">Norte / Usaquén</option>
              <option value="chapinero">Centro-Oriente / Chapinero</option>
              <option value="centro">Centro Histórico / Los Pinos</option>
              <option value="kennedy">Occidente / Kennedy - Tintal</option>
              <option value="suba">Noroeste / Suba</option>
              <option value="sancristobal">Sur / San Cristóbal</option>
            </select>
          </div>

          {/* 5. Red Social / Canal de Origen */}
          <div className={styles['filter-group']}>
            <label>Canal de Escucha Social</label>
            <select
              className={styles['filter-select']}
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="all">Todos los canales</option>
              <option value="Facebook">Facebook</option>
              <option value="Twitter / X">Twitter / X</option>
              <option value="Instagram">Instagram</option>
              <option value="WhatsApp">WhatsApp</option>
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
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Escucha IA en Tiempo Real</span>
            </div>
          </div>

          {/* Mapa de Leaflet */}
          <ThermometerMap
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            center={currentZoneSettings.center}
            zoom={currentZoneSettings.zoom}
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
              <p className={styles['incident-card-desc']}>{selectedIncident.description}</p>

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
