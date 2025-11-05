/** @type {import('next').NextConfig} */
const nextConfig = (() => {
  // Allow images from production Supabase storage
  const remotePatterns = [
    {
      protocol: 'https',
      hostname: 'keyhmmvzbukozvvyntil.supabase.co',
      port: '',
      pathname: '/storage/v1/object/public/**',
    },
    // Common local pattern when running Supabase locally
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '54321',
      pathname: '/storage/v1/object/public/**',
    },
  ];

  // If NEXT_PUBLIC_SUPABASE_URL is set (e.g., http://10.x.x.x:54321), allow that host too
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (SUPABASE_URL) {
    try {
      const u = new URL(SUPABASE_URL);
      remotePatterns.push({
        protocol: u.protocol.replace(':', ''),
        hostname: u.hostname,
        port: u.port || '',
        pathname: '/storage/v1/object/public/**',
      });
    } catch {
      // ignore parse errors
    }
  }

  return {
    images: {
      remotePatterns,
    },
  };
})();

module.exports = nextConfig;
