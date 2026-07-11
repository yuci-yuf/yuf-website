import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/content";
import { jsonLdScript } from "@/lib/json-ld";

// Canonical origin for metadata, sitemap, and structured data. Update this if
// the production domain changes (also mirrored in app/sitemap.ts + robots.ts).
export const SITE_URL = "https://youthunitedfestival.com";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Expressive display face — used for the YUF entrance reveal.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const DESCRIPTION =
  "Youth United Festival (YUF) 2026 — organized by Youth United Council of India (YUCI). Empowering students across India through sports, arts, innovation, leadership, and cultural excellence. Register now for YUF 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Youth United Festival",
  title: {
    default:
      "Youth United Festival 2026 — Celebrating Youth Talent, Innovation & Unity",
    template: "%s — Youth United Festival",
  },
  description: DESCRIPTION,
  // Favicon/apple icons are provided by app/icon.png and app/apple-icon.png
  // (square, trimmed) — Next generates the correct <link> tags automatically.
  keywords: [
    "Youth United Festival",
    "Youth United Festival 2026",
    "YUF",
    "YUF 2026",
    "YUCI",
    "Youth United Council of India",
    "youth festival India",
    "student events India",
    "school and college fest",
    "youth talent competition",
    "sports and games festival",
    "arts and cultural festival",
    "Indian Youth Parliament",
    "India's Young Scientist",
    "youth leadership India",
    "register YUF 2026",
    "Chennai youth festival",
  ],
  authors: [{ name: "Youth United Council of India" }],
  creator: "Youth United Council of India",
  publisher: "Youth United Council of India",
  category: "Events",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Youth United Festival",
    title:
      "Youth United Festival 2026 — Celebrating Youth Talent, Innovation & Unity",
    description: DESCRIPTION,
    locale: "en_IN",
    images: [
      {
        url: "/images/hero/group-2025.jpg",
        width: 1200,
        height: 630,
        alt: "Youth United Festival participants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Youth United Festival 2026",
    description: DESCRIPTION,
    images: ["/images/hero/group-2025.jpg"],
  },
  // Add your Google Search Console token here to verify the property:
  // verification: { google: "<token>" },
};

// Organization + WebSite structured data (JSON-LD) — helps Google build a
// knowledge panel and understand the brand + social profiles.
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Youth United Council of India",
    alternateName: ["YUCI", "Youth United Festival", "YUF"],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    email: siteConfig.contact.email,
    description: DESCRIPTION,
    sameAs: siteConfig.socialLinks.map((s) => s.url),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Youth United Festival",
    url: SITE_URL,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${jakartaSans.variable} ${bricolage.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-surface text-text">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
