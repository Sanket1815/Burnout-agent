// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Stub out Node modules that Supabase’s realtime-js drags in
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        "utf-8-validate": false,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
      // Silence those critical-dependency warnings if you like:
      config.module.exprContextCritical = false;
    }
    return config;
  },
};

module.exports = nextConfig;
