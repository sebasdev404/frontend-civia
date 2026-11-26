"use client";
import { useEffect, useRef, useState } from 'react';
import { API, type MetaSyncJob } from '@/lib/api/client';

export function useSyncJob(scope: string, ready: boolean) {
  const [job, setJob] = useState<MetaSyncJob | null>(null);
  const [completion, setCompletion] = useState(0);
  const [error, setError] = useState('');
  const epoch = useRef(0);
  const active = job?.status === 'queued' || job?.status === 'running';
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset transient controls when the external route, permission or capture scope changes.
    setJob(null); setError('');
    if (!ready) return;
    const controller = new AbortController();
    const sequence = ++epoch.current;
    API.meta.getSyncStatus(scope, controller.signal).then(value => { if (epoch.current === sequence) setJob(value); })
      .catch(e => { if (e.name !== 'AbortError') setError('No se pudo consultar el estado de actualización.'); });
    return () => controller.abort();
  }, [scope, ready]);
  useEffect(() => {
    if (!job?.id || !active || job.scope !== scope) return;
    const id = job.id;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const next = await API.meta.getSyncJob(id, controller.signal);
        if (controller.signal.aborted) return;
        setJob(next); setError('');
        if (next.status === 'queued' || next.status === 'running') timer = setTimeout(poll, 1500);
        else setCompletion(value => value + 1);
      } catch (e) {
        if (!controller.signal.aborted) { setError('La captura puede seguir en curso; no pudimos consultar su avance.'); timer = setTimeout(poll, 3000); }
      }
    }
    poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [job?.id, job?.scope, active, scope]);
  return { job, active, completion, error, track: (value: MetaSyncJob) => { ++epoch.current; setJob(value); setError(''); } };
}
