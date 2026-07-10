import { Section } from "@/components/ui/Section";
import type { LegalPage } from "@/lib/content";

export function LegalContent({ data }: { data: LegalPage }) {
  return (
    <>
      <Section className="bg-festival-gradient text-white" containerClassName="max-w-6xl">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          {data.title}
        </h1>
        {data.intro && (
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/85">
            {data.intro}
          </p>
        )}
      </Section>

      <Section tone="aqua" containerClassName="max-w-6xl">
        {/* Two columns on large screens so the sections fill the width instead
            of leaving big empty margins; each section stays whole. */}
        <div className="columns-1 gap-12 lg:columns-2">
          {data.sections.map((section) => (
            <div key={section.heading} className="mb-10 flex break-inside-avoid flex-col gap-4 last:mb-0">
              <h2 className="font-heading text-2xl font-bold text-heading">
                {section.heading}
              </h2>
              {section.blocks.map((block, i) =>
                typeof block === "string" ? (
                  <p key={i} className="leading-relaxed text-text-muted">
                    {block}
                  </p>
                ) : (
                  <div key={i} className="flex flex-col gap-3">
                    {block.lead && (
                      <p className="leading-relaxed text-text-muted">{block.lead}</p>
                    )}
                    <ul className="flex list-disc flex-col gap-2 pl-5 text-text-muted">
                      {block.list.map((item, j) => (
                        <li key={j} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
