import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // CMS-managed event/gallery images are served from Cloudinary.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
