import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RegistrationStep } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

export function StepsTimeline({ steps }: { steps: RegistrationStep[] }) {
  return (
    <section className="bg-slate-50/60 py-24 lg:py-32">
      <Container>
        <FadeUp className="mb-16 flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            How It Works
          </span>
          <h2 className="max-w-md font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Steps to Register
          </h2>
          <p className="max-w-xl text-[16px] leading-relaxed text-gray-500">
            Follow these simple steps to register for your desired competition.
          </p>
        </FadeUp>

        <StaggerContainer stagger={0.12} className="relative">
          {/* Connecting line (desktop) */}
          <div
            className="absolute left-0 right-0 top-7 z-0 hidden h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent lg:block"
            aria-hidden
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <StaggerItem key={step.step}>
                <div className="relative flex flex-col items-center gap-5 text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white font-heading text-lg font-bold text-primary-600 shadow-sm ring-1 ring-gray-100">
                    {step.step}
                  </div>
                  <h3 className="font-heading text-base font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
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
            className="group inline-flex h-13 items-center gap-2 rounded-full bg-primary-600 px-8 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg"
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
