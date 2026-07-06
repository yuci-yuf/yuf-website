import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allowed <Image quality> values (Next 16 requires these be declared).
    // 75 is the default; 90 is used for the sharp hero diamond tiles.
    qualities: [75, 90],
    // CMS-managed event/gallery images are served from Cloudinary.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Category event photos sourced from Unsplash.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
