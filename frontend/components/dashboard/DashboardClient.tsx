"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import EventCard from "@/components/events/EventCard";
import type { Event } from "@/lib/types";
import { CalendarDays, Map, Star, TrendingUp, Clock, Calendar, X, Flame } from "lucide-react";

// ── Popularity sort ────────────────────────────────────────────────────────────

function sortByPopularity(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    const aT = !!a.ticketUrl, bT = !!b.ticketUrl;
    if (aT && !bT) return -1;
    if (!aT && bT) return 1;
    const aI = !!a.image, bI = !!b.image;
    if (aI && !bI) return -1;
    if (!aI && bI) return 1;
    return a.date.localeCompare(b.date);
  });
}

// ── View-all modal (캘린더 DayPopup과 동일한 스타일) ──────────────────────────

function ViewAllModal({
  title,
  events,
  onClose,
}: {
  title: string;
  events: Event[];
  onClose: () => void;
}) {
  const sorted = sortByPopularity(events);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      />

      {/* Centered modal */}
      <div
        className="fixed z-50 rounded-2xl flex flex-col"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(1100px, 95vw)",
          maxHeight: "88vh",
          border: "1px solid var(--border)",
          backgroundColor: "var(--card-bg)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-muted)" }}>
              Events
            </p>
            <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {sorted.length > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "#FFF4E6", color: "#FF9F43" }}>
                <Flame size={11} /> 인기순
              </span>
            )}
            {sorted.length > 0 && (
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#FFF0EF", color: "var(--primary)" }}>
                {sorted.length} event{sorted.length !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Event cards */}
        <div className="overflow-y-auto flex-1 p-6">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <span className="text-5xl">📅</span>
              <p className="text-base font-semibold" style={{ color: "var(--text)" }}>No events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

// ── Section ────────────────────────────────────────────────────────────────────

function Section({
  icon, title, previewEvents, allEvents, emptyMsg,
}: {
  icon: React.ReactNode;
  title: string;
  previewEvents: Event[];   // first 8–10 for horizontal scroll
  allEvents: Event[];       // full set for modal
  emptyMsg: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#FFF0EF", color: "var(--primary)" }}
          >
            {icon}
          </span>
          <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>{title}</h2>
          {allEvents.length > 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#FFF0EF", color: "var(--primary)" }}
            >
              {allEvents.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={allEvents.length === 0}
          className="text-xs font-semibold flex items-center gap-1 hover:underline disabled:opacity-40 disabled:cursor-default disabled:no-underline"
          style={{ color: "var(--primary)" }}
        >
          전체 보기 →
        </button>
      </div>

      {previewEvents.length === 0 ? (
        <div
          className="rounded-2xl flex items-center justify-center py-12 text-center"
          style={{ border: "1px dashed var(--border)", backgroundColor: "var(--background)" }}
        >
          <div>
            <p className="text-2xl mb-1">📭</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{emptyMsg}</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {previewEvents.map((ev) => (
            <div key={ev.id} className="shrink-0" style={{ width: 280 }}>
              <EventCard event={ev} />
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ViewAllModal
          title={title}
          events={allEvents}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}

// ── Dashboard client ───────────────────────────────────────────────────────────

export type DashboardProps = {
  todayEvents: Event[];
  weekEvents: Event[];
  monthEvents: Event[];
  isFallback: boolean;
  featuredTotal: number;
  dateLabel: string;
};

export default function DashboardClient({
  todayEvents,
  weekEvents,
  monthEvents,
  isFallback,
  featuredTotal,
  dateLabel,
}: DashboardProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, #FF8E8E 60%, #FFAB76 100%)",
        }}
      >
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            {dateLabel}
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to <span style={{ color: "#FFE66D" }}>OzFest</span> 🦘
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            Discover the best events happening around Australia
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/calendar"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <CalendarDays size={15} /> Calendar
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <Map size={15} /> Event Map
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Clock size={18} />,        label: "Today",      value: todayEvents.length,  sub: "events" },
          { icon: <CalendarDays size={18} />, label: "This Week",  value: weekEvents.length,   sub: "events" },
          { icon: <Calendar size={18} />,     label: "This Month", value: monthEvents.length,  sub: "events" },
          { icon: <Star size={18} />,         label: "Featured",   value: featuredTotal,       sub: "total picks" },
        ].map(({ icon, label, value, sub }) => (
          <div
            key={label}
            className="rounded-2xl px-5 py-4 flex flex-col gap-1"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2" style={{ color: "var(--primary)" }}>
              {icon}
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Today ── */}
      <Section
        icon={<Clock size={16} />}
        title="Today's Events"
        previewEvents={todayEvents.slice(0, 8)}
        allEvents={todayEvents}
        emptyMsg="No events today — check back tomorrow!"
      />

      {/* ── This Week ── */}
      <Section
        icon={<TrendingUp size={16} />}
        title="Happening This Week"
        previewEvents={weekEvents.slice(0, 8)}
        allEvents={weekEvents}
        emptyMsg="No events this week."
      />

      {/* ── This Month / Fallback ── */}
      <Section
        icon={<Calendar size={16} />}
        title={isFallback ? "Recent Highlights" : "Coming This Month"}
        previewEvents={monthEvents.slice(0, 10)}
        allEvents={monthEvents}
        emptyMsg="No events this month."
      />

    </div>
  );
}
