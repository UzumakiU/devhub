import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Exclude test files from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  webpack: (config, { isServer }) => {
    // Exclude test files from webpack compilation
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    });
    
    // Exclude jest setup files
    config.module.rules.push({
      test: /jest\.(setup|config)\.(js|ts)$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
};

export default nextConfig;
