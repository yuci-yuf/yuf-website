import Image from "next/image";
import type { FeatureCard } from "@/types";
import { cn } from "@/lib/utils";

export function FeatureGrid({
  cards,
  columns = 3,
}: {
  cards: FeatureCard[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-hover"
        >
          {card.image ? (
            <span className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl bg-white p-3 ring-1 ring-border">
              <Image
                src={card.image}
                alt={card.title}
                width={104}
                height={104}
                className="h-full w-full object-contain"
              />
            </span>
          ) : (
            card.icon && (
              <span className="flex h-13 w-13 items-center justify-center rounded-xl bg-primary-50 text-2xl">
                {card.icon}
              </span>
            )
          )}
          <h3 className="font-heading text-lg font-bold text-text">{card.title}</h3>
          <p className="text-sm leading-relaxed text-text-muted">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}
