import path from 'node:path';
import { loadWebEnv } from '@mec/shared';
import type { NextConfig } from 'next';

const env = loadWebEnv(process.env);
const apiUrl = env.API_URL.replace(/\/+$/, '');

// Baseline CSP. Next's bootstrap scripts and styled-jsx need inline styles and
// scripts without a nonce; a nonce-based policy is a later hardening step. Dev
// also needs eval for React Fast Refresh, and must not upgrade localhost to
// HTTPS. The API is reached through the same-origin /api rewrite.
const isProduction = env.NODE_ENV === 'production';
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  isProduction
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self'",
  ...(isProduction ? ['upgrade-insecure-requests'] : []),
].join('; ');

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
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
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
