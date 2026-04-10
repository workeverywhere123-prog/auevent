export const dynamic = "force-dynamic";

import { fetchEvents } from "@/lib/api";
import type { Event } from "@/lib/types";
import DashboardClient from "@/components/dashboard/DashboardClient";

// ── Date helpers (local timezone — avoid UTC offset shifting the date) ───────

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr() { return localDateStr(new Date()); }

function weekEndStr() {
  const d = new Date();
  d.setDate(d.getDate() + (6 - d.getDay())); // Saturday
  return localDateStr(d);
}

function monthEndStr() {
  const d = new Date();
  return localDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

/** Sort: featured first, then by date */
function sortEvents(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.date.localeCompare(b.date);
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const today    = todayStr();
  const weekEnd  = weekEndStr();
  const monthEnd = monthEndStr();

  const all = await fetchEvents();

  const inRange = (e: Event, from: string, to: string) => {
    const start = e.date;
    const end   = e.endDate ?? e.date;
    return end >= from && start <= to;
  };

  let todayEvents = sortEvents(all.filter((e) => inRange(e, today, today)));
  let weekEvents  = sortEvents(all.filter((e) => inRange(e, today, weekEnd)));
  let monthEvents = sortEvents(all.filter((e) => inRange(e, today, monthEnd)));

  const upcoming = sortEvents(all.filter((e) => (e.endDate ?? e.date) >= today));
  const fallback = upcoming.length > 0 ? upcoming.slice(0, 20) : sortEvents(all).slice(0, 20);
  let isFallback = false;
  if (todayEvents.length === 0 && weekEvents.length === 0 && monthEvents.length === 0) {
    monthEvents = fallback;
    isFallback = true;
  }

  const featuredTotal = all.filter((e) => e.featured).length;

  const dateLabel = new Date().toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <DashboardClient
      todayEvents={todayEvents}
      weekEvents={weekEvents}
      monthEvents={monthEvents}
      isFallback={isFallback}
      featuredTotal={featuredTotal}
      dateLabel={dateLabel}
    />
  );
}
