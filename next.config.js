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
    pagesBufferLength: 2, // Reduced from 5 to save memory
  },
  // Optimisations pour Vercel avec des contraintes de mémoire
  experimental: {
    // Disable static generation concurrency to reduce memory usage
    disableStaticGenerationConcurrency: true,
    // Use smaller chunks 
    outputFileTracingIncludes: {},
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        // Exclude unnecessary platform-specific packages
        'node_modules/@swc/core-darwin-*',
        'node_modules/@swc/core-win32-*',
        'node_modules/@esbuild/win32-*',
        'node_modules/@esbuild/darwin-*',
      ],
    },
    // Désactiver l'Edge Runtime qui cause des erreurs
    runtime: 'nodejs',
    serverComponents: {
      useServerComponents: true
    },
    // Fix pour l'erreur de l'image-response.js
    images: {
      disableStaticImages: false,
      unoptimized: true,
      remotePatterns: [
        // ... existing remotePatterns ...
      ],
    },
  },
  webpack: (config, { isServer }) => {
    // Exclure image-response.js du bundle Edge
    if (isServer) {
      config.externals.push({
        'next/dist/server/web/spec-extension/image-response': 'next/dist/server/web/spec-extension/image-response',
      });
    }
    return config;
  },
}

// Check if we're in a memory-constrained environment
if (process.env.MEMORY_OPTIMIZED === 'true') {
  console.log('Running in memory-optimized mode');
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

module.exports = nextConfig 