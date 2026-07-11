"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  formatDate,
} from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getRegistrations,
  getContactMessages,
  getAdminEvents,
} from "@/lib/admin-data";
import type { ContactMessage, EventItem, Registration } from "@/types";
import { RegistrationToggle } from "@/components/admin/RegistrationToggle";

const chartConfig = {
  count: { label: "Registrations", color: "#1fa8d7" },
} satisfies ChartConfig;

/** Registrations grouped by the last 6 months (oldest → newest). */
function monthlySeries(registrations: Registration[]) {
  const now = new Date();
  const buckets: { key: string; month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleDateString("en-US", { month: "short" }),
      count: 0,
    });
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const r of registrations) {
    if (!r.createdAt) continue;
    const d = new Date(r.createdAt);
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i != null) buckets[i].count += 1;
  }
  return buckets;
}

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getRegistrations(), getContactMessages(), getAdminEvents()])
      .then(([regs, msgs, evs]) => {
        setRegistrations(regs);
        setContacts(msgs);
        setEvents(evs);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const inMonth = (iso: string | null, offset: number) => {
    if (!iso) return false;
    const d = new Date(iso);
    const ref = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
  };
  const thisMonth = registrations.filter((r) => inMonth(r.createdAt, 0)).length;
  const lastMonth = registrations.filter((r) => inMonth(r.createdAt, 1)).length;
  // Month-over-month change in registrations, as a percentage (null when there
  // is no prior-month baseline to compare against).
  const momPct =
    lastMonth === 0
      ? thisMonth > 0
        ? 100
        : null
      : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const revenue = registrations
    .filter((r) => r.paymentStatus === "paid")
    .reduce((sum, r) => sum + (r.amountPaid || 0), 0);
  const pendingRevenue = registrations
    .filter((r) => r.paymentStatus !== "paid")
    .reduce((sum, r) => sum + (r.amountPaid || 0), 0);
  const activeEvents = events.filter((e) => e.isActive).length;
  const totalEvents = events.length;
  const unreadMessages = contacts.filter((c) => !c.isRead).length;

  const series = useMemo(() => monthlySeries(registrations), [registrations]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of registrations and activity"
      />

      <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <RegistrationToggle />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label="Total Registrations"
                value={registrations.length}
                trendPct={momPct}
                footerTitle={
                  momPct != null && momPct >= 0
                    ? "Trending up this month"
                    : "Down this month"
                }
                footerNote="Sign-ups across all events"
              />
              <StatTile
                label="This Month"
                value={thisMonth}
                trendPct={momPct}
                footerTitle={`${lastMonth} last month`}
                footerNote="Registrations created this month"
              />
              <StatTile
                label="Total Revenue"
                value={`₹${revenue.toLocaleString("en-IN")}`}
                footerTitle={`₹${pendingRevenue.toLocaleString("en-IN")} pending`}
                footerNote="Confirmed payments only"
              />
              <StatTile
                label="Active Events"
                value={activeEvents}
                footerTitle={`${totalEvents} total events`}
                footerNote={`${unreadMessages} unread messages`}
              />
            </div>

            {/* Registrations over time */}
            <Card>
              <CardHeader>
                <CardTitle>Registrations over time</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-56 w-full"
                >
                  <AreaChart data={series} margin={{ left: 4, right: 4 }}>
                    <defs>
                      <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-count)"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-count)"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      dataKey="count"
                      type="natural"
                      fill="url(#fillCount)"
                      stroke="var(--color-count)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-count)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent registrations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Recent Registrations</CardTitle>
                  <Link
                    href="/admin/registrations"
                    className="text-sm font-medium text-primary-700 hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent className="px-0">
                  {registrations.length === 0 ? (
                    <div className="px-6">
                      <EmptyState message="No registrations yet." />
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {registrations.slice(0, 6).map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center justify-between gap-3 px-6 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text">
                              {r.firstName} {r.lastName}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {r.eventTitle || "—"}
                            </p>
                          </div>
                          <StatusBadge status={r.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Recent contacts */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Recent Messages</CardTitle>
                  <Link
                    href="/admin/contacts"
                    className="text-sm font-medium text-primary-700 hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent className="px-0">
                  {contacts.length === 0 ? (
                    <div className="px-6">
                      <EmptyState message="No messages yet." />
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {contacts.slice(0, 6).map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-3 px-6 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text">
                              {c.firstName} {c.lastName}
                            </p>
                            <p className="truncate text-xs capitalize text-text-muted">
                              {c.subject}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-text-muted">
                            {formatDate(c.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/**
 * KPI card matching the shadcn dashboard-01 "section card" layout: label,
 * large value, an optional trend badge, and a two-line footer. `trendPct` is
 * the month-over-month delta (omit to hide the badge).
 */
function StatTile({
  label,
  value,
  trendPct,
  footerTitle,
  footerNote,
}: {
  label: string;
  value: string | number;
  trendPct?: number | null;
  footerTitle: string;
  footerNote: string;
}) {
  const up = trendPct != null && trendPct >= 0;
  const TrendIcon = up ? TrendingUp : TrendingDown;
  return (
    <Card className="gap-0">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-3xl font-bold tabular-nums text-text">
          {value}
        </CardTitle>
        {trendPct != null && (
          <CardAction>
            <Badge variant="outline" className="gap-1 text-text-muted">
              <TrendIcon size={13} />
              {up ? "+" : ""}
              {trendPct}%
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 pt-4 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-text">
          {footerTitle}
          {trendPct != null && <TrendIcon size={15} />}
        </span>
        <span className="text-text-muted">{footerNote}</span>
      </CardFooter>
    </Card>
  );
}
