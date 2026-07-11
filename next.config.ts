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
  // Baseline security headers applied to every response. These are the
  // low-risk, no-config headers that don't depend on the page's resources.
  // A full Content-Security-Policy is intentionally NOT set here yet: the site
  // loads third-party scripts (Razorpay Checkout), talks to Firebase/Firestore,
  // and self-hosts fonts, so a CSP needs per-source allow-listing and live
  // testing before it can be enabled without breaking checkout or the admin
  // panel. Track that as a follow-up.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stop browsers from MIME-sniffing a response into a different type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Clickjacking protection — the site is never meant to be framed.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Don't leak full URLs (which may carry the ?loc/registration params)
          // to third-party origins.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Force HTTPS for two years (incl. subdomains) once seen over TLS.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Deny sensor/geolocation access; allow camera to self so the admin
          // check-in QR scanner keeps working.
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
  // Legacy URLs from the old WordPress site that Google still has indexed.
  // Permanent (308) so search engines transfer ranking to the new path.
  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
