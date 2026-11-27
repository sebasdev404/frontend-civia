import type { ConversationAnalysis } from '@/lib/api/client';

export const stanceLabels = {
  support: 'A favor de Johan', criticism: 'Crítica a Johan', mixed: 'Postura mixta',
  neutral: 'Sin postura frente a Johan', unclear: 'Por aclarar',
};

export function ConversationBadge({ analysis }: { analysis?: ConversationAnalysis }) {
  const review = !analysis || analysis.needs_review;
  const color = review ? 'var(--text-secondary)' : analysis.stance === 'support' ? 'var(--emerald-600)' : analysis.stance === 'criticism' ? 'var(--red-600)' : 'var(--blue-600)';
  return (
    <span title={analysis?.explanation || 'Falta analizar el comentario con el contexto de su publicación.'}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 13, lineHeight: 1.6, color }}>
      {review ? analysis?.status === 'analyzed' ? 'Analizado · Necesita revisión' : 'Sin analizar' : stanceLabels[analysis.stance]}
      {analysis?.status === 'analyzed' && <> · Emoción: {analysis.emotion}</>}
    </span>
  );
}
