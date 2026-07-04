import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";
import { FestiveEyebrow, FestiveGlows } from "./FestiveAccents";

interface MissionSectionProps {
  label: string;
  title: string;
  primaryImage: string;
}

export function MissionSection({
  label,
  title,
  primaryImage,
}: MissionSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
      <FestiveGlows />
      <Container className="relative">
        {/* Centered heading */}
        <FadeUp className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <FestiveEyebrow>{label}</FestiveEyebrow>
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-heading sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
        </FadeUp>

        {/* Centered image */}
        <FadeUp className="relative mx-auto mt-12 w-full max-w-4xl lg:mt-16">
          {/* Festive corner accent behind the image */}
          <div
            aria-hidden
            className="absolute -left-4 -top-4 h-24 w-24 rounded-2xl bg-gradient-to-br from-highlight-400 to-festival-purple opacity-80 blur-[2px]"
          />
          <div className="relative aspect-[7/5] w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-white/40">
            <Image
              src={primaryImage}
              alt={title}
              fill
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="object-cover"
            />
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
