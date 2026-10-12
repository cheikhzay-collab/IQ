/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow server-side packages
  serverExternalPackages: ['better-sqlite3'],
  
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
