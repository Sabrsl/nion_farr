/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Définir le mode de rendu sur "standalone" pour que tout soit généré à la demande
  output: undefined,

  // Désactiver l'optimisation statique
  images: {
    domains: ['cdn.nionfar.sn', 'api.nionfar.sn'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  
  // Configuration de production
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Activation de la compression
  compress: true,
  
  // Configuration du compilateur
  compiler: {
    // Suppression des console.log en production tout en gardant les erreurs et warnings
    removeConsole: {
      exclude: ['error', 'warn'],
    },
    // Configuration explicite du JSX runtime
    reactRemoveProperties: true,
    styledComponents: true,
  },
  
  // Utilisation de SWC pour la minification (plus rapide)
  swcMinify: true,
  
  // Configuration du cache
  onDemandEntries: {
    // période (en ms) où les pages compilées sont gardées en mémoire
    maxInactiveAge: 25 * 1000,
    // nombre de pages à garder en mémoire
    pagesBufferLength: 2,
  },

  // Désactivation complète des tests
  typescript: {
    // ⚠️ Ignorer les erreurs TS pendant le build
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Ignorer les erreurs ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  
  // Passer les erreurs de redirection de slash
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Configuration du proxy API pour les requêtes backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },

  // Forcer l'utilisation du runtime React
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: []
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 