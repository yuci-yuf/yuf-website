import { Handshake, Lightbulb, Heart } from "lucide-react";
import type { FeatureCard } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

const benefitIcons = [Handshake, Lightbulb, Heart];

export function BenefitsGrid({
  label,
  title,
  subtitle,
  cards,
}: {
  label: string;
  title: string;
  subtitle: string;
  cards: FeatureCard[];
}) {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeUp className="mb-14 flex flex-col items-center gap-4 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">
            {label}
          </span>
          <h2 className="max-w-md font-display text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-lg text-[16px] leading-relaxed text-gray-500">
            {subtitle}
          </p>
        </FadeUp>

        <StaggerContainer stagger={0.1} className="grid gap-6 sm:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = benefitIcons[i % benefitIcons.length];
            return (
              <StaggerItem key={card.title}>
                <div className="group flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-gray-900">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {card.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </Container>
    </section>
  );
}
