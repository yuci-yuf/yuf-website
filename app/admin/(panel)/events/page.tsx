"use client";

import { CalendarDays } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/AdminUI";
import { events, eventCategoryOrder } from "@/lib/content";

/**
 * Read-only event listing. Full CRUD (add/edit/delete with Cloudinary image
 * upload) lands in the CMS phase; events currently come from lib/content.ts.
 */
export default function AdminEventsPage() {
  return (
    <>
      <PageHeader
        title="Events"
        description="Event catalogue — editing arrives with the CMS phase"
      />
      <div className="flex flex-col gap-8 p-8">
        {eventCategoryOrder.map((category) => {
          const inCategory = events.filter((e) => e.category === category);
          return (
            <section key={category} className="rounded-2xl border border-border bg-surface shadow-card">
              <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                <CalendarDays size={18} className="text-primary-600" />
                <h2 className="font-heading font-bold text-text">{category}</h2>
                <span className="text-sm text-text-muted">({inCategory.length})</span>
              </div>
              <ul className="divide-y divide-border">
                {inCategory.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-4 px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-text">{e.title}</p>
                      <p className="text-xs text-text-muted">{e.tag}</p>
                    </div>
                    <StatusBadge status={e.isActive ? "confirmed" : "cancelled"} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
