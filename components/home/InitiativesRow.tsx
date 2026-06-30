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
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 to-white py-16 sm:py-24 lg:py-32">
      <ConfettiDots />
      <Container className="relative">
        <FadeUp className="mb-14 flex flex-col items-center gap-4 text-center">
          <FestiveEyebrow>{label}</FestiveEyebrow>
          <h2 className="max-w-xl font-heading text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-lg text-[16px] leading-relaxed text-body">
            {subtitle}
          </p>
        </FadeUp>

        <StaggerContainer stagger={0.1} className="grid gap-6 sm:grid-cols-3">
          {cards.map((card) => (
            <StaggerItem key={card.title}>
              <div className="group flex flex-col items-center gap-5 rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-100 to-primary-200/80 p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:from-primary-100 hover:to-primary-300/70 hover:shadow-lg hover:shadow-primary-200/60">
                {card.image && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-primary-200">
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <h3 className="font-heading text-lg font-bold text-primary-900">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {card.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  );
}
