import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ui-kit',
  images: { unoptimized: true },
  transpilePackages: ['@annondeveloper/ui-kit'],
}

export default nextConfig
