import Image from "next/image";
import type { FeatureCard } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";
import { FestiveEyebrow, ConfettiDots } from "./FestiveAccents";

interface InitiativesRowProps {
  label: string;
  title: string;
  subtitle: string;
  cards: FeatureCard[];
}

function InitiativeCard({ card }: { card: FeatureCard }) {
  return (
    <div className="flex w-[21rem] shrink-0 items-center gap-5 rounded-3xl border border-border bg-white p-6 shadow-card">
      {card.image && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
          <Image
            src={card.image}
            alt={card.title}
            width={96}
            height={96}
            // Skill India's artwork sits larger in its frame — scale just this
            // logo down so it visually matches the others.
            className={`h-full w-full object-contain${
              card.image.includes("skill-india") ? " scale-[0.85]" : ""
            }`}
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="font-heading text-lg font-bold text-heading">
          {card.title}
        </h3>
        <p className="text-sm leading-relaxed text-body">{card.description}</p>
      </div>
    </div>
  );
}

export function InitiativesRow({
  label,
  title,
  subtitle,
  cards,
}: InitiativesRowProps) {
  // Duplicate the set so the -50% translate loop is seamless on every viewport.
  const loop = [...cards, ...cards];

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
      </Container>

      {/* Full-bleed marquee — pauses on hover, freezes under reduced-motion. */}
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] items-stretch gap-6 pr-6 group-hover:[animation-play-state:paused]">
          {loop.map((card, i) => (
            <InitiativeCard key={`${card.title}-${i}`} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
