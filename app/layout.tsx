import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

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
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${jakartaSans.variable} ${bricolage.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-surface text-text">
        {children}
      </body>
    </html>
  );
}
