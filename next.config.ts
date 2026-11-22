import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep the prototype out of search engines (CLAUDE.md §14), on top of the noindex meta and robots.txt.
  async redirects() {
    return [
      { source: '/about', destination: '/notes/flex', permanent: false },
      { source: '/notes', destination: '/notes/flex', permanent: false },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default nextConfig;
