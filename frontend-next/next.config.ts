import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    qualities: [100, 75],
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
