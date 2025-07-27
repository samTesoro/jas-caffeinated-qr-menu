/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'keyhmmvzbukozvvyntil.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/thumbnails/**',
      },
    ],
  },
};

module.exports = nextConfig;
