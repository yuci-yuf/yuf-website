import Image from "next/image";
import { Quote } from "lucide-react";
import type { Advisor } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

interface MissionSectionProps {
  label: string;
  title: string;
  body: string[];
  primaryImage: string;
  secondaryImage: string;
  advisor: Advisor;
}

export function MissionSection({
  label,
  title,
  body,
  primaryImage,
  secondaryImage,
  advisor,
}: MissionSectionProps) {
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — Image collage */}
          <FadeUp className="relative">
            <div className="relative">
              {/* Primary image */}
              <div className="relative aspect-[4/5] w-[75%] overflow-hidden rounded-3xl shadow-lg">
                <Image
                  src={primaryImage}
                  alt="Youth United Council of India"
                  fill
                  sizes="(min-width: 1024px) 30vw, 70vw"
                  className="object-cover"
                />
              </div>

              {/* Secondary image — overlapping */}
              <div className="absolute -bottom-8 right-0 aspect-[4/3] w-[55%] overflow-hidden rounded-2xl border-4 border-white shadow-xl">
                <Image
                  src={secondaryImage}
                  alt="Join us at YUF"
                  fill
                  sizes="(min-width: 1024px) 20vw, 45vw"
                  className="object-cover"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute left-[55%] top-[20%] z-10 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-lg">
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

            {/* Advisor quote card */}
            <StaggerItem>
              <blockquote className="mt-2 rounded-2xl border-l-4 border-primary-500 bg-slate-50 p-6">
                <div className="mb-3 flex items-center gap-2 text-primary-500">
                  <Quote size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {advisor.badge}
                  </span>
                </div>
                <p className="text-[15px] italic leading-relaxed text-gray-600">
                  &ldquo;{advisor.quote.slice(0, 160)}...&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  {advisor.image && (
                    <Image
                      src={advisor.image}
                      alt={advisor.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {advisor.name}
                    </p>
                    <p className="text-xs text-gray-400">{advisor.title}</p>
                  </div>
                </div>
              </blockquote>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </Container>
    </section>
  );
}
