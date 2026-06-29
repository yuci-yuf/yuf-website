import Image from "next/image";
import { Quote } from "lucide-react";
import type { Advisor } from "@/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";

export function AdvisorQuote({
  advisor,
  label = "Leadership",
  title,
}: {
  advisor: Advisor;
  label?: string;
  title: string;
}) {
  return (
    <section className="bg-surface-alt py-24 lg:py-32">
      <Container>
        <SectionHeading label={label} title={title} className="mb-14" />
        <figure className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface via-primary-50/20 to-surface p-10 shadow-card sm:p-14">
          {/* Decorative background quote mark */}
          <div
            className="absolute right-6 top-6 text-[10rem] font-bold leading-none text-primary-100/40 sm:right-10 sm:top-8"
            aria-hidden
          >
            &ldquo;
          </div>

          <Quote size={48} className="relative text-accent-500" />

          <blockquote className="relative text-center text-xl font-medium italic leading-relaxed text-text sm:text-2xl">
            &ldquo;{advisor.quote}&rdquo;
          </blockquote>

          <figcaption className="flex flex-col items-center gap-3 text-center">
            {advisor.image && (
              <Image
                src={advisor.image}
                alt={advisor.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-100"
              />
            )}
            <span className="mt-1 font-heading text-xl font-bold text-primary-800">
              {advisor.name}
            </span>
            <span className="text-sm text-text-muted">{advisor.title}</span>
            <span className="mt-1 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700">
              {advisor.badge}
            </span>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
