import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  compress: true,
  poweredByHeader: false,
  redirects: async () => [
    {
      source: "/auth",
      destination: "/login",
      permanent: true,
    },
  ],
};

export default nextConfig;
