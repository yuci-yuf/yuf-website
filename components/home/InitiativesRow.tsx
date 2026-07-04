import Image from "next/image";
import type { FeatureCard } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import { FestiveEyebrow, ConfettiDots } from "./FestiveAccents";

interface InitiativesRowProps {
  label: string;
  title: string;
  subtitle: string;
  cards: FeatureCard[];
}

export function InitiativesRow({
  label,
  title,
  subtitle,
  cards,
}: InitiativesRowProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 to-white py-12 sm:py-16 lg:py-20">
      <ConfettiDots />
      <Container className="relative">
        <FadeUp className="mb-14 flex flex-col items-center gap-4 text-center">
          <FestiveEyebrow>{label}</FestiveEyebrow>
          <h2 className="max-w-xl font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-lg text-[16px] leading-relaxed text-body">
            {subtitle}
          </p>
        </FadeUp>

        <StaggerContainer stagger={0.1} className="grid gap-6 sm:grid-cols-3">
          {cards.map((card) => (
            <StaggerItem key={card.title}>
              <div className="group flex h-full items-center gap-6 rounded-3xl border border-border bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-hover">
                {card.image && (
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={128}
                      height={128}
                      // Skill India's artwork sits larger in its frame — scale
                      // just this logo down so it visually matches the others.
                      className={`h-full w-full object-contain${
                        card.image.includes("skill-india") ? " scale-[0.85]" : ""
                      }`}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-xl font-bold text-heading">
                    {card.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-body">
                    {card.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  );
}
