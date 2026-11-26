import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:NextRequest,{params}:{params:Promise<{path:string[]}>}) {
  const {path}=await params;
  const staticImage=path.length===3&&path[0]==='static'&&['covers','thumbnails'].includes(path[1])&&/^[A-Za-z0-9_-]+\.jpg$/.test(path[2]);
  const metaImage=path.length===5&&path.slice(0,3).join('/')==='api/v1/meta'&&['post-thumbnail','post-image'].includes(path[3])&&/^[A-Za-z0-9_-]+$/.test(path[4]);
  if(!staticImage&&!metaImage)return new NextResponse(null,{status:404});
  const base=process.env.CIVIA_BACKEND_API_URL||process.env.NEXT_PUBLIC_API_URL||'http://127.0.0.1:8000/api/v1';
  const target=new URL(base);target.pathname=target.pathname.replace(/\/api\/v1\/?$/,'')+'/'+path.map(encodeURIComponent).join('/');target.search='';
  try {
    const upstream=await fetch(target,{redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!upstream.ok)return new NextResponse(null,{status:upstream.status===404?404:502});
    const type=upstream.headers.get('content-type')?.split(';')[0];
    if(!type||!['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(type))return new NextResponse(null,{status:502});
    return new NextResponse(upstream.body,{headers:{'Content-Type':upstream.headers.get('content-type')!,'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
  } catch{return new NextResponse(null,{status:502});}
}
