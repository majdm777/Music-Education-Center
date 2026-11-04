import path from 'node:path';
import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  // The monorepo root, so tracing does not pick a stray lockfile in $HOME.
  outputFileTracingRoot: path.join(__dirname, '../..'),
  eslint: {
    // Lint runs once at the workspace root; avoid Next's duplicate lint pass.
    ignoreDuringBuilds: true,
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
