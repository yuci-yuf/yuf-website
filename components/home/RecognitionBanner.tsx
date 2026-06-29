import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

interface RecognitionBannerProps {
  label: string;
  title: string;
  subtitle: string;
  details: string[];
  images: string[];
}

export function RecognitionBanner({
  label,
  title,
  subtitle,
  details,
  images,
}: RecognitionBannerProps) {
  return (
    <section className="bg-gradient-to-b from-amber-50/40 to-white py-24 lg:py-32">
      <Container>
        <div className="grid items-start gap-14 lg:grid-cols-2">
          {/* Left — content */}
          <FadeUp className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
              {label}
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {title}
            </h2>
            <p className="text-[16px] leading-relaxed text-gray-500">
              {subtitle}
            </p>
            <ul className="flex flex-col gap-3">
              {details.map((d) => (
                <li key={d} className="flex items-start gap-3 text-gray-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  <span className="text-[15px] leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </FadeUp>

          {/* Right — staggered image grid */}
          <StaggerContainer stagger={0.1} className="grid grid-cols-2 gap-4">
            {images.map((src, i) => (
              <StaggerItem
                key={src}
                className={i === 0 ? "col-span-2" : ""}
              >
                <div
                  className={`group relative overflow-hidden rounded-2xl ${
                    i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Recognition award ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </Container>
    </section>
  );
}
