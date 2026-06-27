import type { Metadata } from "next";
import { Poppins, Roboto_Slab } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://youthunitedfestival.org"),
  title: {
    default:
      "Youth United Festival 2026 — Celebrating Youth Talent, Innovation & Unity",
    template: "%s — Youth United Festival",
  },
  description:
    "Youth United Festival (YUF) — organized by Youth United Council of India. A platform celebrating youth talent, innovation, sports, arts, and unity across India.",
  keywords: [
    "Youth United Festival",
    "YUF",
    "YUCI",
    "Youth Talent",
    "Indian Youth Parliament",
    "India's Young Scientist",
    "Youth Events India",
  ],
  openGraph: {
    title: "Youth United Festival",
    description:
      "Celebrating Youth Talent, Innovation, and Unity — Register for YUF.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${robotoSlab.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text">
        {children}
      </body>
    </html>
  );
}
