import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";
import { FestiveEyebrow } from "./FestiveAccents";

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
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20">
      <Container className="relative">
        {/* Centered heading */}
        <FadeUp className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <FestiveEyebrow>{label}</FestiveEyebrow>
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-heading sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
        </FadeUp>

        {/* Centered image — merges into the white section (no card/box) */}
        <FadeUp className="relative mx-auto mt-10 w-full max-w-5xl lg:mt-12">
          <div className="relative aspect-[7/5] w-full">
            <Image
              src={primaryImage}
              alt={title}
              fill
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="object-contain"
              priority
            />
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
