import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@stellar-learn/ui',
    '@stellar-learn/game-engine',
    '@stellar-learn/stellar',
    '@stellar-learn/content',
  ],
  experimental: {
    // Enable server actions
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  webpack: (config) => {
    // Phaser requires canvas — exclude from SSR
    config.externals = config.externals ?? []
    if (Array.isArray(config.externals)) {
      config.externals.push({ canvas: 'canvas' })
    }
    return config
  },
}

export default nextConfig
