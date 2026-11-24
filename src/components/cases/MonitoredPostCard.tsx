"use client";

import { memo, useState } from 'react';
import { Sparkles, Video, Tag, Heart, Eye, Share2, MessageSquare, FolderOpen, ArrowUpRight } from 'lucide-react';
import type { MonitoredPostSummary } from '@/lib/api/client';
import styles from '@/app/cases/cases.module.scss';

function formatCompactNumber(num: number | undefined | null): string {
  if (num === null || num === undefined || isNaN(num)) return '—';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

interface Props {
  post: MonitoredPostSummary;
  selected: boolean;
  onOpen: (post: MonitoredPostSummary) => void;
}

export const MonitoredPostCard = memo(function MonitoredPostCard({ post, selected, onOpen }: Props) {
  const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
  const coverUrl = post.thumbnail_url || post.cover_image;
  return (
<div 
                  key={post.id} 
                  className={[styles['post-card'], selected ? styles.expanded : ''].join(' ')}
                >
                  <div className={styles['post-card-cover']} style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#1e293b' }}>
                    {coverUrl && failedCoverUrl !== coverUrl ? (
                      <img 
                        src={coverUrl}
                        alt={post.title} 
                        loading="lazy"
                        decoding="async"
                        width={480}
                        height={300}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setFailedCoverUrl(coverUrl)}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#94a3b8', padding: '16px', textAlign: 'center' }}>
                        <Sparkles size={28} style={{ color: '#38bdf8', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>Imagen original no disponible</span>
                      </div>
                    )}

                    {/* Badges superiores sobre la portada: Red Social a la izquierda y Formato a la derecha */}
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px', right: '10px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      zIndex: 2, pointerEvents: 'none'
                    }}>
                      {/* Badge de Red Social */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#fff',
                        background: (post.source === 'Instagram' || String(post.id).startsWith('IG_'))
                          ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)'
                          : '#1877f2',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.35)'
                      }}>
                        <span>{(post.source === 'Instagram' || String(post.id).startsWith('IG_')) ? '📷 Instagram' : '📘 Facebook'}</span>
                      </div>

                      {/* Badge Formato (Reel / Video / Publicación) */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#fff',
                        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.35)'
                      }}>
                        {post.media_type === 'video' ? <Video size={12} /> : <Tag size={12} />}
                        <span>{post.media_type === 'video' ? 'REEL' : 'PUBLICACIÓN'}</span>
                      </div>
                    </div>

                    <div className={styles['post-card-date']}>
                      <span>🕒 {post.published_at}</span>
                    </div>
                  </div>

                  <div className={styles['post-card-content']}>
                    <div className={styles['post-card-title']} title={post.title}>
                      {post.title}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {post.message}
                    </p>

                    <div className={styles['post-card-stats']}>
                      <div className={styles['metrics-pill-grid']}>
                        {post.source !== 'Instagram' && <div className={styles['metric-pill']} title="Total de todas las reacciones: Me gusta, Me encanta, Me importa y las demás">
                          <Heart size={12} />
                          <span><strong>{formatCompactNumber(post.reactions_count)}</strong> Reacciones</span>
                        </div>}
                        <div className={styles['metric-pill']} title={`Me gusta: ${post.likes_count ?? 'No disponible'}. Es un tipo de reacción, no el total.`}>
                          <Heart size={12} style={{ color: '#ef4444' }} />
                          <span><strong suppressHydrationWarning>{formatCompactNumber(post.likes_count)}</strong> Me gusta</span>
                        </div>
                        <div className={styles['metric-pill']} title={post.views_detail || 'Vistas sin captura confirmada'}>
                          <Eye size={12} style={{ color: '#3b82f6' }} />
                          <span><strong suppressHydrationWarning>{formatCompactNumber(post.views_count)}</strong> Vistas{post.views_status === 'historical' ? ' (hist.)' : ''}</span>
                        </div>
                        <div className={styles['metric-pill']} title={`Compartidos: ${post.shares_count ?? 'No disponible'}`}>
                          <Share2 size={12} style={{ color: '#8b5cf6' }} />
                          <span><strong suppressHydrationWarning>{formatCompactNumber(post.shares_count)}</strong> Compartidos</span>
                        </div>
                        <div className={styles['metric-pill']} title={`Comentarios totales: ${post.total_comments || 0}`}>
                          <MessageSquare size={12} style={{ color: '#f59e0b' }} />
                          <span><strong>{formatCompactNumber(post.total_comments || 0)}</strong> Comms</span>
                        </div>
                      </div>

                      <small title={post.metrics_detail || undefined} style={{ color: 'var(--text-muted)', fontSize: '.75rem', lineHeight: 1.5 }}>—: dato no disponible{post.metrics_status === 'partial' || post.metrics_status === 'unavailable' ? ' · Algunas métricas no pudieron actualizarse.' : ''}</small>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '6px', gap: '6px', flexWrap: 'wrap' }}>
                        <span className={post.cases_count > 0 ? "badge-blue" : "badge-baja"} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', whiteSpace: 'nowrap' }}>
                          📁 {post.cases_count} {post.cases_count === 1 ? 'caso IA' : 'casos IA'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: post.cases_count > 0 ? '#10b981' : '#94a3b8', display: 'inline-block' }} />
                          {post.cases_count > 0 ? 'Casos vinculados' : 'Conversación general'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'stretch' }}>
                      <button
                        type="button"
                        className={styles['post-open-btn']}
                        onClick={() => onOpen(post)}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          marginTop: 0,
                          background: post.cases_count > 0 ? 'var(--action-primary)' : 'var(--bg-muted)',
                          color: post.cases_count > 0 ? '#fff' : 'var(--text-primary)',
                          borderColor: post.cases_count > 0 ? 'var(--blue-600)' : 'var(--border)'
                        }}
                      >
                        <FolderOpen size={14} style={{ flexShrink: 0 }} />
                        <span>{post.cases_count > 0 ? `Ver Casos (${post.cases_count})` : 'Ver Comentarios'}</span>
                      </button>
                      {post.permalink_url && (
                        <a
                          href={post.permalink_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost"
                          title="Abrir publicación original en Facebook"
                          style={{
                            padding: '8px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            flexShrink: 0
                          }}
                        >
                          <ArrowUpRight size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
  );
});
