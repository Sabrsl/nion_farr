/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Allow unoptimized images temporarily
    domains: ['images.unsplash.com', 'placehold.co', 'placeimg.com', 'randomuser.me', 'localhost'],
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
    ],
  },
  // Ajoutez d'autres configurations selon les besoins
}

module.exports = nextConfig 