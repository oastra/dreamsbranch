import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    nodeMiddleware: true,
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default withNextIntl(nextConfig);
