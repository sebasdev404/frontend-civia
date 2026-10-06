"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, LayoutGrid, List as ListIcon, Menu, Table as TableIcon,
  Video, CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw, ChevronDown,
  Tag, Radio, ShieldAlert
} from 'lucide-react';
import { API } from '@/lib/api/client';
import styles from './cases.module.scss';

const MOCK_CASES = [
  {
    id: 'CASO-001',
    source: 'Facebook',
    author: '@JuanPerezNeiva',
    priority: 'Alta',
    title: 'No más abusos con el recibo del agua y cortes de Las Ceibas!',
    content: 'Llevamos 4 días sin suministro regular de agua en el barrio Las Granjas (Comuna 2), Las Ceibas E.S.P. no responde y los cobros siguen llegando altísimos. Si no solucionan hoy bloquearemos la Carrera 2da con Calle 64.',
    category: 'Servicios Públicos',
    sentiment: 'Indignación',
    location: 'Las Granjas - Comuna 2',
    dateTime: '15 Oct 2026, 14:30',
    status: 'Pendiente',
    mediaType: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1541888086725-3314f2e51927?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Alivia tensión comunitaria inmediata y previene bloqueo de vía arterial norte en Neiva.',
    impact_if_ignored: 'Riesgo inminente de protesta social frente a la sede de Las Ceibas E.S.P.',
  },
  {
    id: 'CASO-002',
    source: 'Instagram',
    author: '@MariaGomez_Huila',
    priority: 'Baja',
    title: 'Arreglo en Avenida La Toma avanza muy bien',
    content: 'Me parece excelente que la alcaldía esté reparando la calzada de la Avenida La Toma con Carrera 5ta, ya era hora. Ojalá sigan así con el resto de la comuna central.',
    category: 'Infraestructura',
    sentiment: 'Aprobación',
    location: 'Centro - Av. La Toma',
    dateTime: '15 Oct 2026, 09:15',
    status: 'En Gestión',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Genera validación comunitaria positiva y confianza en obras públicas de Neiva.',
    impact_if_ignored: 'Pérdida de oportunidad mediática para posicionar la gestión de infraestructura vial.',
  },
  {
    id: 'CASO-003',
    source: 'Twitter / X',
    author: '@NeivaAlerta',
    priority: 'Media',
    title: 'Hurto a mano armada en el sendero del Malecón del Río Magdalena',
    content: 'Asaltaron a varios deportistas en el Malecón cerca del monumento a La Gaitana a plena luz del día. ¿Dónde están los cuadrantes de policía de la Comuna 4?',
    category: 'Seguridad',
    sentiment: 'Preocupación',
    location: 'El Malecón - Comuna 4',
    dateTime: '14 Oct 2026, 18:45',
    status: 'Pendiente',
    mediaType: 'none',
    imageUrl: null,
    impact_if_solved: 'Refuerza percepción de patrullaje y seguridad en el principal eje turístico de Neiva.',
    impact_if_ignored: 'Aumento del temor en turistas y desconfianza en la seguridad urbana.',
  },
  {
    id: 'CASO-004',
    source: 'WhatsApp',
    author: '@LiderCanaimaNeiva',
    priority: 'Alta',
    title: 'Rebosamiento de aguas residuales e inundación en canaleta barrial',
    content: 'Aguas negras ingresaron a más de 14 casas tras las fuertes lluvias de anoche en Canaima. Riesgo fitosanitario crítico para niños y adultos mayores.',
    category: 'Servicios Públicos',
    sentiment: 'Indignación',
    location: 'Canaima - Comuna 6',
    dateTime: '15 Oct 2026, 15:10',
    status: 'Pendiente',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1541888086725-3314f2e51927?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Despliegue de camión vactor de Las Ceibas y prevención de contingencia sanitaria.',
    impact_if_ignored: 'Protesta comunitaria y plantón sobre la Avenida Max Duque.',
  },
  {
    id: 'CASO-005',
    source: 'Facebook',
    author: '@VeeduriaSaludHuila',
    priority: 'Alta',
    title: 'Colapso en urgencias del Hospital Universitario de Neiva',
    content: 'Pacientes y abuelos esperando más de 7 horas en el Hospital Hernando Moncaleano. No hay insumos suficientes ni camas para pacientes del sur del departamento.',
    category: 'Salud',
    sentiment: 'Alerta',
    location: 'Quirinal - Comuna 3',
    dateTime: '15 Oct 2026, 11:20',
    status: 'En Gestión',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Articulación con Secretaría de Salud Departamental para descongestionar el centro asistencial.',
    impact_if_ignored: 'Crisis hospitalaria y denuncias ante la Superintendencia Nacional de Salud.',
  },
  {
    id: 'CASO-006',
    source: 'Twitter / X',
    author: '@NeivaSostenible',
    priority: 'Media',
    title: 'Botadero clandestino de escombros en ronda del Río Las Ceibas',
    content: 'Carretilleros y volquetas arrojan desechos de construcción en la ribera del Río Las Ceibas cerca al barrio San Martín. Afecta la cuenca y el entorno escolar.',
    category: 'Medio Ambiente',
    sentiment: 'Preocupación',
    location: 'San Martín / Río Las Ceibas',
    dateTime: '14 Oct 2026, 16:30',
    status: 'Pendiente',
    mediaType: 'none',
    imageUrl: null,
    impact_if_solved: 'Protección de la fuente hídrica vital de Neiva y operativo conjunto con la CAM.',
    impact_if_ignored: 'Taponamiento del cauce hídrico y proliferación de vertederos ilegales.',
  },
  {
    id: 'CASO-007',
    source: 'Twitter / X',
    author: '@MovilidadNeivaHoy',
    priority: 'Media',
    title: 'Semáforos apagados en intersección de la Avenida Circunvalar',
    content: 'Cruce de la Circunvalar con Calle 21 sin controladores viales. Trancón monumental hacia el norte y alto peligro de siniestros viales.',
    category: 'Movilidad',
    sentiment: 'Alerta',
    location: 'Cándido Leguízamo - Comuna 1',
    dateTime: '15 Oct 2026, 12:00',
    status: 'En Gestión',
    mediaType: 'none',
    imageUrl: null,
    impact_if_solved: 'Restablecimiento de la fluidez en el corredor norte hacia el puente Santander.',
    impact_if_ignored: 'Colapso vehicular en hora pico y siniestros con motociclistas.',
  },
  {
    id: 'CASO-008',
    source: 'Instagram',
    author: '@VecinosIpanema',
    priority: 'Baja',
    title: 'Alumbrado LED instalado en parque y ciclo-ruta',
    content: 'Agradecemos a la administración por el cambio a luminarias LED en las zonas verdes de Ipanema. El sector quedó mucho más seguro para hacer deporte en la noche.',
    category: 'Infraestructura',
    sentiment: 'Positivo',
    location: 'Ipanema - Comuna 7',
    dateTime: '14 Oct 2026, 20:15',
    status: 'Resuelto',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Incrementa la satisfacción ciudadana y el uso seguro de espacios deportivos nocturnos.',
    impact_if_ignored: 'Sin riesgo inmediato.',
  }
];

export default function CasesPage() {
  const [viewMode, setViewMode] = useState<'card' | 'compact' | 'list' | 'table'>('card');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [casesList, setCasesList] = useState<any[]>(MOCK_CASES);

  useEffect(() => {
    let isMounted = true;
    async function loadCases() {
      try {
        const data = await API.cases.getAll();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            source: item.source,
            author: item.author,
            priority: item.priority,
            title: item.title,
            content: item.content,
            category: item.category,
            sentiment: item.sentiment,
            location: item.location,
            dateTime: item.date_time || item.dateTime,
            mediaType: item.media_type || item.mediaType || 'none',
            imageUrl: item.image_url || item.imageUrl,
            impact_if_solved: item.impact_if_solved,
            impact_if_ignored: item.impact_if_ignored,
            status: item.status || 'Pendiente',
          }));
          setCasesList(formatted);
        }
      } catch (err) {
        console.warn('Backend offline o usando datos locales:', err);
      }
    }
    loadCases();
    return () => { isMounted = false; };
  }, []);

  const filteredCases = useMemo(() => {
    return casesList.filter(c => {
      const matchesSearch = 
        !search || 
        c.title.toLowerCase().includes(search.toLowerCase()) || 
        c.content.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        (c.author && c.author.toLowerCase().includes(search.toLowerCase()));

      const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
      const matchesSource = filterSource === 'all' || c.source === filterSource;
      const matchesStatus = filterStatus === 'all' || (c.status && c.status === filterStatus);

      return matchesSearch && matchesPriority && matchesCategory && matchesSource && matchesStatus;
    });
  }, [casesList, search, filterPriority, filterCategory, filterSource, filterStatus]);

  const handleResetFilters = () => {
    setSearch('');
    setFilterPriority('all');
    setFilterCategory('all');
    setFilterSource('all');
    setFilterStatus('all');
  };

  const hasActiveFilters = search !== '' || filterPriority !== 'all' || filterCategory !== 'all' || filterSource !== 'all' || filterStatus !== 'all';

  const getPriorityBadge = (priority: string) => {
    if (priority === 'Alta') return 'badge-alta';
    if (priority === 'Media') return 'badge-media';
    return 'badge-baja';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Bandeja de Casos Ciudadanos</h1>
        <p>Gestión, análisis de impacto y despacho de reportes detectados por IA</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.controls}>
          {/* Búsqueda */}
          <div className={styles['search-wrap']}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar por palabra clave, barrio o caso..." 
              className={styles['search-input']} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Dropdown de Prioridad */}
          <div className={[styles['filter-dropdown-wrap'], filterPriority !== 'all' ? styles.active : ''].join(' ')}>
            <Filter size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              title="Filtrar por nivel de prioridad"
            >
              <option value="all">Prioridad: Todos</option>
              <option value="Alta">🔴 Alta</option>
              <option value="Media">🟡 Media</option>
              <option value="Baja">🟢 Baja</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Categoría */}
          <div className={[styles['filter-dropdown-wrap'], filterCategory !== 'all' ? styles.active : ''].join(' ')}>
            <Tag size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              title="Filtrar por categoría del problema"
            >
              <option value="all">Categoría: Todas</option>
              <option value="Servicios Públicos">Servicios Públicos</option>
              <option value="Infraestructura">Infraestructura</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Salud">Salud</option>
              <option value="Movilidad">Movilidad</option>
              <option value="Medio Ambiente">Medio Ambiente</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Canal / Red Social */}
          <div className={[styles['filter-dropdown-wrap'], filterSource !== 'all' ? styles.active : ''].join(' ')}>
            <Radio size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterSource} 
              onChange={(e) => setFilterSource(e.target.value)}
              title="Filtrar por red o canal social"
            >
              <option value="all">Canal: Todos</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter / X">Twitter / X</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Estado de Gestión */}
          <div className={[styles['filter-dropdown-wrap'], filterStatus !== 'all' ? styles.active : ''].join(' ')}>
            <ShieldAlert size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              title="Filtrar por estado del caso"
            >
              <option value="all">Estado: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Gestión">En Gestión</option>
              <option value="Resuelto">Resuelto</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <button 
              className={styles['clear-btn']} 
              onClick={handleResetFilters}
              title="Restablecer todos los filtros"
            >
              <RotateCcw size={13} /> Limpiar
            </button>
          )}

          {/* Contador de casos encontrados */}
          <span className={styles['counter-badge']}>
            {filteredCases.length} {filteredCases.length === 1 ? 'caso' : 'casos'}
          </span>
        </div>

        {/* Selector de vistas */}
        <div className={styles['view-switcher']}>
          <button 
            className={[styles['view-btn'], viewMode === 'card' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('card')}
            title="Vista Detallada"
          >
            <LayoutGrid size={18} /> <span>Detalle</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'compact' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('compact')}
            title="Vista Cuadrícula"
          >
            <Menu size={18} /> <span>Cuadrícula</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'list' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('list')}
            title="Vista Lista"
          >
            <ListIcon size={18} /> <span>Lista</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'table' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('table')}
            title="Vista Tabla"
          >
            <TableIcon size={18} /> <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* Renderizado de Vistas */}
      {viewMode === 'card' && (
        <div>
          {filteredCases.map((c) => (
            <div key={c.id} className={styles['case-card']}>
              <div className={styles['case-card-body']}>
                <div className={styles['case-preview']}>
                  <div className={styles['post-author']}>
                    <div className={styles['post-author-info']}>
                      <div className={styles['post-avatar']}>{c.source.charAt(0)}</div>
                      <div>
                        <div className={styles['post-name']}>{c.author}</div>
                        <div className={styles['post-meta']}>{c.dateTime} • {c.source}</div>
                      </div>
                    </div>
                    <span className={styles['post-id']}>{c.id}</span>
                  </div>
                  <h3 className={styles['post-title']}>{c.title}</h3>
                  <p className={styles['post-content']}>{c.content}</p>

                  {c.imageUrl && (
                    <div className={styles['media-thumb']}>
                      <img src={c.imageUrl} alt={c.title} />
                      {c.mediaType === 'video' && (
                        <div className={styles['media-play']}>
                          <span><Video size={20} /></span>
                        </div>
                      )}
                      <div className={styles['media-label']}>{c.mediaType.toUpperCase()}</div>
                    </div>
                  )}
                </div>

                <div className={styles['case-analysis']}>
                  <div>
                    <div className={styles.tags}>
                      <span className={getPriorityBadge(c.priority)}>Prioridad {c.priority}</span>
                      <span className="badge-tag">{c.location}</span>
                      <span className="badge-tag">{c.category}</span>
                      <span className="badge-blue">Sentimiento: {c.sentiment}</span>
                    </div>

                    <div className={styles['impact-box']}>
                      <div className={styles['impact-title']}>Proyección de Impacto Político</div>
                      <div className={[styles['impact-row'], styles['impact-solved']].join(' ')}>
                        <CheckCircle2 size={16} />
                        <div>
                          <span className={styles['impact-label']}>Si se resuelve: </span>
                          <span className={styles['impact-text']}>{c.impact_if_solved}</span>
                        </div>
                      </div>
                      <div className={[styles['impact-row'], styles['impact-ignore']].join(' ')}>
                        <AlertCircle size={16} />
                        <div>
                          <span className={styles['impact-label']}>Si se ignora: </span>
                          <span className={styles['impact-text']}>{c.impact_if_ignored}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles['case-actions']}>
                    <button className="btn-ghost">Descartar</button>
                    <Link href={'/cases/' + c.id} className="btn-primary">
                      Abrir Caso <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'compact' && (
        <div className={styles['compact-grid']}>
          {filteredCases.map((c) => (
            <div key={c.id} className={styles['compact-card']}>
              {c.imageUrl && (
                <div className={styles['compact-thumb']}>
                  <img src={c.imageUrl} alt={c.title} />
                </div>
              )}
              <div style={{ width: '100%' }}>
                <div className={styles['compact-meta']}>{c.id} • {c.dateTime} • {c.source}</div>
                <h3 className={styles['compact-title']}>{c.title}</h3>
                <p className={styles['compact-text']}>{c.content}</p>
                <div className={styles.tags} style={{ marginTop: '8px' }}>
                  <span className={getPriorityBadge(c.priority)}>{c.priority}</span>
                  <span className="badge-tag">{c.location}</span>
                </div>
              </div>
              <div className={styles['compact-actions']}>
                <Link href={'/cases/' + c.id} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Abrir Caso <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className={styles['list-container']}>
          {filteredCases.map((c) => (
            <div key={c.id} className={styles['list-row']}>
              <div className={styles['list-thumb']}>
                {c.imageUrl ? <img src={c.imageUrl} alt="" /> : c.source.charAt(0)}
              </div>
              <div className={styles['list-info']}>
                <div className={styles['list-tags']}>
                  <span className={getPriorityBadge(c.priority)}>P. {c.priority}</span>
                  <span className="badge-tag">{c.category}</span>
                  <span className="badge-tag">{c.location}</span>
                </div>
                <div className={styles['list-title']}>{c.title}</div>
                <div className={styles['list-sub']}>{c.id} • {c.author} • {c.dateTime}</div>
              </div>
              <Link href={'/cases/' + c.id} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                Abrir <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className={styles['table-container']}>
          <table className={styles.table}>
            <thead className={styles['table-head']}>
              <tr>
                <th>ID</th>
                <th>Detalle del Caso</th>
                <th>Categoría</th>
                <th>Ubicación</th>
                <th>Prioridad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody className={styles['table-body']}>
              {filteredCases.map((c) => (
                <tr key={c.id}>
                  <td className={styles['table-id']}>{c.id}</td>
                  <td>
                    <div className={styles['table-title']}>{c.title}</div>
                    <div className={styles['table-sub']}>{c.author} • {c.dateTime}</div>
                  </td>
                  <td><span className="badge-tag">{c.category}</span></td>
                  <td>{c.location}</td>
                  <td><span className={getPriorityBadge(c.priority)}>{c.priority}</span></td>
                  <td>
                    <Link href={'/cases/' + c.id} className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
