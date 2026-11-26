import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Keep local development from deleting the verified production build.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  poweredByHeader: false,
  async headers() { return [{source:'/:path*',headers:[
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(self)'},
    {key:'Content-Security-Policy',value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"},
  ]}]; },
};

export default nextConfig;

