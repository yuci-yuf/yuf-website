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
    <section className="bg-surface-alt py-20 lg:py-24">
      <Container>
        <SectionHeading label={label} title={title} className="mb-12" />
        <figure className="mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-3xl border border-border bg-surface p-8 shadow-card sm:p-12">
          <Quote size={40} className="text-accent-500" />
          <blockquote className="text-center text-lg font-medium leading-relaxed text-text sm:text-xl">
            &ldquo;{advisor.quote}&rdquo;
          </blockquote>
          <figcaption className="flex flex-col items-center gap-2 text-center">
            {advisor.image && (
              <Image
                src={advisor.image}
                alt={advisor.name}
                width={88}
                height={88}
                className="h-22 w-22 rounded-full object-cover ring-4 ring-primary-50"
              />
            )}
            <span className="mt-1 font-heading text-lg font-bold text-primary-800">
              {advisor.name}
            </span>
            <span className="text-sm text-text-muted">{advisor.title}</span>
            <span className="mt-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              {advisor.badge}
            </span>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
