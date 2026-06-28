import { Section } from "@/components/ui/Section";
import type { LegalPage } from "@/lib/content";

export function LegalContent({ data }: { data: LegalPage }) {
  return (
    <>
      <Section className="bg-primary-950 text-white" containerClassName="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">
          {data.updated}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
          {data.title}
        </h1>
        {data.intro && (
          <p className="mt-5 text-base leading-relaxed text-primary-200">
            {data.intro}
          </p>
        )}
      </Section>

      <Section containerClassName="max-w-3xl">
        <div className="flex flex-col gap-10">
          {data.sections.map((section) => (
            <div key={section.heading} className="flex flex-col gap-4">
              <h2 className="font-heading text-2xl font-bold text-text">
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
