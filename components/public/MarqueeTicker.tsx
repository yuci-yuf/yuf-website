import { Star } from "lucide-react";

export function MarqueeTicker({ items }: { items: string[] }) {
  // Duplicate the set so the -50% translate loop is seamless.
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-primary-800/40 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 py-4">
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-primary-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-primary-950 to-transparent" />

      <div className="flex w-max animate-[marquee_30s_linear_infinite] items-center gap-10 pr-10">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-heading text-base font-semibold uppercase tracking-wider text-primary-200">
              {item}
            </span>
            <Star
              size={14}
              className="shrink-0 text-accent-400"
              fill="currentColor"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
