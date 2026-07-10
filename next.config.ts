import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Passenger (cPanel Node.js Manager) runs a single long-lived Node process and
  // imports an entry file — it does not run `next start`. We keep the standard
  // `.next` build (NOT `output: "standalone"`) and boot it from `server.js`,
  // because standalone copies a pruned node_modules that omits packages only
  // referenced at runtime and complicates Passenger's module resolution.
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
