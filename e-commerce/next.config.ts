import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Keep metadata in <head> for SEO crawlers and validators that do not process streamed head tags.
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3845",
        pathname: "/assets/**",
      },
      // LOCAL DEV ONLY: the local backend serves restored image files from /images.
      // This is not part of the client's task scope and must not be included in client delivery.
      {
        protocol: "http",
        hostname: "localhost",
        port: "16001",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
