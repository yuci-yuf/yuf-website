"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Mail,
  LogOut,
  ExternalLink,
  Images,
  ScanLine,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "@/contexts/ContactsContext";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Registrations", href: "/admin/registrations", icon: ClipboardList },
  { label: "Check-in", href: "/admin/checkin", icon: ScanLine },
  { label: "Contacts", href: "/admin/contacts", icon: Mail },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
];

/** The shared sidebar content — reused by the desktop rail and the mobile drawer. */
function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { unreadCount } = useContacts();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6">
        <span className="font-heading text-lg font-bold text-primary-800">
          YUF Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-muted hover:bg-surface-alt hover:text-text",
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/contacts" && unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-primary-700"
        >
          <ExternalLink size={16} /> View site
        </Link>
        <div
          className="truncate px-3 text-xs text-text-muted"
          title={user?.email ?? ""}
        >
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
    </>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* ── Mobile top bar (hidden on desktop) ── */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-text"
        >
          <Menu size={22} />
        </button>
        <span className="font-heading text-base font-bold text-primary-800">
          YUF Admin
        </span>
      </header>

      {/* ── Desktop rail (hidden on mobile) ── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <SidebarBody />
      </aside>

      {/* ── Mobile drawer + backdrop ── */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 max-w-[82%] flex-col border-r border-border bg-surface shadow-xl transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-text"
        >
          <X size={20} />
        </button>
        <SidebarBody onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
