import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

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
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
          {/* Left — Image */}
          <FadeUp className="relative">
            <div className="relative">
              {/* Primary image */}
              <div className="relative aspect-[7/5] w-full overflow-hidden rounded-3xl shadow-lg">
                <Image
                  src={primaryImage}
                  alt="Youth United Council of India"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 right-6 z-10 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-lg">
                <p className="font-heading text-3xl font-bold text-primary-600">
                  10+
                </p>
                <p className="text-xs font-medium text-gray-400">
                  Years of
                  <br />
                  Excellence
                </p>
              </div>
            </div>
          </FadeUp>

          {/* Right — Content */}
          <StaggerContainer stagger={0.08} className="flex flex-col gap-6">
            <StaggerItem>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
                {label}
              </span>
            </StaggerItem>

            <StaggerItem>
              <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
                Creating Experiences
                <br />
                That Inspire
              </h2>
            </StaggerItem>

            {body.map((p, i) => (
              <StaggerItem key={i}>
                <p className="text-[16px] leading-relaxed text-gray-500">
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
