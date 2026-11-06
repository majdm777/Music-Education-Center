import path from 'node:path';
import { loadWebEnv } from '@mec/shared';
import type { NextConfig } from 'next';

const env = loadWebEnv(process.env);
const apiUrl = env.API_URL.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The monorepo root, so tracing does not pick a stray lockfile in $HOME.
  outputFileTracingRoot: path.join(__dirname, '../..'),
  eslint: {
    // Lint runs once at the workspace root; avoid Next's duplicate lint pass.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
