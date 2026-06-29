import Image from "next/image";
import type { FeatureCard } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

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
    <section className="bg-slate-50/60 py-24 lg:py-32">
      <Container>
        <FadeUp className="mb-14 flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </span>
          <h2 className="max-w-xl font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-lg text-[16px] leading-relaxed text-gray-500">
            {subtitle}
          </p>
        </FadeUp>

        <StaggerContainer stagger={0.1} className="grid gap-6 sm:grid-cols-3">
          {cards.map((card) => (
            <StaggerItem key={card.title}>
              <div className="group flex flex-col items-center gap-5 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {card.image && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gray-50 p-2">
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
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
