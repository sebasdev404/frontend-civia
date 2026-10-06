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
    lat: 2.9415,
    lng: -75.2862,
    title: 'Corte prolongado y sobrecostos en tarifa de acueducto Las Ceibas',
    description: 'Comunidad de Las Granjas lleva 4 días sin agua potable por falla en bocatoma del río Las Ceibas y recibos excesivos. Amenaza de bloqueo en la Cra 2da con Cll 64.',
    category: 'Servicios Públicos',
    priority: 'Alta',
    sentiment: 'Indignación',
    source: 'Facebook',
    neighborhood: 'Las Granjas - Comuna 2',
    zone: 'comuna-2',
    status: 'Pendiente',
    reportsCount: 58,
    dateTime: 'Hace 20 min',
  },
  {
    id: 'CASO-002',
    lat: 2.9335,
    lng: -75.2840,
    title: 'Repavimentación y bacheo en Avenida La Toma',
    description: 'Avanza a buen ritmo el plan de recuperación de la malla vial en La Toma con Cra 5ta. Flujo vehicular asistido por controladores.',
    category: 'Infraestructura',
    priority: 'Baja',
    sentiment: 'Aprobación',
    source: 'Instagram',
    neighborhood: 'Centro - Av. La Toma',
    zone: 'comuna-3',
    status: 'En Gestión',
    reportsCount: 18,
    dateTime: 'Hace 1 hora',
  },
  {
    id: 'CASO-003',
    lat: 2.9285,
    lng: -75.2935,
    title: 'Hurtos a deportistas y visitantes en el Malecón del Río Magdalena',
    description: 'Comerciantes y deportistas del sendero turístico de La Gaitana solicitan patrullaje policial continuo por robos en horas de la tarde.',
    category: 'Seguridad',
    priority: 'Media',
    sentiment: 'Preocupación',
    source: 'Instagram',
    neighborhood: 'El Malecón - Comuna 4',
    zone: 'comuna-4',
    status: 'Pendiente',
    reportsCount: 34,
    dateTime: 'Hace 40 min',
  },
  {
    id: 'CASO-004',
    lat: 2.9062,
    lng: -75.2848,
    title: 'Rebosamiento de aguas servidas en canaleta barrial',
    description: 'Lluvias torrenciales desbordaron el colector de aguas negras inundando 14 viviendas en Canaima. Riesgo fitosanitario para menores.',
    category: 'Servicios Públicos',
    priority: 'Alta',
    sentiment: 'Indignación',
    source: 'Facebook',
    neighborhood: 'Canaima - Comuna 6',
    zone: 'comuna-6',
    status: 'Pendiente',
    reportsCount: 62,
    dateTime: 'Hace 12 min',
  },
  {
    id: 'CASO-005',
    lat: 2.9358,
    lng: -75.2795,
    title: 'Sobrecupo de urgencias en Hospital Hernando Moncaleano',
    description: 'Largas filas y demoras de más de 6 horas en triaje y falta de medicamentos para usuarios crónicos remitidos de municipios vecinos.',
    category: 'Salud',
    priority: 'Alta',
    sentiment: 'Alerta',
    source: 'Facebook',
    neighborhood: 'Quirinal - Hospital Universitario',
    zone: 'comuna-3',
    status: 'En Gestión',
    reportsCount: 47,
    dateTime: 'Hace 1 hora',
  },
  {
    id: 'CASO-006',
    lat: 2.9380,
    lng: -75.2780,
    title: 'Disposición clandestina de escombros en ronda del Río Las Ceibas',
    description: 'Carretas y camiones arrojan desechos de obras a la orilla del río poniendo en riesgo el caudal hídrico y zonas verdes escolares.',
    category: 'Medio Ambiente',
    priority: 'Media',
    sentiment: 'Preocupación',
    source: 'Instagram',
    neighborhood: 'San Martín / Río Las Ceibas',
    zone: 'comuna-2',
    status: 'Pendiente',
    reportsCount: 26,
    dateTime: 'Hace 2 horas',
  },
  {
    id: 'CASO-007',
    lat: 2.9460,
    lng: -75.2970,
    title: 'Semáforos descalibrados en Avenida Circunvalar con Calle 21',
    description: 'Falla intermitente en semáforos del corredor norte causa congestión y alto riesgo de choque en el acceso hacia el puente Santander.',
    category: 'Movilidad',
    priority: 'Media',
    sentiment: 'Alerta',
    source: 'Facebook',
    neighborhood: 'Cándido Leguízamo - Comuna 1',
    zone: 'comuna-1',
    status: 'En Gestión',
    reportsCount: 29,
    dateTime: 'Hace 30 min',
  },
  {
    id: 'CASO-008',
    lat: 2.9195,
    lng: -75.2665,
    title: 'Renovación de iluminación LED en parque y ciclo-ruta',
    description: 'Instalación de luminarias LED completada en el sector residencial de Ipanema. Vecinos resaltan mayor visibilidad y seguridad.',
    category: 'Infraestructura',
    priority: 'Baja',
    sentiment: 'Positivo',
    source: 'Instagram',
    neighborhood: 'Ipanema - Comuna 7',
    zone: 'comuna-7',
    status: 'Resuelto',
    reportsCount: 11,
    dateTime: 'Hace 4 horas',
  },
];

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
      lat: 2.9273 + (Math.random() - 0.5) * 0.03,
      lng: -75.2819 + (Math.random() - 0.5) * 0.03,
      title: '🚨 Fuga de gas y fuerte olor en microcentro',
      description: 'Reporte ciudadano urgente desde Twitter y WhatsApp: olor a gas en Carrera 5ta con Calle 10. Evacuación preventiva.',
      category: 'Servicios Públicos',
      priority: 'Alta',
      sentiment: 'Alerta',
      source: 'WhatsApp',
      neighborhood: 'Microcentro - Carrera 5ta',
      zone: 'comuna-4',
      status: 'Pendiente',
      reportsCount: 43,
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
