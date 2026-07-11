import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border bg-surface px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: "primary" | "accent" | "success";
}) {
  const accents = {
    primary: "bg-primary-50 text-primary-700",
    accent: "bg-accent-50 text-accent-600",
    success: "bg-success/10 text-success",
  };
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
      {icon && (
        <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", accents[accent])}>
          {icon}
        </span>
      )}
      <div className="flex flex-col">
        <span className="font-heading text-2xl font-bold text-text">{value}</span>
        <span className="text-sm text-text-muted">{label}</span>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-success/10 text-success",
    paid: "bg-success/10 text-success",
    pending: "bg-accent-50 text-accent-700",
    cancelled: "bg-error/10 text-error",
    failed: "bg-error/10 text-error",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        map[status] ?? "bg-surface-alt text-text-muted",
      )}
    >
      {status}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
      <p className="text-text-muted">{message}</p>
    </div>
  );
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
