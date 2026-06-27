import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SocialIcon } from "./SocialIcon";

export function Footer() {
  return (
    <footer className="mt-auto bg-primary-950 text-primary-100">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand + blurb */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.siteName}
                width={48}
                height={48}
                className="h-11 w-auto rounded bg-white/95 p-1 object-contain"
              />
              <span className="font-heading text-lg font-bold text-white">
                {siteConfig.siteName}
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-primary-200">
              {siteConfig.footerBlurb}
            </p>
            <div className="flex gap-3">
              {siteConfig.socialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  aria-label={s.platform}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-accent-500"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <FooterLinks title="Quick Links" links={siteConfig.quickLinks} />

          {/* Useful links */}
          <FooterLinks title="Useful Links" links={siteConfig.usefulLinks} />

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-base font-bold text-white">Contact</h3>
            <ul className="flex flex-col gap-4 text-sm text-primary-200">
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-accent-400" />
                <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-white">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-accent-400" />
                <a href={`mailto:${siteConfig.contact.email}`} className="break-all hover:text-white">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent-400" />
                <span>{siteConfig.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-sm text-primary-300 sm:flex-row">
          <p>{siteConfig.copyrightText}</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Use</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: { label: string; path: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-base font-bold text-white">{title}</h3>
      <ul className="flex flex-col gap-3 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.path} className="text-primary-200 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
