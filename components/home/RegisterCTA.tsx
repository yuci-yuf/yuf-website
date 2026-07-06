import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CTABanner } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";

export function RegisterCTA({ data }: { data: CTABanner }) {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-8 py-16 sm:px-14 lg:px-20">
            {/* Decorative shapes */}
            <div
              className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-primary-400/20 blur-3xl"
              aria-hidden
            />

            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/70">
                  {data.label}
                </p>
                <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                  {data.title}
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-white/80">
                  {data.body.slice(0, 200)}...
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-[15px] font-semibold text-primary-700 shadow-md transition-all hover:bg-gray-50"
                >
                  Register Now
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
