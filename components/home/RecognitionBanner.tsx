import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";
import { RecognitionCarousel } from "./RecognitionCarousel";
import { FestiveEyebrow, ConfettiDots } from "./FestiveAccents";

interface RecognitionBannerProps {
  label: string;
  title: string;
  subtitle: string;
  details: string[];
  images: string[];
  /** Substring of `subtitle` to emphasize in the accent color. */
  highlight?: string;
}

/** Wrap the first occurrence of `term` in the subtitle with an accent style. */
function emphasize(text: string, term?: string) {
  if (!term) return text;
  const i = text.indexOf(term);
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="whitespace-nowrap font-semibold text-highlight-400">{term}</span>
      {text.slice(i + term.length)}
    </>
  );
}

export function RecognitionBanner({
  label,
  title,
  subtitle,
  details,
  images,
  highlight,
}: RecognitionBannerProps) {
  // Break the title into two balanced lines at its midpoint, with the second
  // half in the accent color — keeps long titles to two lines instead of three.
  const words = title.split(" ");
  const mid = Math.ceil(words.length / 2);
  const titleHead = words.length > 3 ? words.slice(0, mid).join(" ") : title;
  const titleTail = words.length > 3 ? words.slice(mid).join(" ") : "";

  return (
    <section className="bg-hero-gradient relative overflow-hidden py-12 sm:py-14 lg:py-16">
      <ConfettiDots />
      <Container className="relative">
        {/* Mobile order: title → image → paragraph. Desktop: title + paragraph
            stacked on the left, carousel on the right spanning both rows. */}
        <div className="grid items-center gap-x-10 gap-y-6 lg:grid-cols-[1.12fr_0.88fr]">
          {/* Title — first on mobile, top-left on desktop */}
          <FadeUp className="order-1 flex flex-col gap-6 lg:order-none lg:col-start-1 lg:row-start-1 lg:self-end">
            <FestiveEyebrow className="w-fit text-highlight-400">{label}</FestiveEyebrow>
            <h2 className="font-heading text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2.4rem] lg:text-[2.75rem]">
              {titleHead}
              {titleTail && (
                <>
                  <br />
                  <span className="text-highlight-400">
                    {titleTail}
                  </span>
                </>
              )}
            </h2>
          </FadeUp>

          {/* Carousel — between title and paragraph on mobile; right column
              (spanning both rows) on desktop */}
          <FadeUp
            delay={0.15}
            className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2"
          >
            <RecognitionCarousel images={images} />
          </FadeUp>

          {/* Paragraph + details — below the image on mobile; below the title
              on desktop */}
          <FadeUp className="order-3 flex flex-col gap-6 lg:order-none lg:col-start-1 lg:row-start-2 lg:self-start">
            <p className="text-xl leading-relaxed text-white/85 sm:text-2xl sm:leading-relaxed">
              {emphasize(subtitle, highlight)}
            </p>
            {details.length > 0 && (
              <ul className="flex flex-col gap-4">
                {details.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-white/85">
                    <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-highlight-500" aria-hidden />
                    <span className="text-base leading-relaxed sm:text-[17px]">{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </FadeUp>
        </div>
      </Container>
    </section>
  );
}
