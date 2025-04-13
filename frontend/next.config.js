/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuration optimisée pour Vercel
  output: 'standalone',
  
  // Configuration des images
  images: {
    domains: ['nion-farr.vercel.app', 'nion-farr-backend.vercel.app', 'nionfar-backend.onrender.com', 'localhost', 'res.cloudinary.com'],
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
    // Suppression des console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
    // Configuration explicite du JSX runtime
    reactRemoveProperties: true,
    styledComponents: true,
  },
  
  // Utilisation de SWC pour la minification (plus rapide)
  swcMinify: true,
  
  // Configuration du cache
  onDemandEntries: {
    // période (en ms) où les pages compilées sont gardées en mémoire
    maxInactiveAge: 15 * 1000, // Reduced from 25s to 15s to save memory
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
    NEXT_PUBLIC_API_URL: 'https://nionfar-backend.onrender.com/api',
    NEXT_PUBLIC_APP_URL: 'https://nion-farr.vercel.app',
    NEXT_PUBLIC_ENVIRONMENT: 'production',
  },

  // Options expérimentales simplifiées et supportées
  experimental: {
    // Support pour les modules ESM
    esmExternals: true,
    // Packages externes pour Server Components
    serverComponentsExternalPackages: ['mongoose'],
    // Actions serveur
    serverActions: true,
    // Désactiver l'optimisation du chargement (peut causer des problèmes)
    disableOptimizedLoading: true,
    // Inclure répertoires externes
    externalDir: true,
    // Exclure des fichiers du traçage des sorties
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        'node_modules/@swc/core-darwin-*',
        'node_modules/@swc/core-win32-*',
        'node_modules/@esbuild/win32-*',
        'node_modules/@esbuild/darwin-*',
      ],
    },
  },

  // Modulariser les imports
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
            value: process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGINS || 'https://nion-farr.vercel.app,https://nionfar-backend.onrender.com',
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
    return [
      {
        source: '/api/auth/register',
        has: [
          {
            type: 'header',
            key: 'x-http-method',
            value: '(.*)'
          }
        ],
        destination: 'https://nionfar-backend.onrender.com/api/auth/register'
      },
      {
        source: '/api/:path*',
        destination: 'https://nionfar-backend.onrender.com/api/:path*',
        basePath: false
      }
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
}

// Check if we're in a memory-constrained environment
if (process.env.MEMORY_OPTIMIZED === 'true') {
  // Reduce log output during build to save memory
  console.log = (function(originalConsoleLog) {
    return function() {
      // Only log errors, warnings and critical messages
      if (
        arguments[0] && 
        typeof arguments[0] === 'string' && 
        (arguments[0].includes('error') || arguments[0].includes('warn') || arguments[0].includes('critical'))
      ) {
        originalConsoleLog.apply(console, arguments);
      }
    };
  })(console.log);

  // Further reduce build-time memory usage
  nextConfig.webpack = (config, { isServer }) => {
    // Optimize webpack for lower memory usage
    config.optimization.minimize = true;
    
    if (!isServer) {
      // Smaller chunks for client builds
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 80000, // Smaller chunks
      };
    }
    
    return config;
  };
}

// Afficher la configuration dans les logs
console.log(`[Next.js Config] URL de l'API configurée: ${process.env.NEXT_PUBLIC_API_URL || 'https://nionfar-backend.onrender.com/api'}`);

module.exports = nextConfig 