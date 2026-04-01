"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, MapPin, Clock, X, ChevronDown, ChevronUp, ExternalLink, Ticket } from "lucide-react";
import StarButton from "@/components/featured/StarButton";
import type { Event } from "@/lib/types";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  music:    "#E84040",
  food:     "#F97316",
  sports:   "#22C55E",
  arts:     "#8B5CF6",
  cultural: "#EAB308",
  markets:  "#3B82F6",
  comedy:   "#06B6D4",
  film:     "#64748B",
};

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  all:      { label: "전체",     color: "#8898AA", bg: "#F4F6F8" },
  music:    { label: "Music",    color: "#E84040", bg: "#FDE8E8" },
  food:     { label: "Food",     color: "#F97316", bg: "#FFF0E6" },
  sports:   { label: "Sports",   color: "#22C55E", bg: "#DCFCE7" },
  arts:     { label: "Arts",     color: "#8B5CF6", bg: "#F3E8FF" },
  cultural: { label: "Cultural", color: "#EAB308", bg: "#FEF9C3" },
  markets:  { label: "Markets",  color: "#3B82F6", bg: "#DBEAFE" },
  comedy:   { label: "Comedy",   color: "#06B6D4", bg: "#CFFAFE" },
  film:     { label: "Film",     color: "#64748B", bg: "#F1F5F9" },
};

const STATE_META: Record<string, {
  label: string; fullName: string; color: string;
  center: [number, number]; zoom: number;
}> = {
  all: { label: "전체", fullName: "All States",         color: "#94A3B8", center: [-25.2744, 133.7751], zoom: 4  },
  NSW: { label: "NSW",  fullName: "New South Wales",    color: "#C2185B", center: [-32.0,   146.5],     zoom: 6  },
  VIC: { label: "VIC",  fullName: "Victoria",           color: "#4B2E2E", center: [-37.0,   144.5],     zoom: 7  },
  QLD: { label: "QLD",  fullName: "Queensland",         color: "#556B2F", center: [-22.0,   144.5],     zoom: 5  },
  WA:  { label: "WA",   fullName: "Western Australia",  color: "#B8860B", center: [-26.0,   121.5],     zoom: 5  },
  SA:  { label: "SA",   fullName: "South Australia",    color: "#8B0000", center: [-30.0,   135.5],     zoom: 6  },
  TAS: { label: "TAS",  fullName: "Tasmania",           color: "#2F4F4F", center: [-42.0,   146.5],     zoom: 7  },
  ACT: { label: "ACT",  fullName: "ACT",                color: "#A0522D", center: [-35.47,  149.0],     zoom: 10 },
  NT:  { label: "NT",   fullName: "Northern Territory", color: "#483D8B", center: [-19.5,   133.0],     zoom: 6  },
};

type DatePreset = "all" | "today" | "week" | "month";
const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "all",   label: "전체"    },
  { value: "today", label: "오늘"    },
  { value: "week",  label: "이번 주" },
  { value: "month", label: "이번 달" },
];

// ─── 유틸 ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getDateRange(preset: DatePreset): { from: Date; to: Date } | null {
  if (preset === "all") return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (preset === "today") return { from: today, to: today };
  if (preset === "week") {
    // 이번 주 월요일 ~ 일요일 (오늘 포함)
    const day = today.getDay(); // 0=일, 1=월 ... 6=토
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7)); // 이번 주 월요일
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: monday, to: sunday };
  }
  // 이번 달 1일 ~ 말일, 단 이번 주가 달을 넘어가면 그 일요일까지 포함
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const day = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + (7 - ((day + 6) % 7)) % 7); // 이번 주 일요일
  const to = sunday > monthEnd ? sunday : monthEnd;
  return { from, to };
}

// ─── FilterSection ────────────────────────────────────────────────────────────

function FilterSection({
  title, badge, children,
}: {
  title: string; badge?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: "#FFFAF5" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{title}</span>
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--primary)", color: "#fff" }}>
              {badge}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp size={13} style={{ color: "var(--text-muted)" }} />
          : <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />}
      </button>
      {open && <div className="px-4 pb-3 pt-1">{children}</div>}
    </div>
  );
}

// ─── EventListItem ────────────────────────────────────────────────────────────

function EventListItem({ event, isActive, onClick }: {
  event: Event; isActive: boolean; onClick: () => void;
}) {
  const color = CATEGORY_COLORS[event.category] ?? "#FF6B6B";
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 transition-all"
      style={{
        backgroundColor: isActive ? "#FFF5F4" : "transparent",
        borderLeft: `3px solid ${isActive ? color : "transparent"}`,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 shrink-0" style={{
          width: 8, height: 8, borderRadius: "50%",
          backgroundColor: color, display: "inline-block",
        }} />
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold truncate leading-snug flex-1"
              style={{ color: isActive ? color : "var(--text)" }}>
              {event.title}
            </p>
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
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: CATEGORY_META[event.category]?.bg ?? "#F4F6F8",
                color: CATEGORY_META[event.category]?.color ?? "#8898AA",
              }}
            >
              {CATEGORY_META[event.category]?.label ?? event.category}
            </span>
            {event.location.state && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: STATE_META[event.location.state]?.color
                    ? `${STATE_META[event.location.state].color}18`
                    : "#F4F6F8",
                  color: STATE_META[event.location.state]?.color ?? "#8898AA",
                }}
              >
                {STATE_META[event.location.state]?.label ?? event.location.state}
              </span>
            )}
          </div>
          {/* 홈페이지 + 티켓 버튼 — 오른쪽 맨 하단 */}
          <div className="mt-auto pt-2 flex items-center gap-1.5 justify-end">
            {event.ticketUrl ? (
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
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
              <a href={event.website} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
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
    </button>
  );
}

// ─── LeafletMap 헬퍼 ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeIcon(L: any, color: string, selected: boolean) {
  const w = selected ? 26 : 18;
  const h = selected ? 34 : 24;
  const shadow = selected
    ? `filter:drop-shadow(0 0 4px ${color}88) drop-shadow(0 2px 6px rgba(0,0,0,0.35))`
    : `filter:drop-shadow(0 1px 3px rgba(0,0,0,0.3))`;
  return L.divIcon({
    className: "",
    html: `
      <div style="background:transparent;border:none;padding:0;margin:0;line-height:0">
        <svg width="${w}" height="${h}" viewBox="0 0 20 28"
          xmlns="http://www.w3.org/2000/svg"
          style="cursor:pointer;${shadow};transition:all 0.15s ease;display:block">
          <path d="M10 0C4.477 0 0 4.477 0 10c0 6.627 10 18 10 18S20 16.627 20 10C20 4.477 15.523 0 10 0z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
          <circle cx="10" cy="10" r="3.5" fill="white" opacity="0.85"/>
        </svg>
      </div>`,
    iconSize:    [w, h],
    iconAnchor:  [w / 2, h],
    popupAnchor: [0, -h],
  });
}

function makePopupHtml(event: Event, color: string): string {
  const priceText = event.price === null ? "Free" : `A$${event.price}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.location.venue}, ${event.location.city} ${event.location.state} Australia`
  )}`;
  const catLabel   = CATEGORY_META[event.category]?.label ?? event.category;
  const catBg      = CATEGORY_META[event.category]?.bg    ?? "#F4F6F8";
  const stateColor = STATE_META[event.location.state]?.color ?? "#8898AA";
  const stateLabel = STATE_META[event.location.state]?.label ?? event.location.state;
  const stateBg    = `${stateColor}18`;
  return `
    <div style="min-width:210px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;padding:2px 0">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">
        <span style="width:8px;height:8px;border-radius:50%;background:${color};
          flex-shrink:0;margin-top:4px;display:inline-block"></span>
        <span style="font-weight:600;font-size:13px;color:#2C3E50;line-height:1.4">${event.title}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <span style="display:inline-block;font-size:11px;font-weight:600;
          padding:2px 8px;border-radius:20px;
          background:${catBg};color:${color}">
          ${catLabel}
        </span>
        <span style="display:inline-block;font-size:11px;font-weight:600;
          padding:2px 8px;border-radius:20px;
          background:${stateBg};color:${stateColor}">
          ${stateLabel}
        </span>
      </div>
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
        style="display:flex;align-items:center;gap:4px;font-size:12px;color:#0984E3;
          margin-bottom:3px;text-decoration:none;">
        📍 ${event.location.venue}, ${event.location.city} ${event.location.state}
        <span style="font-size:10px;opacity:0.7">↗</span>
      </a>
      <div style="font-size:12px;color:#8898AA;margin-bottom:6px">
        🗓 ${formatDate(event.date)}${event.time ? ` · ${event.time}` : ""}
      </div>
      <div style="display:inline-block;font-size:12px;font-weight:600;
        padding:2px 8px;border-radius:20px;margin-bottom:10px;
        background:${event.price === null ? "#E0F8F3" : "#FFF5F4"};
        color:${event.price === null ? "#00B894" : "#FF6B6B"}">
        ${priceText}
      </div>
      <div style="display:flex;gap:6px">
        ${event.website
          ? `<a href="${event.website}" target="_blank" rel="noopener noreferrer"
              style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
                padding:7px 10px;border-radius:8px;background:#FFF0EF;
                color:#FF6B6B;font-size:12px;font-weight:600;text-decoration:none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              홈페이지
            </a>`
          : `<span style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
              padding:7px 10px;border-radius:8px;background:#F4F6F8;
              color:#C0C0C0;font-size:12px;font-weight:600;cursor:not-allowed;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              홈페이지
            </span>`
        }
        ${event.ticketUrl
          ? `<a href="${event.ticketUrl}" target="_blank" rel="noopener noreferrer"
              style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
                padding:7px 10px;border-radius:8px;background:#E0F8F3;
                color:#00B894;font-size:12px;font-weight:600;text-decoration:none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                <path d="M13 5v2M13 17v2M13 11v2"/>
              </svg>
              티켓
            </a>`
          : `<span style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
              padding:7px 10px;border-radius:8px;background:#F4F6F8;
              color:#C0C0C0;font-size:12px;font-weight:600;cursor:not-allowed;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                <path d="M13 5v2M13 17v2M13 11v2"/>
              </svg>
              티켓
            </span>`
        }
      </div>
    </div>`;
}

// ─── LeafletMap ──────────────────────────────────────────────────────────────

function LeafletMap({ events, selectedEvent, onSelect, activeState }: {
  events: Event[];
  selectedEvent: Event | null;
  onSelect: (e: Event | null) => void;
  activeState: string;
}) {
  const containerRef   = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef         = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef     = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prevSelectedRef = useRef<Event | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // ① 지도 초기화 (1회)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false; // StrictMode 이중 실행 방지

    import("leaflet").then((L) => {
      if (cancelled || mapRef.current || !containerRef.current) return;
      const map = L.map(containerRef.current, { center: [-25.2744, 133.7751], zoom: 4 });
      mapRef.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
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

  // ② 마커 생성 — events 변경 시만 (selectedEvent 제외)
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const map = mapRef.current;
    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();

      events.forEach((event) => {
        const { lat, lng } = event.location;
        if (!lat || !lng) return;
        const color  = CATEGORY_COLORS[event.category] ?? "#FF6B6B";
        const marker = L.marker([lat, lng], { icon: makeIcon(L, color, false) });
        marker.bindPopup(makePopupHtml(event, color), { maxWidth: 280 });
        marker.on("click", () => onSelect(event));
        marker.addTo(map);
        // Leaflet이 동적으로 추가하는 기본 border/background 강제 제거
        marker.on("add", () => {
          const el = marker.getElement();
          if (el) {
            el.style.border = "none";
            el.style.background = "transparent";
            el.style.outline = "none";
            el.style.boxShadow = "none";
          }
        });
        markersRef.current.set(event.id, marker);
      });

      // 마커 재생성 후 선택 상태 복원
      if (prevSelectedRef.current) {
        const m = markersRef.current.get(prevSelectedRef.current.id);
        if (m) {
          const color = CATEGORY_COLORS[prevSelectedRef.current.category] ?? "#FF6B6B";
          m.setIcon(makeIcon(L, color, true));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady, events]);

  // ③ 선택 변경 — 이전 마커 복원 + 새 마커 강조 + flyTo + 팝업
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    import("leaflet").then((L) => {
      // 이전 선택 마커 원래 크기로 복원
      if (prevSelectedRef.current) {
        const prev = markersRef.current.get(prevSelectedRef.current.id);
        if (prev) {
          const c = CATEGORY_COLORS[prevSelectedRef.current.category] ?? "#FF6B6B";
          prev.setIcon(makeIcon(L, c, false));
          prev.closePopup();
        }
      }

      if (selectedEvent?.location.lat && selectedEvent?.location.lng) {
        const curr = markersRef.current.get(selectedEvent.id);
        if (curr) {
          const c = CATEGORY_COLORS[selectedEvent.category] ?? "#FF6B6B";
          curr.setIcon(makeIcon(L, c, true));
          mapRef.current.flyTo(
            [selectedEvent.location.lat, selectedEvent.location.lng],
            13,
            { duration: 0.8 }
          );
          // flyTo 애니메이션 후 팝업 오픈
          mapRef.current.once("moveend", () => curr.openPopup());
        }
      }

      prevSelectedRef.current = selectedEvent;
    });
  }, [isMapReady, selectedEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  // ④ 지역 필터 → 지도 이동
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const meta = STATE_META[activeState];
    if (meta) mapRef.current.flyTo(meta.center, meta.zoom, { duration: 1.2 });
  }, [isMapReady, activeState]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

export default function MapPageClient({ events }: { events: Event[] }) {
  const [query, setQuery]             = useState("");
  const [activeCategory, setCategory] = useState("all");
  const [activeDatePreset, setDate]   = useState<DatePreset>("all");
  const [customFrom, setCustomFrom]   = useState("");
  const [customTo, setCustomTo]       = useState("");
  const [activeState, setState]       = useState("all");
  const [selectedEvent, setSelected]  = useState<Event | null>(null);

  const hasCustomRange = customFrom !== "" || customTo !== "";

  const activeFilterCount = [
    activeCategory !== "all",
    activeDatePreset !== "all" || hasCustomRange,
    activeState !== "all",
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    // 커스텀 범위가 있으면 우선 적용, 아니면 프리셋 사용
    let dateRange: { from: Date; to: Date } | null = null;
    if (customFrom || customTo) {
      const from = customFrom ? new Date(customFrom) : new Date("1970-01-01");
      const to   = customTo   ? new Date(customTo)   : new Date("2099-12-31");
      from.setHours(0, 0, 0, 0); to.setHours(0, 0, 0, 0);
      dateRange = { from, to };
    } else {
      dateRange = getDateRange(activeDatePreset);
    }
    return events.filter((e) => {
      if (q && !(
        e.title.toLowerCase().includes(q) ||
        e.location.city.toLowerCase().includes(q) ||
        e.location.venue.toLowerCase().includes(q) ||
        e.location.state.toLowerCase().includes(q)
      )) return false;
      if (activeCategory !== "all" && e.category !== activeCategory) return false;
      if (dateRange) {
        const d = new Date(e.date); d.setHours(0, 0, 0, 0);
        if (d < dateRange.from || d > dateRange.to) return false;
      }
      if (activeState !== "all" && e.location.state !== activeState) return false;
      return true;
    });
  }, [events, query, activeCategory, activeDatePreset, customFrom, customTo, activeState]);

  const handleEventClick = useCallback((event: Event) => {
    setSelected((prev) => (prev?.id === event.id ? null : event));
  }, []);

  const resetAll = () => {
    setQuery(""); setCategory("all"); setDate("all");
    setCustomFrom(""); setCustomTo(""); setState("all"); setSelected(null);
  };

  return (
    <div className="-m-6 flex" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── 좌측 패널 ── */}
      <div className="flex flex-col shrink-0"
        style={{ width: 320, borderRight: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>

        {/* 제목 + 검색 */}
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>🗺 Event Map</h2>
            {activeFilterCount > 0 && (
              <button onClick={resetAll}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ color: "var(--primary)", backgroundColor: "#FFF0EF" }}>
                <X size={11} />초기화
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "#FFF5F4", border: "1.5px solid var(--border)" }}>
            <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="이벤트, 장소, 도시 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text)" }}
            />
            {query && <button onClick={() => setQuery("")}><X size={13} style={{ color: "var(--text-muted)" }} /></button>}
          </div>
        </div>

        {/* 장르 필터 */}
        <FilterSection title="장르" badge={activeCategory !== "all" ? CATEGORY_META[activeCategory]?.label : undefined}>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const active = activeCategory === key;
              return (
                <button key={key} onClick={() => setCategory(key)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: active ? meta.color : meta.bg,
                    color: active ? "#fff" : meta.color,
                  }}>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* 날짜 필터 */}
        <FilterSection title="날짜" badge={
          hasCustomRange ? "직접 설정" :
          activeDatePreset !== "all" ? DATE_PRESETS.find((d) => d.value === activeDatePreset)?.label : undefined
        }>
          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            {DATE_PRESETS.map(({ value, label }) => {
              const active = activeDatePreset === value && !hasCustomRange;
              return (
                <button key={value} onClick={() => { setDate(value); setCustomFrom(""); setCustomTo(""); }}
                  className="py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: active ? "var(--primary)" : "#FFF5F4",
                    color: active ? "#fff" : "var(--primary)",
                    border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
          {/* 직접 날짜 범위 입력 */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>직접 설정</p>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => { setCustomFrom(e.target.value); setDate("all"); }}
                className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none"
                style={{
                  border: `1px solid ${customFrom ? "var(--primary)" : "var(--border)"}`,
                  backgroundColor: "#FFF5F4",
                  color: "var(--text)",
                }}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>~</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => { setCustomTo(e.target.value); setDate("all"); }}
                className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none"
                style={{
                  border: `1px solid ${customTo ? "var(--primary)" : "var(--border)"}`,
                  backgroundColor: "#FFF5F4",
                  color: "var(--text)",
                }}
              />
              {hasCustomRange && (
                <button onClick={() => { setCustomFrom(""); setCustomTo(""); }}
                  className="p-1 rounded-md"
                  style={{ color: "var(--text-muted)" }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </FilterSection>

        {/* 지역 필터 */}
        <FilterSection title="지역" badge={activeState !== "all" ? activeState : undefined}>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(STATE_META).map(([key, meta]) => {
              const active = activeState === key;
              return (
                <button key={key} title={meta.fullName} onClick={() => setState(key)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: active ? meta.color : "#fff",
                    color: active ? "#fff" : meta.color,
                    border: `1px solid ${active ? meta.color : "#E8ECF0"}`,
                  }}>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* 결과 수 */}
        <div className="px-4 py-2 text-xs font-medium flex items-center justify-between"
          style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)", backgroundColor: "#FFFAF5" }}>
          <span>{filtered.length}개 이벤트</span>
          {activeFilterCount > 0 && (
            <span style={{ color: "var(--primary)" }}>필터 {activeFilterCount}개 적용 중</span>
          )}
        </div>

        {/* 이벤트 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2"
              style={{ color: "var(--text-muted)" }}>
              <span className="text-2xl">🔍</span>
              <span className="text-sm">검색 결과 없음</span>
            </div>
          ) : (
            filtered.map((event) => (
              <EventListItem
                key={event.id}
                event={event}
                isActive={selectedEvent?.id === event.id}
                onClick={() => handleEventClick(event)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── 우측 지도 ── */}
      <div className="flex-1 relative">
        <LeafletMap
          events={filtered}
          selectedEvent={selectedEvent}
          onSelect={setSelected}
          activeState={activeState}
        />
      </div>
    </div>
  );
}
