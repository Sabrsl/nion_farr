/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration des images
  images: {
    unoptimized: false, // Optimize images for production
    domains: ['images.unsplash.com', 'placehold.co', 'placeimg.com', 'randomuser.me', 'nionfar.sn', 'api.nionfar.sn'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nionfar.sn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.nionfar.sn',
        pathname: '/**',
      },
    ],
  },
  // Configuration pour la production
  productionBrowserSourceMaps: false, // Désactiver les source maps en production pour réduire la taille
  poweredByHeader: false, // Supprimer l'en-tête X-Powered-By pour la sécurité
  compress: true, // Activer la compression
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'], // Supprimer les console.log mais conserver les error et warn
    },
  },
  // Optimisations supplémentaires
  swcMinify: true, // Utiliser SWC pour la minification (plus rapide que Terser)
  // Configuration pour la mise en cache
  onDemandEntries: {
    // Période (en ms) pendant laquelle les pages compilées sont conservées en mémoire
    maxInactiveAge: 60 * 1000,
    // Nombre de pages à conserver en mémoire
    pagesBufferLength: 5,
  }
}

module.exports = nextConfig 