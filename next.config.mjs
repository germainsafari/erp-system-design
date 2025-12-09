/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exclude Prisma from client bundles (works for both webpack and turbopack)
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  webpack: (config, { isServer }) => {
    // Exclude Prisma from client bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
      config.externals = config.externals || []
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
        '.prisma/client': 'commonjs .prisma/client',
      })
    }
    return config
  },
  // Turbopack configuration
  turbopack: {},
}

export default nextConfig
