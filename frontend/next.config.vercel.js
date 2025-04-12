/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuration simplifiée pour Vercel
  output: 'standalone',
  
  // Configuration des images
  images: {
    domains: ['nion-farr.vercel.app', 'nion-farr-backend.vercel.app', 'localhost', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Configuration de production
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  
  // Configuration du compilateur
  compiler: {
    removeConsole: false,
    reactRemoveProperties: true,
    styledComponents: true,
  },
  
  // Utilisation de SWC pour la minification (plus rapide)
  swcMinify: true,
  
  // Désactivation complète des tests
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Variables d'environnement codées en dur
  env: {
    NEXT_PUBLIC_ENVIRONMENT: 'production',
    NEXT_PUBLIC_APP_URL: 'https://nion-farr.vercel.app',
    NEXT_PUBLIC_API_URL: 'https://nion-farr-backend.vercel.app/api',
  },

  // Headers HTTP
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Access-Control-Allow-Origin', value: 'https://nion-farr.vercel.app,https://nion-farr-backend.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },

  // Configuration des redirections avec URLs codées en dur
  async rewrites() {
    const apiUrl = 'https://nion-farr-backend.vercel.app/api';
    
    console.log(`[Next.js Config] Configuration des redirections API vers: ${apiUrl}`);
    console.log(`[Next.js Config] Environnement: production`);
    
    return [
      // Requêtes générales vers l'API
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      // Routes d'authentification
      {
        source: '/api/auth/:path*',
        destination: `${apiUrl}/auth/:path*`,
      },
      // Routes utilisateur
      {
        source: '/api/user/:path*',
        destination: `${apiUrl}/user/:path*`,
      },
      // Routes des services freelance
      {
        source: '/api/services/:path*',
        destination: `${apiUrl}/services/:path*`,
      },
      // Routes des commandes
      {
        source: '/api/orders/:path*',
        destination: `${apiUrl}/orders/:path*`,
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
}

console.log(`[Next.js Config] URL de l'API configurée: https://nion-farr-backend.vercel.app/api`);

module.exports = nextConfig; 