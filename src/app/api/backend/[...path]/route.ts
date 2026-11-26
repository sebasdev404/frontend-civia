import { type NextRequest } from 'next/server';
import { proxyApi } from '@/lib/server-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyApi(request, (await context.params).path);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD };
