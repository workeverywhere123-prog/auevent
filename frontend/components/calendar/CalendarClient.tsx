"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { CATEGORY_META } from "@/lib/mock-data";
import type { Event } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA",  label: "Western Australia" },
  { value: "SA",  label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT",  label: "Northern Territory" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEventsForDate(events: Event[], date: Date, state: string): Event[] {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return events.filter((e) => {
    if (state !== "all" && e.location.state !== state) return false;
    const start = new Date(e.date + "T00:00:00");
    const end   = e.endDate ? new Date(e.endDate + "T00:00:00") : start;
    return target >= start && target <= end;
  });
}

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Popup ────────────────────────────────────────────────────────────────────

function DayPopup({
  date, events, fetchError, onClose, currentStateLabel, state,
}: {
  date: Date;
  events: Event[];
  fetchError: boolean;
  onClose: () => void;
  currentStateLabel: string;
  state: string;
}) {
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
              Events on
            </p>
            <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              {formatFullDate(date)}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {events.length > 0 && (
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#FFF0EF", color: "var(--primary)" }}>
                {events.length} event{events.length !== 1 ? "s" : ""}
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
          {fetchError && (
            <p className="text-sm text-center py-2 mb-4" style={{ color: "var(--primary)" }}>
              이벤트를 불러오지 못했습니다. 다시 시도해주세요.
            </p>
          )}

          {events.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <span className="text-5xl">📅</span>
              <p className="text-base font-semibold" style={{ color: "var(--text)" }}>No events on this day</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {state !== "all" ? `No events in ${currentStateLabel} on this date.` : "Try selecting a different date or region."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((ev) => (
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

// ─── Main Client Component ────────────────────────────────────────────────────

export default function CalendarClient({ events: initialEvents }: { events: Event[] }) {
  const today = new Date();
  const [year, setYear]         = useState(today.getFullYear());
  const [month, setMonth]       = useState(today.getMonth());
  const [state, setState]       = useState("all");
  const [selected, setSelected] = useState<Date | null>(null);
  const [popupRect, setPopupRect] = useState<DOMRect | null>(null);
  const [events, setEvents]     = useState<Event[]>(initialEvents);
  const [loading, setLoading]   = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const mountedRef = useRef(false);

  // Close popup on scroll
  useEffect(() => {
    const close = () => { setSelected(null); setPopupRect(null); };
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

  const handleDateSearch = (value: string) => {
    setDateInput(value);
    setSelected(null);
    setPopupRect(null);
    if (!value) return;
    const parsed = new Date(value + "T00:00:00");
    if (isNaN(parsed.getTime())) return;
    setYear(parsed.getFullYear());
    setMonth(parsed.getMonth());
  };

  const fetchMonth = useCallback(async (y: number, m: number, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year:  String(y),
        month: String(m),
        state: s,
      });
      const res = await fetch(`/api/events?${params}`);
      if (res.ok) {
        setEvents(await res.json());
        setFetchError(false);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    fetchMonth(year, month, state);
  }, [year, month, state, fetchMonth]);

  const cells = buildCalendarDays(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelected(null);
    setPopupRect(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelected(null);
    setPopupRect(null);
  };

  const handleDayClick = (date: Date, e: React.MouseEvent<HTMLDivElement>) => {
    if (selected && isSameDay(selected, date)) {
      setSelected(null);
      setPopupRect(null);
    } else {
      setSelected(date);
      setPopupRect(e.currentTarget.getBoundingClientRect());
    }
  };

  const monthEventCount = cells
    .filter((d): d is Date => d !== null)
    .reduce((acc, d) => acc + getEventsForDate(events, d, state).length, 0);

  const selectedEvents = selected ? getEventsForDate(events, selected, state) : [];
  const currentStateLabel = STATE_OPTIONS.find((o) => o.value === state)?.label ?? state;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Page header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Calendar</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {loading ? "Loading…" : `${monthEventCount} events · ${MONTHS[month]} ${year}`}
        </p>
      </div>

      {/* ── Category legend ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {Object.entries(CATEGORY_META)
          .filter(([k]) => k !== "all")
          .map(([key, meta]) => (
            <span
              key={key}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.label}
            </span>
          ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setSelected(null); }}
              className="text-sm rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                color: state !== "all" ? "var(--primary)" : "var(--text-muted)",
                fontWeight: state !== "all" ? 600 : 400,
              }}
            >
              {STATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="w-px h-5" style={{ backgroundColor: "var(--border)" }} />

            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => handleDateSearch(e.target.value)}
                className="text-sm rounded-lg px-2.5 py-1.5 outline-none"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--background)",
                  color: dateInput ? "var(--text)" : "var(--text-muted)",
                }}
              />
              {dateInput && (
                <button
                  onClick={() => { setDateInput(""); setSelected(null); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                  style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100" style={{ color: "var(--text-muted)" }}>
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold min-w-[120px] text-center" style={{ color: "var(--text)" }}>
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100" style={{ color: "var(--text-muted)" }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--border)" }}>
          {DAYS.map((day, i) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-bold uppercase tracking-wider"
              style={{
                color: i === 0 || i === 6 ? "var(--primary)" : "var(--text-muted)",
                borderRight: i < 6 ? "1px solid var(--border)" : undefined,
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7">
          {cells.map((date, idx) => {
            const dayEvents  = date ? getEventsForDate(events, date, state) : [];
            const isToday    = date ? isSameDay(date, today) : false;
            const isSelected = date && selected ? isSameDay(date, selected) : false;
            const isLastRow  = idx >= cells.length - 7;
            const colPos     = idx % 7;

            return (
              <div
                key={idx}
                onClick={(e) => date && handleDayClick(date, e)}
                className="min-h-[90px] p-2 flex flex-col gap-0 transition-colors"
                style={{
                  borderRight:  colPos < 6 ? "1px solid var(--border)" : undefined,
                  borderBottom: !isLastRow ? "1px solid var(--border)" : undefined,
                  backgroundColor: isSelected ? "#FFF0EF" : !date ? "var(--background)" : "var(--card-bg)",
                  cursor: date ? "pointer" : "default",
                }}
              >
                {date && (
                  <>
                    <span
                      className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold self-start"
                      style={{
                        backgroundColor: isToday ? "var(--primary)" : isSelected ? "#FFD6D4" : "transparent",
                        color: isToday ? "#fff" : colPos === 0 || colPos === 6 ? "var(--primary)" : "var(--text-muted)",
                      }}
                    >
                      {date.getDate()}
                    </span>

                    {dayEvents.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const meta = CATEGORY_META[ev.category];
                          return (
                            <span
                              key={ev.id}
                              className="block truncate rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-tight"
                              style={{ backgroundColor: meta.bg, color: meta.color }}
                              title={ev.title}
                            >
                              {ev.title}
                            </span>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] font-semibold px-1.5" style={{ color: "var(--text-muted)" }}>
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Day popup ── */}
      {selected && (
        <DayPopup
          date={selected}
          events={selectedEvents}
          fetchError={fetchError}
          onClose={() => { setSelected(null); setPopupRect(null); }}
          currentStateLabel={currentStateLabel}
          state={state}
        />
      )}
    </div>
  );
}
