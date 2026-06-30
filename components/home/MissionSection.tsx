import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import { FestiveEyebrow, FestiveGlows } from "./FestiveAccents";

interface MissionSectionProps {
  label: string;
  title: string;
  body: string[];
  primaryImage: string;
}

export function MissionSection({
  label,
  title,
  body,
  primaryImage,
}: MissionSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
      <FestiveGlows />
      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
          {/* Left — Image */}
          <FadeUp className="relative">
            {/* Festive corner accent behind the image */}
            <div
              aria-hidden
              className="absolute -left-4 -top-4 h-24 w-24 rounded-2xl bg-gradient-to-br from-highlight-400 to-festival-purple opacity-80 blur-[2px]"
            />
            <div className="relative">
              {/* Primary image */}
              <div className="relative aspect-[7/5] w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-white/40">
                <Image
                  src={primaryImage}
                  alt="Youth United Council of India"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </FadeUp>

          {/* Right — Content */}
          <StaggerContainer stagger={0.08} className="flex flex-col gap-6">
            <StaggerItem>
              <FestiveEyebrow>{label}</FestiveEyebrow>
            </StaggerItem>

            <StaggerItem>
              <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-heading sm:text-4xl lg:text-[2.75rem]">
                Creating Experiences
                <br />
                That Inspire
              </h2>
            </StaggerItem>

            {body.map((p, i) => (
              <StaggerItem key={i}>
                <p className="text-[16px] leading-relaxed text-body">
                  {p}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </Container>
    </section>
  );
}
