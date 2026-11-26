import { NextRequest, NextResponse } from 'next/server';
import {createHmac,timingSafeEqual} from 'node:crypto';

const COOKIE = 'civia_session';
const PUBLIC_AUTH = new Set(['/auth/login', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password']);
const ISSUES_SESSION = new Set(['/auth/login', '/auth/reset-password', '/auth/change-password']);
const LOGOUT = new Set(['/auth/logout', '/auth/logout-all']);
const MAX_BODY = 12 * 1024 * 1024;

function metadata(token: string | undefined): { session_id: string; expires_at: string } | null {
  try {
    if (!token) return null;
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    if (typeof payload.jti !== 'string' || typeof payload.exp !== 'number') return null;
    return { session_id: payload.jti, expires_at: new Date(payload.exp * 1000).toISOString() };
  } catch { return null; }
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', Vary: 'Cookie' } });
}

function setCookie(response: NextResponse, value: string, expires: string) {
  response.cookies.set(COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: new Date(expires) });
}

async function readBody(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) return undefined;
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const part = await reader.read(); if (part.done) break;
      length += part.value.length;
      if (length > MAX_BODY) { await reader.cancel(); throw new Error('BODY_LIMIT'); }
      chunks.push(part.value);
    }
    return Buffer.concat(chunks);
  } finally { reader.releaseLock(); }
}

export async function proxyApi(request: NextRequest, segments: string[]) {
  if (!segments.length || segments.some(part => !part || part === '.' || part === '..' || /[\/\\%?#\x00-\x1f]/.test(part))) return json({ detail: 'Ruta no válida.' }, 400);
  const endpoint = '/' + segments.join('/');
  const mutates = !['GET', 'HEAD'].includes(request.method);
  // Behind TLS termination nextUrl may contain the internal HTTP origin.
  // Use an operator-configured public origin, never arbitrary forwarded headers.
  const publicOrigin = process.env.CIVIA_PUBLIC_ORIGIN || request.nextUrl.origin;
  if (mutates && request.headers.get('origin') !== publicOrigin) return json({ detail: 'Solicitud de otro origen rechazada.' }, 403);
  const isPublic = request.method === 'POST' && PUBLIC_AUTH.has(endpoint);
  const token = request.cookies.get(COOKIE)?.value;
  const session = metadata(token);
  if (!isPublic && !token) {
    if (LOGOUT.has(endpoint)) return json({ message: 'Sesión cerrada.' }, 200);
    return json({ detail: 'Inicia sesión para continuar.', code: 'NO_SESSION' }, 401);
  }
  const expected = request.headers.get('x-civia-session');
  if (!isPublic && expected && expected !== session?.session_id) return json({ detail: 'La sesión cambió. Actualiza antes de continuar.', code: 'SESSION_CHANGED' }, 409);
  if (mutates && !isPublic && !LOGOUT.has(endpoint) && !expected) return json({ detail: 'Actualiza tu sesión antes de guardar.', code: 'SESSION_CHANGED' }, 409);

  try {
    const base = new URL(process.env.CIVIA_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1');
    if (!['http:', 'https:'].includes(base.protocol)) return json({ detail: 'Conexión de servidor no configurada.' }, 503);
    base.pathname = base.pathname.replace(/\/$/, '') + '/' + segments.map(encodeURIComponent).join('/');
    base.search = request.nextUrl.search;
    const headers = new Headers();
    const proxySecret=process.env.CIVIA_PROXY_SECRET;
    const gateway=request.headers.get('x-civia-gateway');
    const address=request.headers.get('x-civia-client-ip');
    if(proxySecret&&gateway&&address&&Buffer.byteLength(proxySecret)===Buffer.byteLength(gateway)&&timingSafeEqual(Buffer.from(proxySecret),Buffer.from(gateway))) {
      const identity=createHmac('sha256',proxySecret).update('client:'+address).digest('hex');
      const timestamp=String(Math.floor(Date.now()/1000));
      headers.set('X-Civia-Client',identity);headers.set('X-Civia-Client-Time',timestamp);
      headers.set('X-Civia-Client-Signature',createHmac('sha256',proxySecret).update(`${request.method}\n${endpoint}\n${timestamp}\n${identity}`).digest('hex'));
    }
    if (!isPublic && token) headers.set('Authorization', `Bearer ${token}`);
    if (request.headers.has('content-type')) headers.set('Content-Type', request.headers.get('content-type')!);
    const upstream = await fetch(base, { method: request.method, headers, body: mutates ? await readBody(request) : undefined, cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(60000) });
    if (upstream.status >= 300 && upstream.status < 400) return json({ detail: 'La ruta del servidor requiere revisión.' }, 502);
    if (upstream.status === 401 && !isPublic) {
      if (LOGOUT.has(endpoint)) { const response = json({ message: 'La sesión ya no estaba vigente.' }, 200); setCookie(response, '', new Date(0).toISOString()); return response; }
      return json({ detail: 'La sesión terminó. Inicia sesión de nuevo.', code: 'SESSION_ENDED', session_id: session?.session_id }, 401);
    }
    if (upstream.ok && request.method === 'POST' && ISSUES_SESSION.has(endpoint)) {
      const result = await upstream.json();
      const info = metadata(result.access_token);
      if (!info || !result.user) return json({ detail: 'El servidor no pudo abrir una sesión válida.' }, 502);
      const response = json({ user: result.user, ...info, ...(result.message ? { message: result.message } : {}) }, 200);
      setCookie(response, result.access_token, info.expires_at);
      response.cookies.set('civia_token', '', { httpOnly: true, path: '/', maxAge: 0 });
      return response;
    }
    if (upstream.ok && endpoint === '/auth/me') {
      if (!session) return json({ detail: 'Sesión no disponible.', code: 'SESSION_ENDED' }, 401);
      return json({ user: await upstream.json(), ...session }, 200);
    }
    const responseHeaders = new Headers({ 'Cache-Control': 'no-store', Vary: 'Cookie' });
    for (const name of ['content-type', 'content-disposition', 'retry-after']) if (upstream.headers.has(name)) responseHeaders.set(name, upstream.headers.get(name)!);
    const response = new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
    if (upstream.ok && LOGOUT.has(endpoint)) setCookie(response, '', new Date(0).toISOString());
    return response;
  } catch (error) {
    return json({ detail: error instanceof Error && error.message === 'BODY_LIMIT' ? 'Archivo demasiado grande.' : 'No se pudo contactar al servidor. Reintenta en un momento.' }, error instanceof Error && error.message === 'BODY_LIMIT' ? 413 : 503);
  }
}
