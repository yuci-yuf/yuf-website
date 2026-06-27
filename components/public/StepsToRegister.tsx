import type { RegistrationStep } from "@/types";

export function StepsToRegister({ steps }: { steps: RegistrationStep[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <div key={step.step} className="relative flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-600 font-heading text-lg font-bold text-white">
              {step.step}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>
          <h3 className="font-heading text-lg font-bold text-text">{step.title}</h3>
          <p className="text-sm leading-relaxed text-text-muted">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
