import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SocialIcon } from "./SocialIcon";

export function Footer() {
  return (
    <footer className="bg-hero-gradient relative mt-auto overflow-hidden text-white">
      {/* Festival glows for depth (match the gradient sections) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-festival-purple/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-festival-cyan/25 blur-3xl"
      />
      {/* Dark scrim so white text stays legible over the lighter teal band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-primary-950/35"
      />

      <Container className="relative pb-8 pt-14 lg:pb-10 lg:pt-16">
        {/* Link columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
          {/* Brand + blurb + socials */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg">
                <Image
                  src={siteConfig.logo}
                  alt={siteConfig.siteName}
                  width={44}
                  height={44}
                  className="h-full w-auto object-contain"
                />
              </span>
              <span className="font-heading text-lg font-bold leading-tight text-white">
                Youth United Festival
                <span className="block text-xs font-medium text-white/75">
                  Youth United Council of India
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/85">
              {siteConfig.footerBlurb}
            </p>
            <div className="flex gap-2.5">
              {siteConfig.socialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-200 hover:border-white/40 hover:bg-white/20"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Quick Links" links={siteConfig.quickLinks} />
          <FooterCol title="Useful Links" links={siteConfig.usefulLinks} />

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.18em] text-highlight-400">
              Contact Info
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm text-white/90">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-highlight-400" />
                <span className="leading-relaxed">
                  {siteConfig.contact.address}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-highlight-400" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="break-all transition-colors hover:text-white"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Copyright bar */}
      <div className="relative border-t border-white/15">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/80 sm:flex-row">
          <p>{siteConfig.copyrightText}</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; path: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[13px] font-bold uppercase tracking-[0.18em] text-highlight-400">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.path}
              className="text-white/90 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
