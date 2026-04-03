"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useStarred } from "@/hooks/useStarred";
import type { Event } from "@/lib/types";
import EventCard from "@/components/events/EventCard";
import { CATEGORY_META, STATE_META } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, ChevronDown, X, MapPin, Clock, Ticket, ExternalLink, Star } from "lucide-react";
import StarButton from "@/components/featured/StarButton";

type ViewMode = "My Events" | "My 캘린더" | "My 맵";

const CATEGORY_ICONS: Record<string, string> = {
  all:      "⭐",
  music:    "🎵",
  food:     "🍽️",
  sports:   "⚽",
  arts:     "🎨",
  cultural: "🏛️",
  markets:  "🛍️",
  comedy:   "😂",
  film:     "🎬",
};

// ─── 공통 상수 ────────────────────────────────────────────────────────────────
const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CATEGORY_COLORS: Record<string, string> = {
  music: "#E84040", food: "#F97316", sports: "#22C55E",
  arts: "#8B5CF6", cultural: "#EAB308", markets: "#3B82F6",
  comedy: "#06B6D4", film: "#64748B",
};

// ─── 공통 유틸 ────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
function mapsUrl(event: Event) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.location.venue}, ${event.location.city} ${event.location.state} Australia`
  )}`;
}

// ─── 빈 상태 ─────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4"
      style={{ color: "var(--text-muted)" }}>
      <Star size={48} style={{ opacity: 0.2 }} />
      <p className="text-base font-medium">즐겨찾기한 이벤트가 없습니다</p>
      <p className="text-sm">이벤트 카드의 ★ 버튼을 눌러 추가해보세요</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 캘린더 뷰 — CalendarClient와 동일한 구조 (API 재fetch 없이 starred events만)
// ─────────────────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
function getEventsForDate(events: Event[], date: Date): Event[] {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return events.filter((e) => {
    const start = new Date(e.date + "T00:00:00");
    const end   = e.endDate ? new Date(e.endDate + "T00:00:00") : start;
    return target >= start && target <= end;
  });
}

// CalendarClient의 DayEventCard와 동일
function DayEventCard({ event }: { event: Event }) {
  const meta = CATEGORY_META[event.category];
  return (
    <div className="rounded-xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ border: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>
      <div className="h-1.5" style={{ backgroundColor: meta.color }} />
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-snug flex-1" style={{ color: "var(--text)" }}>
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <StarButton eventId={event.id} />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: meta.bg, color: meta.color }}>{meta.label}</span>
            {event.location.state && STATE_META[event.location.state] && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: STATE_META[event.location.state].color, backgroundColor: `${STATE_META[event.location.state].color}18` }}>
                {STATE_META[event.location.state].label}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs line-clamp-2 mb-3" style={{ color: "var(--text-muted)" }}>{event.description}</p>
        <div className="flex flex-col gap-1.5">
          <div className="text-xs" style={{ color: "#8898AA" }}>
            🗓 {formatDate(event.date)}
            {event.endDate && event.endDate !== event.date ? ` — ${formatDate(event.endDate)}` : ""}
            {" · "}{event.time}
          </div>
          <a href={mapsUrl(event)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs" style={{ color: "#0984E3", textDecoration: "none" }}>
            📍 <span className="truncate">{event.location.venue}, {event.location.city}, {event.location.state}</span>
            <span style={{ fontSize: 10, opacity: 0.7, flexShrink: 0 }}>↗</span>
          </a>
          <div className="flex items-center gap-1.5">
            <Ticket size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold"
              style={{ color: event.price === null ? "#55EFC4" : "var(--text-muted)" }}>
              {event.price === null ? "Free" : `A$${event.price}`}
            </span>
          </div>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          {event.featured && (
            <span className="text-[10px] font-medium px-2 py-1 rounded-full"
              style={{ color: "#FF9F43", backgroundColor: "#FFF4E6" }}>★ Featured</span>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            {event.ticketUrl ? (
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{ color: "#00B894", backgroundColor: "#E0F8F3" }}>
                <Ticket size={11} />티켓
              </a>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full cursor-not-allowed"
                style={{ color: "#C0C0C0", backgroundColor: "#F4F6F8" }}>
                <Ticket size={11} />티켓
              </span>
            )}
            {event.website ? (
              <a href={event.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{ color: "var(--primary)", backgroundColor: "#FFF0EF" }}>
                <ExternalLink size={11} />홈페이지
              </a>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full cursor-not-allowed"
                style={{ color: "#C0C0C0", backgroundColor: "#F4F6F8" }}>
                <ExternalLink size={11} />홈페이지
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ events }: { events: Event[] }) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);
  const dayPanelRef = useRef<HTMLDivElement>(null);

  const cells = buildCalendarDays(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const handleDayClick = (date: Date) => {
    setSelected(prev => (prev && isSameDay(prev, date) ? null : date));
    setTimeout(() => dayPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const monthEventCount = cells.filter((d): d is Date => d !== null)
    .reduce((acc, d) => acc + getEventsForDate(events, d).length, 0);

  const selectedEvents = selected ? getEventsForDate(events, selected) : [];

  return (
    <div>
      {/* 카테고리 범례 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {Object.entries(CATEGORY_META).filter(([k]) => k !== "all").map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: meta.bg, color: meta.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
            {meta.label}
          </span>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>

        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {monthEventCount}개의 즐겨찾기 이벤트
          </p>
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

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--border)" }}>
          {DAYS.map((day, i) => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider"
              style={{
                color: i === 0 || i === 6 ? "var(--primary)" : "var(--text-muted)",
                borderRight: i < 6 ? "1px solid var(--border)" : undefined,
              }}>
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7">
          {cells.map((date, idx) => {
            const dayEvents  = date ? getEventsForDate(events, date) : [];
            const isToday    = date ? isSameDay(date, today) : false;
            const isSelected = date && selected ? isSameDay(date, selected) : false;
            const isLastRow  = idx >= cells.length - 7;
            const colPos     = idx % 7;

            return (
              <div key={idx} onClick={() => date && handleDayClick(date)}
                className="min-h-[90px] p-2 flex flex-col gap-0 transition-colors"
                style={{
                  borderRight:  colPos < 6 ? "1px solid var(--border)" : undefined,
                  borderBottom: !isLastRow ? "1px solid var(--border)" : undefined,
                  backgroundColor: isSelected ? "#FFF0EF" : !date ? "var(--background)" : "var(--card-bg)",
                  cursor: date ? "pointer" : "default",
                }}>
                {date && (
                  <>
                    <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold self-start"
                      style={{
                        backgroundColor: isToday ? "var(--primary)" : isSelected ? "#FFD6D4" : "transparent",
                        color: isToday ? "#fff" : colPos === 0 || colPos === 6 ? "var(--primary)" : "var(--text-muted)",
                      }}>
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const meta = CATEGORY_META[ev.category];
                          return (
                            <span key={ev.id} className="block truncate rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-tight"
                              style={{ backgroundColor: meta.bg, color: meta.color }} title={ev.title}>
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

      {/* 선택된 날짜 이벤트 패널 */}
      {selected && (
        <div ref={dayPanelRef} className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-muted)" }}>
                Events on
              </p>
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {selected.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {selectedEvents.length > 0 && (
                <span className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#FFF0EF", color: "var(--primary)" }}>
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
                </span>
              )}
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="mb-4" style={{ height: "1px", backgroundColor: "var(--border)" }} />
          {selectedEvents.length === 0 ? (
            <div className="rounded-2xl py-16 flex flex-col items-center gap-3"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>
              <div className="text-4xl">📅</div>
              <p className="text-base font-semibold" style={{ color: "var(--text)" }}>이 날에는 즐겨찾기 이벤트가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedEvents.map(ev => <DayEventCard key={ev.id} event={ev} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 맵 뷰 — MapPageClient와 동일한 구조 (starred events만)
// ─────────────────────────────────────────────────────────────────────────────

// MapPageClient의 makeIcon과 동일
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeIcon(L: any, color: string, selected: boolean) {
  const w = selected ? 26 : 18;
  const h = selected ? 34 : 24;
  const shadow = selected
    ? `filter:drop-shadow(0 0 4px ${color}88) drop-shadow(0 2px 6px rgba(0,0,0,0.35))`
    : `filter:drop-shadow(0 1px 3px rgba(0,0,0,0.3))`;
  return L.divIcon({
    className: "",
    html: `<div style="background:transparent;border:none;padding:0;margin:0;line-height:0">
      <svg width="${w}" height="${h}" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg"
        style="cursor:pointer;${shadow};transition:all 0.15s ease;display:block">
        <path d="M10 0C4.477 0 0 4.477 0 10c0 6.627 10 18 10 18S20 16.627 20 10C20 4.477 15.523 0 10 0z"
          fill="${color}" stroke="white" stroke-width="1.5"/>
        <circle cx="10" cy="10" r="3.5" fill="white" opacity="0.85"/>
      </svg>
    </div>`,
    iconSize: [w, h], iconAnchor: [w / 2, h], popupAnchor: [0, -h],
  });
}

// MapPageClient의 makePopupHtml과 동일
function makePopupHtml(event: Event, color: string): string {
  const priceText  = event.price === null ? "Free" : `A$${event.price}`;
  const url        = mapsUrl(event);
  const catLabel   = CATEGORY_META[event.category]?.label ?? event.category;
  const catBg      = CATEGORY_META[event.category]?.bg    ?? "#F4F6F8";
  const stateColor = STATE_META[event.location.state]?.color ?? "#8898AA";
  const stateLabel = STATE_META[event.location.state]?.label ?? event.location.state;
  const stateBg    = `${stateColor}18`;
  return `
    <div style="min-width:210px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;padding:2px 0">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">
        <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;margin-top:4px;display:inline-block"></span>
        <span style="font-weight:600;font-size:13px;color:#2C3E50;line-height:1.4">${event.title}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <span style="display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:${catBg};color:${color}">${catLabel}</span>
        <span style="display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:${stateBg};color:${stateColor}">${stateLabel}</span>
      </div>
      <a href="${url}" target="_blank" rel="noopener noreferrer"
        style="display:flex;align-items:center;gap:4px;font-size:12px;color:#0984E3;margin-bottom:3px;text-decoration:none;">
        📍 ${event.location.venue}, ${event.location.city} ${event.location.state}
        <span style="font-size:10px;opacity:0.7">↗</span>
      </a>
      <div style="font-size:12px;color:#8898AA;margin-bottom:6px">
        🗓 ${formatDate(event.date)}${event.time ? ` · ${event.time}` : ""}
      </div>
      <div style="display:inline-block;font-size:12px;font-weight:600;padding:2px 8px;border-radius:20px;margin-bottom:10px;
        background:${event.price === null ? "#E0F8F3" : "#FFF5F4"};color:${event.price === null ? "#00B894" : "#FF6B6B"}">
        ${priceText}
      </div>
      <div style="display:flex;gap:6px">
        ${event.website
          ? `<a href="${event.website}" target="_blank" rel="noopener noreferrer"
              style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
                padding:7px 10px;border-radius:8px;background:#FFF0EF;color:#FF6B6B;font-size:12px;font-weight:600;text-decoration:none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>홈페이지</a>`
          : `<span style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
              padding:7px 10px;border-radius:8px;background:#F4F6F8;color:#C0C0C0;font-size:12px;font-weight:600;cursor:not-allowed;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>홈페이지</span>`
        }
        ${event.ticketUrl
          ? `<a href="${event.ticketUrl}" target="_blank" rel="noopener noreferrer"
              style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
                padding:7px 10px;border-radius:8px;background:#E0F8F3;color:#00B894;font-size:12px;font-weight:600;text-decoration:none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                <path d="M13 5v2M13 17v2M13 11v2"/>
              </svg>티켓</a>`
          : `<span style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
              padding:7px 10px;border-radius:8px;background:#F4F6F8;color:#C0C0C0;font-size:12px;font-weight:600;cursor:not-allowed;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                <path d="M13 5v2M13 17v2M13 11v2"/>
              </svg>티켓</span>`
        }
      </div>
    </div>`;
}

// MapPageClient의 EventListItem과 동일
function EventListItem({ event, isActive, onClick }: { event: Event; isActive: boolean; onClick: () => void }) {
  const color = CATEGORY_COLORS[event.category] ?? "#FF6B6B";
  return (
    <div onClick={onClick} className="w-full text-left px-4 py-3 transition-all cursor-pointer"
      style={{
        backgroundColor: isActive ? "#FFF5F4" : "transparent",
        borderLeft: `3px solid ${isActive ? color : "transparent"}`,
        borderBottom: "1px solid var(--border)",
      }}>
      <div className="flex items-start gap-3">
        <span className="mt-1 shrink-0" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, display: "inline-block" }} />
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold truncate leading-snug flex-1"
              style={{ color: isActive ? color : "var(--text)" }}>{event.title}</p>
            <StarButton eventId={event.id} />
          </div>
          <div className="flex items-center gap-1 mt-1" style={{ color: "var(--text-muted)" }}>
            <MapPin size={11} />
            <span className="text-xs truncate">{event.location.venue}, {event.location.city}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
            <Clock size={11} />
            <span className="text-xs">{formatDate(event.date)}</span>
            {event.price === null ? (
              <span className="ml-1 text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "#E0F8F3", color: "#00B894" }}>Free</span>
            ) : (
              <span className="ml-1 text-xs" style={{ color: "var(--text-muted)" }}>A${event.price}</span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: CATEGORY_META[event.category]?.bg ?? "#F4F6F8", color: CATEGORY_META[event.category]?.color ?? "#8898AA" }}>
              {CATEGORY_META[event.category]?.label ?? event.category}
            </span>
            {event.location.state && STATE_META[event.location.state] && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${STATE_META[event.location.state].color}18`, color: STATE_META[event.location.state].color }}>
                {STATE_META[event.location.state].label}
              </span>
            )}
          </div>
          <div className="mt-auto pt-2 flex items-center gap-1.5 justify-end">
            {event.ticketUrl ? (
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{ color: "#00B894", backgroundColor: "#E0F8F3" }}>
                <Ticket size={11} />티켓
              </a>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ color: "#C0C0C0", backgroundColor: "#F4F6F8" }}>
                <Ticket size={11} />티켓
              </span>
            )}
            {event.website ? (
              <a href={event.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{ color: "var(--primary)", backgroundColor: "#FFF0EF" }}>
                <ExternalLink size={11} />홈페이지
              </a>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ color: "#C0C0C0", backgroundColor: "#F4F6F8" }}>
                <ExternalLink size={11} />홈페이지
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// MapPageClient의 LeafletMap과 동일
function LeafletMap({ events, selectedEvent, onSelect }: {
  events: Event[]; selectedEvent: Event | null; onSelect: (e: Event | null) => void;
}) {
  const containerRef    = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef          = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef      = useRef<Map<string, any>>(new Map());
  const prevSelectedRef = useRef<Event | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    import("leaflet").then(L => {
      if (cancelled || mapRef.current || !containerRef.current) return;
      const map = L.map(containerRef.current, { center: [-25.2744, 133.7751], zoom: 4 });
      mapRef.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: "abcd", maxZoom: 20,
      }).addTo(map);
      map.on("click", () => onSelect(null));
      setIsMapReady(true);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const map = mapRef.current;
    import("leaflet").then(L => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current.clear();
      events.forEach(event => {
        const { lat, lng } = event.location;
        if (!lat || !lng) return;
        const color  = CATEGORY_COLORS[event.category] ?? "#FF6B6B";
        const marker = L.marker([lat, lng], { icon: makeIcon(L, color, false) });
        marker.bindPopup(makePopupHtml(event, color), { maxWidth: 280 });
        marker.on("click", () => onSelect(event));
        marker.on("add", () => {
          const el = marker.getElement();
          if (el) { el.style.border = "none"; el.style.background = "transparent"; el.style.outline = "none"; el.style.boxShadow = "none"; }
        });
        marker.addTo(map);
        markersRef.current.set(event.id, marker);
      });
      if (prevSelectedRef.current) {
        const m = markersRef.current.get(prevSelectedRef.current.id);
        if (m) m.setIcon(makeIcon(L, CATEGORY_COLORS[prevSelectedRef.current.category] ?? "#FF6B6B", true));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady, events]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    import("leaflet").then(L => {
      if (prevSelectedRef.current) {
        const prev = markersRef.current.get(prevSelectedRef.current.id);
        if (prev) { prev.setIcon(makeIcon(L, CATEGORY_COLORS[prevSelectedRef.current.category] ?? "#FF6B6B", false)); prev.closePopup(); }
      }
      if (selectedEvent?.location.lat && selectedEvent?.location.lng) {
        const curr = markersRef.current.get(selectedEvent.id);
        if (curr) {
          curr.setIcon(makeIcon(L, CATEGORY_COLORS[selectedEvent.category] ?? "#FF6B6B", true));
          mapRef.current.flyTo([selectedEvent.location.lat, selectedEvent.location.lng], 13, { duration: 0.8 });
          mapRef.current.once("moveend", () => curr.openPopup());
        }
      }
      prevSelectedRef.current = selectedEvent;
    });
  }, [isMapReady, selectedEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}

function MapView({ events, view, setView }: {
  events: Event[];
  view: ViewMode;
  setView: (v: ViewMode) => void;
}) {
  const [selectedEvent, setSelected] = useState<Event | null>(null);
  const [query, setQuery]             = useState("");
  const [dropOpen, setDropOpen]       = useState(false);

  const views: ViewMode[] = ["My Events", "My 캘린더", "My 맵"];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return events;
    return events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.location.city.toLowerCase().includes(q) ||
      e.location.venue.toLowerCase().includes(q)
    );
  }, [events, query]);

  const handleSelect = useCallback((event: Event | null) => setSelected(event), []);

  return (
    <div className="-m-6 flex" style={{ height: "calc(100vh - 64px)" }}>

      {/* 좌측 패널 */}
      <div className="flex flex-col shrink-0"
        style={{ width: 320, borderRight: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>

        {/* 헤더 — 뷰 전환 드롭다운 포함 */}
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>★ Featured</h2>

            {/* 뷰 전환 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {view === "My Events"  && "🗂 My Events"}
                {view === "My 캘린더" && "📅 My 캘린더"}
                {view === "My 맵"     && "🗺 My 맵"}
                <ChevronDown size={12} />
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-lg overflow-hidden shadow-lg z-[9999]"
                  style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
                  {views.map(v => (
                    <button key={v} onClick={() => { setView(v); setDropOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: view === v ? "#FFF0EF" : "transparent",
                        color: view === v ? "var(--primary)" : "var(--text)",
                        fontWeight: view === v ? 600 : 400,
                      }}>
                      {v === "My Events"  && "🗂 My Events"}
                      {v === "My 캘린더" && "📅 My 캘린더"}
                      {v === "My 맵"     && "🗺 My 맵"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 검색 */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
            <MapPin size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              type="text" placeholder="이벤트 검색..." value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "var(--text)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ color: "var(--text-muted)" }}><X size={13} /></button>
            )}
          </div>
        </div>

        {/* 이벤트 수 */}
        <div className="px-4 py-2 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>즐겨찾기 이벤트</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--primary)", color: "#fff" }}>
            {filtered.length}
          </span>
        </div>

        {/* 이벤트 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "var(--text-muted)" }}>
              <Star size={32} style={{ opacity: 0.2 }} />
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          ) : (
            filtered.map(event => (
              <EventListItem key={event.id} event={event}
                isActive={selectedEvent?.id === event.id}
                onClick={() => handleSelect(selectedEvent?.id === event.id ? null : event)} />
            ))
          )}
        </div>
      </div>

      {/* 지도 */}
      <div className="flex-1 relative">
        <LeafletMap events={filtered} selectedEvent={selectedEvent} onSelect={handleSelect} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────────────────────
export default function FeaturedClient({ allEvents }: { allEvents: Event[] }) {
  const { isStarred, ready } = useStarred();
  const [view, setView]         = useState<ViewMode>("My Events");
  const [open, setOpen]         = useState(false);
  const [activeCategory, setCategory] = useState("all");

  const views: ViewMode[] = ["My Events", "My 캘린더", "My 맵"];

  const starredEvents = ready ? allEvents.filter(e => isStarred(e.id)) : [];

  const categoryFilteredEvents = useMemo(() =>
    activeCategory === "all"
      ? starredEvents
      : starredEvents.filter(e => e.category === activeCategory),
    [starredEvents, activeCategory]
  );

  // 실제로 별표된 이벤트가 있는 카테고리만 표시
  const activeCategories = useMemo(() => {
    const cats = new Set(starredEvents.map(e => e.category));
    return ["all", ...Object.keys(CATEGORY_META).filter(k => k !== "all" && cats.has(k as never))];
  }, [starredEvents]);

  // 맵 뷰는 자체 레이아웃(좌측 패널)에 드롭다운이 있으므로 여기서 바로 렌더링
  if (view === "My 맵") {
    return ready && starredEvents.length > 0
      ? <MapView events={starredEvents} view={view} setView={setView} />
      : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>★ Featured</h1>
          </div>
          <EmptyState />
        </div>
      );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>★ Featured</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {starredEvents.length}개의 즐겨찾기 이벤트
          </p>
        </div>

        {/* 뷰 선택 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text)" }}>
            {view === "My Events"  && "🗂 My Events"}
            {view === "My 캘린더" && "📅 My 캘린더"}
            <ChevronDown size={14} />
          </button>
          {open && (
            <div className="absolute right-0 mt-1 w-40 rounded-lg overflow-hidden shadow-lg z-50"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
              {views.map(v => (
                <button key={v} onClick={() => { setView(v); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: view === v ? "#FFF0EF" : "transparent",
                    color: view === v ? "var(--primary)" : "var(--text)",
                    fontWeight: view === v ? 600 : 400,
                  }}>
                  {v === "My Events"  && "🗂 My Events"}
                  {v === "My 캘린더" && "📅 My 캘린더"}
                  {v === "My 맵"     && "🗺 My 맵"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Events 카테고리 필터 아이콘 */}
      {view === "My Events" && ready && starredEvents.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeCategories.map(cat => {
            const meta   = CATEGORY_META[cat];
            const icon   = CATEGORY_ICONS[cat] ?? "🎪";
            const count  = cat === "all" ? starredEvents.length : starredEvents.filter(e => e.category === cat).length;
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: active ? meta.color : meta.bg,
                  color: active ? "#fff" : meta.color,
                  border: `1px solid ${active ? meta.color : "transparent"}`,
                }}>
                <span>{icon}</span>
                <span>{meta.label}</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: active ? "rgba(255,255,255,0.25)" : `${meta.color}22`, color: active ? "#fff" : meta.color }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 뷰 렌더링 */}
      {!ready ? (
        <div className="flex justify-center py-24" style={{ color: "var(--text-muted)" }}>
          <p>로딩 중...</p>
        </div>
      ) : starredEvents.length === 0 ? (
        <EmptyState />
      ) : view === "My Events" ? (
        categoryFilteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm">해당 카테고리의 즐겨찾기 이벤트가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryFilteredEvents.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )
      ) : (
        <CalendarView events={starredEvents} />
      )}
    </div>
  );
}
