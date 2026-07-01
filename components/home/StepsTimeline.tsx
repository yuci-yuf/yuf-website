import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RegistrationStep } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import { FestiveEyebrow, ConfettiDots } from "./FestiveAccents";

export function StepsTimeline({ steps }: { steps: RegistrationStep[] }) {
  return (
    <section className="relative overflow-hidden bg-slate-50/60 py-16 sm:py-24 lg:py-32">
      <ConfettiDots />
      <Container className="relative">
        <FadeUp className="mb-16 flex flex-col items-center gap-4 text-center">
          <FestiveEyebrow>How It Works</FestiveEyebrow>
          <h2 className="max-w-md font-heading text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Steps to Register
          </h2>
          <p className="max-w-xl text-[16px] leading-relaxed text-body">
            Follow these simple steps to register for your desired competition.
          </p>
        </FadeUp>

        <StaggerContainer stagger={0.12} className="relative">
          {/* Connecting line (desktop) */}
          <div
            className="absolute left-0 right-0 top-7 z-0 hidden h-0.5 bg-primary-200 lg:block"
            aria-hidden
          />

          <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-3">
            {steps.map((step) => (
              <StaggerItem key={step.step}>
                <div className="group relative flex flex-col items-center gap-5 text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 font-heading text-lg font-bold text-white shadow-lg shadow-primary-600/25 ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
                    {step.step}
                  </div>
                  <h3 className="font-heading text-base font-bold text-heading">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <FadeUp delay={0.3} className="mt-14 flex justify-center">
          <Link
            href="/register"
            className="group inline-flex h-13 items-center gap-2 rounded-full bg-primary-600 px-8 text-[15px] font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-xl"
          >
            Register Now
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </FadeUp>
      </Container>
    </section>
  );
}
