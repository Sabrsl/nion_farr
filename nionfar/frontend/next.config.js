/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Définir le mode de rendu sur "standalone" pour que tout soit généré à la demande
  output: 'standalone',

  // Désactiver l'optimisation statique
  images: {
    domains: [
      'res.cloudinary.com',
      'loremflickr.com', 
      'images.unsplash.com',
      'plus.unsplash.com',
      'avatars.githubusercontent.com'
    ],
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
  
  // Forcer l'utilisation du runtime React
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: []
  }
}

module.exports = nextConfig 