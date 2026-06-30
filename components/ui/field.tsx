import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/**
 * Layout helper: a labelled form field (shadcn `Label` + control + spacing).
 * shadcn ships no `Field` wrapper — pairing `Label` with a control by hand is
 * the documented pattern — so this thin helper just keeps call sites tidy. It
 * contains no styled inputs; the control is passed as children.
 */
export function Field({
  label,
  htmlFor,
  required,
  description,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </Label>
      {description && <p className="text-sm text-text-muted">{description}</p>}
      {children}
    </div>
  );
}
