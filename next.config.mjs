const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    // PRODUCTION-READY: Always use environment variable first
    // Falls back to localhost only for true local development
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8003';
    
    console.log('🔧 API Proxy Configuration:');
    console.log('  Backend URL:', backendUrl);
    console.log('  Environment:', process.env.NODE_ENV);
    console.log('  Using env var:', Boolean(process.env.NEXT_PUBLIC_BACKEND_URL));
    
    return [
      // Auth routes - proxy to backend
      {
        source: '/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
      // API routes - proxy to backend
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
