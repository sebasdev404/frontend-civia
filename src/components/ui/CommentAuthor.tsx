"use client";

import { useState } from 'react';
import { LockKeyhole, UserRound } from 'lucide-react';
import styles from './CommentAuthor.module.scss';

interface CommentAuthorProps {
  name?: string | null;
  pictureUrl?: string | null;
  protectedProfile?: boolean;
  source?: string;
}

export function CommentAuthor({ name, pictureUrl, protectedProfile, source = 'Facebook' }: CommentAuthorProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const isProtected = protectedProfile ?? (!name || name.includes('Perfil Protegido por Meta'));
  const displayName = isProtected ? `Usuario de ${source}` : name;
  const showPhoto = Boolean(pictureUrl && pictureUrl !== failedUrl);

  return (
    <span className={styles.author} title={isProtected ? 'Meta no entregó el nombre ni la identidad de este autor.' : undefined}>
      <span className={styles.avatar} aria-hidden="true">
        {showPhoto ? (
          // Las fotos firmadas de Meta se muestran directamente y se renuevan al sincronizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pictureUrl!} width={36} height={36} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedUrl(pictureUrl!)} />
        ) : isProtected ? <LockKeyhole size={16} /> : <UserRound size={18} />}
      </span>
      <span className={styles.details}>
        <strong className={styles.name}>{displayName}</strong>
        {isProtected && <span className={styles.note}>Perfil protegido por Meta</span>}
      </span>
    </span>
  );
}
