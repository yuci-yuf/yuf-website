import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SocialIcon } from "./SocialIcon";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.siteName}
                width={44}
                height={44}
                className="h-11 w-auto rounded-xl object-contain"
              />
              <span className="font-heading text-base font-bold text-gray-900">
                Youth United
                <br />
                <span className="text-xs font-medium text-gray-400">
                  Council of India
                </span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              {siteConfig.footerBlurb.slice(0, 180)}...
            </p>
            <div className="flex gap-2.5">
              {siteConfig.socialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-200 hover:bg-primary-50 hover:text-primary-600"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <FooterCol title="Quick Links" links={siteConfig.quickLinks} />

          {/* Useful Links */}
          <FooterCol title="Useful Links" links={siteConfig.usefulLinks} />

          {/* Events (hardcoded subset) */}
          <FooterCol
            title="Events"
            links={[
              { label: "All Events", path: "/events" },
              { label: "Youth Parliament", path: "/events/youth-parliament" },
              { label: "Young Scientist", path: "/events/young-scientist" },
              { label: "Talent Icon", path: "/events/talent-icon" },
            ]}
          />

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-gray-900">
              Contact Info
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gray-300" />
                <span className="leading-relaxed">
                  {siteConfig.contact.address.slice(0, 80)}...
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-gray-300" />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="transition-colors hover:text-gray-600"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-gray-300" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="break-all transition-colors hover:text-gray-600"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Copyright bar */}
      <div className="border-t border-gray-50">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-gray-300 sm:flex-row">
          <p>{siteConfig.copyrightText}</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-gray-500">
              Privacy
            </Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-gray-500">
              Terms
            </Link>
            <Link href="/refund-policy" className="transition-colors hover:text-gray-500">
              Refunds
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
      <h3 className="text-[13px] font-semibold uppercase tracking-wider text-gray-900">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.path}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
