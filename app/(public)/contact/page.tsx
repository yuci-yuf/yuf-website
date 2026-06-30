import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { Hero } from "@/components/public/Hero";
import { ContactForm } from "@/components/public/ContactForm";
import { SocialIcon } from "@/components/public/SocialIcon";
import { FeatureGrid } from "@/components/public/FeatureGrid";
import { CTABanner } from "@/components/public/CTABanner";
import { Section, SectionHeading } from "@/components/ui/Section";
import { contactContent, siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Youth United Council of India. We'd love to hear from you — questions, partnerships, event details, or volunteering inquiries.",
};

const mapsQuery = encodeURIComponent(
  "Thaiyur B Village, Chengalpet Taluk, Kanchipuram District, Chennai, 603103, Tamil Nadu, India",
);

export default function ContactPage() {
  return (
    <>
      <Hero data={contactContent.hero} />

      <Section id="contact-form" tone="aqua">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <ContactForm />

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
              <h3 className="font-heading text-xl font-bold text-heading">
                Get in touch with us
              </h3>
              <ul className="flex flex-col gap-5 text-sm">
                <ContactRow icon={<Phone size={18} />} label="Phone">
                  <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-primary-700">
                    {siteConfig.contact.phone}
                  </a>
                </ContactRow>
                <ContactRow icon={<Mail size={18} />} label="Email">
                  <a href={`mailto:${siteConfig.contact.email}`} className="break-all hover:text-primary-700">
                    {siteConfig.contact.email}
                  </a>
                </ContactRow>
                <ContactRow icon={<MapPin size={18} />} label="Address">
                  <span className="text-text-muted">{siteConfig.contact.address}</span>
                </ContactRow>
              </ul>

              <div className="flex flex-col gap-3 border-t border-border pt-5">
                <span className="text-sm font-semibold text-text">Follow our social</span>
                <div className="flex gap-3">
                  {siteConfig.socialLinks.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors hover:bg-primary-600 hover:text-white"
                    >
                      <SocialIcon platform={s.platform} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-2xl border border-border shadow-card">
              <iframe
                title="YUF location map"
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                className="h-56 w-full sm:h-64"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="tint">
        <SectionHeading
          label={contactContent.helpCards.label}
          title={contactContent.helpCards.title}
          subtitle={contactContent.helpCards.subtitle}
          className="mb-12"
        />
        <FeatureGrid cards={contactContent.helpCards.cards} columns={3} />
      </Section>

      <CTABanner data={contactContent.ctaBanner} />
    </>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="font-semibold text-text">{label}</span>
        {children}
      </span>
    </li>
  );
}