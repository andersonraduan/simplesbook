const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para produção standalone
  // Comentado para reduzir uso de memória no build
  // output: 'standalone',

  // Otimizações de build
  compress: true,

  // Reduzir uso de recursos para hospedagem compartilhada
  // Isso evita erro EAGAIN em servidores com recursos limitados
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  // DESABILITAR TURBOPACK COMPLETAMENTE
  // Turbopack não funciona bem com symlinks em hospedagens compartilhadas
  // Forçar uso do Webpack tradicional
  webpack: (config, { dev, isServer }) => {
    // Configuração webpack para resolver alias @
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    }

    return config
  },


  // Configuração de imagens
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ]
  },
};

module.exports = nextConfig;

