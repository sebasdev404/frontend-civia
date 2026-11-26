'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CaseWorkspace } from '@/components/cases/CaseWorkspace';

export default function CaseDetailPage() {
  return <Suspense fallback={<p role="status">Cargando expediente…</p>}><CaseDetailContent /></Suspense>;
}
function CaseDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const candidate = searchParams.get('returnTo');
  const backHref = candidate?.startsWith('/cases?') ? candidate : '/cases?view=cases';
  return <CaseWorkspace key={id} id={id} backHref={backHref} />;
}
