"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, LayoutGrid, List as ListIcon, Menu, Table as TableIcon,
  Video, CheckCircle2, AlertCircle, ArrowUpRight
} from 'lucide-react';
import styles from './cases.module.scss';

const MOCK_CASES = [
  {
    id: 'CASO-001',
    source: 'Facebook',
    author: '@JuanPerezCol',
    priority: 'Alta',
    title: 'No más abusos con el recibo del agua!',
    content: 'Llevamos 3 semanas sin agua en el barrio Los Pinos, la alcaldía no hace nada y los recibos siguen llegando carísimos. Si no solucionan bloquearemos la vía principal.',
    category: 'Servicios Públicos',
    sentiment: 'Indignación',
    location: 'Los Pinos',
    dateTime: '15 Oct 2026, 14:30',
    mediaType: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1541888086725-3314f2e51927?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Alivia tensión comunitaria inmediata y previene bloqueo de vía arterial.',
    impact_if_ignored: 'Riesgo inminente de protesta social; capitalización por la oposición local.',
  },
  {
    id: 'CASO-002',
    source: 'Instagram',
    author: '@MariaGomez_99',
    priority: 'Baja',
    title: 'Arreglo en la Carrera 5ta avanza muy bien',
    content: 'Me parece excelente que estén reparando los huecos de la carrera 5ta, ya era hora. Ojalá sigan así con el resto de la comuna central.',
    category: 'Infraestructura',
    sentiment: 'Aprobación',
    location: 'Centro - Carrera 5ta',
    dateTime: '15 Oct 2026, 09:15',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop',
    impact_if_solved: 'Genera validación comunitaria positiva y confianza en obras públicas.',
    impact_if_ignored: 'Pérdida de oportunidad mediática para posicionar la gestión.',
  },
  {
    id: 'CASO-003',
    source: 'Twitter / X',
    author: '@CiudadanoAlerta',
    priority: 'Media',
    title: 'Robo a plena luz del día en el parque principal',
    content: 'Robaron a otra persona en el parque principal a plena luz del día frente a los niños. ¿Dónde están los cuadrantes de policía?',
    category: 'Seguridad',
    sentiment: 'Preocupación',
    location: 'Parque Principal',
    dateTime: '14 Oct 2026, 18:45',
    mediaType: 'none',
    imageUrl: null,
    impact_if_solved: 'Refuerza percepción de patrullaje y seguridad ciudadana inmediata.',
    impact_if_ignored: 'Aumento del miedo colectivo y desconfianza en la policía local.',
  }
];

export default function CasesPage() {
  const [viewMode, setViewMode] = useState<'card' | 'compact' | 'list' | 'table'>('card');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredCases = MOCK_CASES.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.content.toLowerCase().includes(search.toLowerCase()) ||
                          c.location.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

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
          <button 
            className={[styles['filter-btn'], filterPriority === 'all' ? styles.active : ''].join(' ')} 
            onClick={() => setFilterPriority(filterPriority === 'all' ? 'Alta' : 'all')}
          >
            <Filter size={16} /> Prioridad: {filterPriority === 'all' ? 'Todos' : filterPriority}
          </button>
        </div>

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
