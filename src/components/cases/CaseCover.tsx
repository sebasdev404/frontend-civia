'use client';

import { memo, useState } from 'react';
import { ImageOff } from 'lucide-react';

export const CaseCover = memo(function CaseCover({ src, title }: { src?: string | null; title: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const generic = /(?:default_cover|ig_cover_(?:comuna6|malecon|ceibas|salud))\.jpg|images\.unsplash\.com/i.test(src || '');
  if (!src || generic || failedSrc === src) {
    return <div style={{ width: '100%', height: '100%', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)', background: 'var(--bg-muted)' }}><ImageOff size={18} aria-hidden="true" /><span style={{ fontSize: '.8rem' }}>Imagen original no disponible</span></div>;
  }
  return <img src={src} alt={`Publicación de origen: ${title}`} width={480} height={300} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
});
