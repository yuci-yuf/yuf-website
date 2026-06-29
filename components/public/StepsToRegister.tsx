import type { RegistrationStep } from "@/types";

export function StepsToRegister({ steps }: { steps: RegistrationStep[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <div
          key={step.step}
          className="group relative flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 font-heading text-lg font-bold text-white shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
              {step.step}
            </span>
            <span
              className="h-px flex-1 bg-gradient-to-r from-border to-transparent"
              aria-hidden
            />
          </div>
          <h3 className="font-heading text-lg font-bold text-text">
            {step.title}
          </h3>
          <p className="text-sm leading-relaxed text-text-muted">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
