/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Définir le mode de rendu sur "standalone" pour que tout soit généré à la demande
  output: 'standalone',
  
  // Configuration des images
  images: {
    domains: ['nion-farr.vercel.app', 'nion-farr-backend.vercel.app', 'localhost', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Désactive l'optimisation d'images qui utilise Edge Runtime
  },
  
  // Configuration de production
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Activation de la compression
  compress: true,
  
  // Configuration du compilateur
  compiler: {
    // Suppression des console.log en production
    removeConsole: false, // Désactivé pour déboguer les problèmes d'API
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
    // Désactiver la vérification TypeScript en production pour accélérer le build
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    // Désactiver ESLint en production pour accélérer le build
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // Passer les erreurs de redirection de slash
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Configuration du proxy API pour les requêtes backend
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://nion-farr.vercel.app',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://nion-farr-backend.vercel.app/api',
  },

  // Forcer l'utilisation du runtime React et désactiver Edge Runtime
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['mongoose'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Désactiver les fonctionnalités Edge Runtime problématiques
    disableOptimizedLoading: true,
    externalDir: true,
    // Désactiver complètement les OG Images et Edge Runtime
    images: {
      disableStaticImages: false,
      unoptimized: true
    },
    // Désactiver le Edge Runtime complètement
    runtime: 'nodejs'
  },

  // Désactiver explicitement l'Edge Runtime
  serverRuntimeConfig: {
    // Utilise le runtime Node.js au lieu de Edge
    runtime: 'nodejs',
  },

  // Désactiver certains avertissements React
  modularizeImports: {
    'util/': {
      transform: 'util/{{member}}',
    },
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
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGINS || 'https://nion-farr.vercel.app,https://nion-farr-backend.vercel.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },

  async rewrites() {
    // En production, utiliser toujours l'URL de production Vercel
    const isProduction = process.env.NODE_ENV === 'production';
    const productionApiUrl = 'https://nion-farr-backend.vercel.app/api';
    // Forcer l'URL de production en production
    const apiUrl = isProduction ? productionApiUrl : (process.env.NEXT_PUBLIC_API_URL || productionApiUrl);
    
    // Configuration des redirections API vers Vercel
    console.log(`[Next.js Config] Configuration des redirections API vers: ${productionApiUrl}`);
    console.log(`[Next.js Config] Environnement: ${process.env.NODE_ENV}`);
    
    return [
      // Requêtes générales vers l'API
      {
        source: '/api/:path*',
        destination: `${productionApiUrl}/:path*`,
      },
      // Routes d'authentification
      {
        source: '/api/auth/login',
        destination: `${productionApiUrl}/auth/login`,
      },
      {
        source: '/api/auth/register',
        destination: `${productionApiUrl}/auth/register`,
      },
      {
        source: '/api/auth/logout',
        destination: `${productionApiUrl}/auth/logout`,
      },
      {
        source: '/api/auth/me',
        destination: `${productionApiUrl}/auth/me`,
      },
      {
        source: '/api/v1/auth/login',
        destination: `${productionApiUrl}/auth/login`,
      },
      // Routes utilisateur
      {
        source: '/api/user/profile',
        destination: `${productionApiUrl}/user/profile`,
      },
      // Routes des services freelance
      {
        source: '/api/services',
        destination: `${productionApiUrl}/services`,
      },
      {
        source: '/api/services/:id',
        destination: `${productionApiUrl}/services/:id`,
      },
      // Routes des commandes
      {
        source: '/api/orders',
        destination: `${productionApiUrl}/orders`,
      },
      {
        source: '/api/orders/:id',
        destination: `${productionApiUrl}/orders/:id`,
      },
      // Routes des litiges
      {
        source: '/api/disputes',
        destination: `${productionApiUrl}/disputes`,
      },
      {
        source: '/api/disputes/:id',
        destination: `${productionApiUrl}/disputes/:id`,
      },
      // Route pour les tokens CSRF
      {
        source: '/api/security/csrf-tokens',
        destination: `${productionApiUrl}/security/csrf-tokens`,
      },
      // Route pour le statut
      {
        source: '/api/status',
        destination: `${productionApiUrl}/status`,
      },
      // Route pour le healthcheck
      {
        source: '/api/health',
        destination: `${productionApiUrl}/health`,
      },
    ];
  },
  
  // Redirections pour les routes d'authentification
  async redirects() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
        permanent: true,
      },
    ];
  },

  // Variables publiques pour le CSP
  publicRuntimeConfig: {
    cors: {
      value: process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGINS || 'https://nion-farr.vercel.app,https://nion-farr-backend.vercel.app',
      key: 'CORS_ALLOWED_ORIGINS',
    },
  },
}

// Configuration des proxies pour le développement
const setupDevProxies = () => {
  // Si les urls locales ne sont pas définies, utiliser les URLs de production
  const productionApiUrl = 'https://nion-farr-backend.vercel.app/api';
  // ... existing code ...
};

// Afficher la configuration dans les logs
console.log(`[Next.js Config] URL de l'API configurée: ${process.env.NEXT_PUBLIC_API_URL || 'https://nion-farr-backend.vercel.app/api'}`);

module.exports = nextConfig 