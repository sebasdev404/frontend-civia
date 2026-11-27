export interface AnalyticsOverview {
  generated_at: string;
  data_updated_at: string | null;
  scope: string;
  cases: {
    stored: number; total: number; duplicates_excluded: number; open: number; pending: number;
    in_progress: number; resolved: number; no_request: number; critical_open: number;
    priority_open: number; source_needs_review: number;
    statuses: Record<string, number>; priorities: Record<string, number>;
    categories: Record<string, number>; emotions: Record<string, number>;
    channels: Record<string, number>; departments: Record<string, number>;
  };
  capture: {
    posts: number; captured_comments: number; reported_comments: number; reported_unknown_posts: number;
    posts_without_capture: number; unreadable_captures: number;
    channels: { source: string; posts: number; captured_comments: number; reported_comments: number; reported_unknown_posts: number }[];
    top_terms: { term: string; count: number }[];
  };
  contextual: {
    source: string; captured_text_comments: number; analyzed: number; pending: number; review: number;
    usable: number; stances: Record<string, number>;
  };
  territorial: {
    stored: number; traceable_rows: number; captured_mentions: number; excluded_rows: number;
    exact_coordinates_verified: number; locations: { location: string; mentions: number }[];
  };
  response_time: { average_hours: number | null; reason: string };
}

export function metric(value: number | null | undefined) {
  return value == null ? '—' : value.toLocaleString('es-CO');
}

export function rankedCounts(values: Record<string, number>) {
  return Object.entries(values).sort(([labelA, countA], [labelB, countB]) =>
    countB - countA || labelA.localeCompare(labelB, 'es-CO'));
}

export function snapshotDate(value: string | null | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Sin fecha registrada';
  return new Date(value).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });
}
