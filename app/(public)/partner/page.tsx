import type { Metadata } from "next";
import Link from "next/link";
import { PartnerForm } from "@/components/public/PartnerForm";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Partner & Sponsor",
  alternates: { canonical: "/partner" },
  description:
    "Formalise a relationship with the Youth United Council of India — apply for an MOU partnership as an institution, or back our youth campaigns as a corporate or individual sponsor.",
};

export default function PartnerPage() {
  return (
    <>
      {/* Hero band — the shared festival gradient, kept compact so the form
          leads. White text sits over it. */}
      <section className="bg-festival-gradient pt-28 pb-16 sm:pt-32 sm:pb-20">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            <Link href="/" className="text-white/50 transition-colors hover:text-white">
              Home
            </Link>
            <span className="text-white/30" aria-hidden>
              /
            </span>
            <span className="text-highlight-400">Partner &amp; Sponsor</span>
          </nav>

          <span className="text-sm font-bold uppercase tracking-[0.22em] text-highlight-400">
            Stand with the movement
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Build something lasting with{" "}
            <span className="text-highlight-400">YUCI</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/80">
            Two ways to join one of India&apos;s largest youth organisations —
            formalise an institutional MOU, or sponsor the campaigns that reach
            young people across the country. Pick your path below; it&apos;s a
            single form either way.
          </p>
        </Container>
      </section>

      <Section tone="glow" className="pt-12 sm:pt-16">
        <PartnerForm />
      </Section>
    </>
  );
}
