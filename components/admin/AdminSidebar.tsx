"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Mail,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Registrations", href: "/admin/registrations", icon: ClipboardList },
  { label: "Contacts", href: "/admin/contacts", icon: Mail },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="font-heading text-lg font-bold text-primary-800">YUF Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-muted hover:bg-surface-alt hover:text-text",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-primary-700"
        >
          <ExternalLink size={16} /> View site
        </Link>
        <div className="truncate px-3 text-xs text-text-muted" title={user?.email ?? ""}>
          {user?.email}
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-error hover:bg-error/10"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
