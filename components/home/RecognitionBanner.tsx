import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";
import { RecognitionCarousel } from "./RecognitionCarousel";

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
  // Drop the last two words ("Raj Bhavan") onto their own line.
  const words = title.split(" ");
  const titleHead = words.length > 2 ? words.slice(0, -2).join(" ") : title;
  const titleTail = words.length > 2 ? words.slice(-2).join(" ") : "";

  return (
    <section className="bg-gradient-to-br from-primary-200/70 via-primary-100/60 to-primary-50 py-16 sm:py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left — content */}
          <FadeUp className="flex flex-col gap-7">
            <span className="w-fit text-sm font-bold uppercase tracking-[0.2em] text-primary-700">
              {label}
            </span>
            <h2 className="font-heading text-[2rem] font-bold leading-[1.12] tracking-tight text-gray-900 sm:text-[2.5rem] lg:text-[2.75rem] lg:whitespace-nowrap">
              {titleHead}
              {titleTail && (
                <>
                  <br />
                  <span className="bg-gradient-to-r from-primary-700 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {titleTail}
                  </span>
                </>
              )}
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              {subtitle}
            </p>
            <ul className="flex flex-col gap-4">
              {details.map((d) => (
                <li key={d} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" aria-hidden />
                  <span className="text-base leading-relaxed sm:text-[17px]">{d}</span>
                </li>
              ))}
            </ul>
          </FadeUp>

          {/* Right — auto-sliding carousel */}
          <FadeUp delay={0.15}>
            <RecognitionCarousel images={images} />
          </FadeUp>
        </div>
      </Container>
    </section>
  );
}
