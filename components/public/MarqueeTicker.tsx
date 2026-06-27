import { Star } from "lucide-react";

export function MarqueeTicker({ items }: { items: string[] }) {
  // Duplicate the set so the -50% translate loop is seamless.
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-primary-800 bg-primary-900 py-4">
      <div className="flex w-max animate-[marquee_30s_linear_infinite] items-center gap-8 pr-8">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className="font-heading text-base font-semibold uppercase tracking-wide text-primary-100">
              {item}
            </span>
            <Star size={16} className="shrink-0 text-accent-400" fill="currentColor" />
          </div>
        ))}
      </div>
    </div>
  );
}
