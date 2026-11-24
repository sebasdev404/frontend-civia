import styles from './CaseProvenanceNote.module.scss';

const reasons: Record<string, string> = {
  comment_linked_to_other_case: 'El comentario candidato ya está vinculado a otro caso. Hace falta revisar una posible duplicidad; no se fusionaron registros.',
  author_mismatch_or_missing: 'El autor registrado no coincide con la captura o no está disponible. No se atribuyó el comentario por suposición.',
  text_not_in_capture: 'El texto registrado no coincide exactamente con un comentario de la publicación capturada.',
  timestamp_mismatch_or_missing: 'No coincide la fecha registrada o falta ese dato en la captura.',
  ambiguous_exact_match: 'Hay más de un comentario con la misma evidencia. No se eligió uno automáticamente.',
  multiple_cases_for_same_comment: 'Varios casos coinciden con el mismo comentario. Hace falta revisar la duplicidad.',
};

export function CaseProvenanceNote({ status, reason }: { status?: string | null; reason?: string | null }) {
  if (!status) return null;
  const recovered = status === 'recovered_local';
  return <div className={`${styles.note} ${recovered ? styles.recovered : styles.warning}`}>
    <strong>{recovered ? 'Origen recuperado de la captura local' : 'Origen pendiente de verificación'}</strong>
    <p>{recovered ? 'Coincidencia exacta de publicación, texto, autor registrado y fecha. No equivale a una verificación actual de Meta ni de la identidad de la persona.' : reasons[reason || ''] || 'La evidencia disponible no permite recuperar el identificador del comentario con seguridad. Este registro requiere revisión.'}</p>
  </div>;
}
