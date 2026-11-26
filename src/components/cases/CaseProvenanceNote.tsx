import Link from 'next/link';
import type { CaseConflictReview } from '@/lib/api/client';
import styles from './CaseProvenanceNote.module.scss';

const reasons: Record<string, string> = {
  comment_linked_to_other_case: 'El comentario candidato ya está vinculado a otro caso. Hace falta revisar una posible duplicidad; no se fusionaron registros.',
  author_mismatch_or_missing: 'El autor registrado no coincide con la captura o no está disponible. No se atribuyó el comentario por suposición.',
  text_not_in_capture: 'El texto registrado no coincide exactamente con un comentario de la publicación capturada.',
  timestamp_mismatch_or_missing: 'No coincide la fecha registrada o falta ese dato en la captura.',
  ambiguous_exact_match: 'Hay más de un comentario con la misma evidencia. No se eligió uno automáticamente.',
  multiple_cases_for_same_comment: 'Varios casos coinciden con el mismo comentario. Hace falta revisar la duplicidad.',
};

export const fieldLabels: Record<string, string> = {
  content: 'texto', author: 'autor', date_time: 'fecha', source: 'fuente', title: 'título',
  category: 'categoría', sentiment: 'emoción clasificada', priority: 'prioridad', status: 'estado',
  location: 'ubicación', zone: 'zona', assigned_department: 'dependencia', assigned_to: 'responsable',
  public_response: 'borrador de respuesta', resolution_note: 'solución', resolved_by: 'responsable del cierre',
  institutional_radicado: 'radicado', priority_action: 'prioridad especial', requires_followup: 'seguimiento',
  comments_count: 'cantidad de comentarios', impact_if_solved: 'impacto registrado al resolver',
  impact_if_ignored: 'impacto registrado al ignorar', media_type: 'tipo de contenido', image_url: 'imagen',
};

export function CaseProvenanceNote({ status, reason, conflict, duplicateOf }: {
  status?: string | null; reason?: string | null; conflict?: CaseConflictReview | null; duplicateOf?: string | null;
}) {
  if (!status && !duplicateOf) return null;
  const recovered = status === 'recovered_local';
  const consolidated = status === 'consolidated';
  return <div className={`${styles.note} ${recovered ? styles.recovered : styles.warning}`}>
    {duplicateOf && <p><strong>Duplicado conservado.</strong> Atención en <Link href={`/cases/${encodeURIComponent(duplicateOf)}`}>{duplicateOf}</Link>.</p>}
    {status && <strong>{consolidated ? 'Duplicidad revisada: expedientes vinculados' : recovered ? 'Origen recuperado de la captura local' : 'Origen pendiente de verificación'}</strong>}
    {status && <p>{consolidated ? 'La decisión está registrada en el historial de consolidación. Se conserva la auditoría original; la relación no verifica la identidad ni la existencia de una solicitud por sí sola.' : recovered ? 'Coincidencia exacta de publicación, texto, autor registrado y fecha. No equivale a una verificación actual de Meta ni de la identidad de la persona.' : reasons[reason || ''] || 'La evidencia disponible no permite recuperar el identificador del comentario con seguridad. Este registro requiere revisión.'}</p>}
    {conflict && <details className={styles.comparison}>
      <summary>Ver comparación con el caso relacionado</summary>
      <p>{conflict.classification === 'insufficient_evidence'
        ? 'La evidencia no alcanza para confirmar el origen compartido.'
        : consolidated ? 'La comparación histórica se conserva como evidencia de la decisión registrada.' : 'La captura local coincide en publicación, comentario, texto, autor registrado y fecha. Aún falta decidir cómo conservar la información de ambos expedientes.'}</p>
      {conflict.attention_case_ids.length > 0 && <p><strong>Al revisar se encontró seguimiento en: {conflict.attention_case_ids.join(', ')}. Debe conservarse antes de cualquier consolidación.</strong></p>}
      {conflict.related_case_ids.map(id => <div key={id}>
        <Link href={`/cases/${encodeURIComponent(id)}`}>Abrir caso relacionado {id} ↗</Link>
        {!!conflict.differences[id]?.length && <p>Campos diferentes: {conflict.differences[id].map(field => fieldLabels[field] || field).join(', ')}.</p>}
      </div>)}
      <p>Comparación guardada: {conflict.checked_at}. Refleja ese momento; revisa también las bitácoras y los cambios posteriores. No se fusionaron ni eliminaron casos.</p>
    </details>}
  </div>;
}
