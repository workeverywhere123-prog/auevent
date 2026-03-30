"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, MapPin, Clock, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Event } from "@/lib/types";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  music:    "#E84040",
  food:     "#FF7F00",
  sports:   "#00B894",
  arts:     "#E07A5F",
  cultural: "#F9CA24",
  markets:  "#0984E3",
  comedy:   "#E91E8C",
  film:     "#2D3436",
};

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  all:      { label: "전체",     color: "#8898AA", bg: "#F4F6F8" },
  music:    { label: "Music",    color: "#E84040", bg: "#FDE8E8" },
  food:     { label: "Food",     color: "#FF7F00", bg: "#FFF3E0" },
  sports:   { label: "Sports",   color: "#00B894", bg: "#E0F8F3" },
  arts:     { label: "Arts",     color: "#E07A5F", bg: "#FCF0ED" },
  cultural: { label: "Cultural", color: "#F9CA24", bg: "#FFFDE0" },
  markets:  { label: "Markets",  color: "#0984E3", bg: "#E0F0FD" },
  comedy:   { label: "Comedy",   color: "#E91E8C", bg: "#FCE4F3" },
  film:     { label: "Film",     color: "#2D3436", bg: "#EAECEC" },
};

const STATE_META: Record<string, {
  label: string; fullName: string; color: string;
  center: [number, number]; zoom: number;
}> = {
  all: { label: "전체", fullName: "All States",         color: "#8898AA", center: [-25.2744, 133.7751], zoom: 4  },
  NSW: { label: "NSW",  fullName: "New South Wales",    color: "#0984E3", center: [-32.0,   146.5],     zoom: 6  },
  VIC: { label: "VIC",  fullName: "Victoria",           color: "#6C5CE7", center: [-37.0,   144.5],     zoom: 7  },
  QLD: { label: "QLD",  fullName: "Queensland",         color: "#FF7F00", center: [-22.0,   144.5],     zoom: 5  },
  WA:  { label: "WA",   fullName: "Western Australia",  color: "#00B894", center: [-26.0,   121.5],     zoom: 5  },
  SA:  { label: "SA",   fullName: "South Australia",    color: "#E84040", center: [-30.0,   135.5],     zoom: 6  },
  TAS: { label: "TAS",  fullName: "Tasmania",           color: "#2D9CDB", center: [-42.0,   146.5],     zoom: 7  },
  ACT: { label: "ACT",  fullName: "ACT",                color: "#E91E8C", center: [-35.47,  149.0],     zoom: 10 },
  NT:  { label: "NT",   fullName: "Northern Territory", color: "#E6A817", center: [-19.5,   133.0],     zoom: 6  },
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
    const end = new Date(today);
    end.setDate(today.getDate() + 6);
    return { from: today, to: end };
  }
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from: today, to: end };
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
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate leading-snug"
            style={{ color: isActive ? color : "var(--text)" }}>
            {event.title}
          </p>
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
        </div>
      </div>
    </button>
  );
}

// ─── LeafletMap 헬퍼 ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeIcon(L: any, color: string, selected: boolean) {
  const size = selected ? 18 : 12;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:${selected
        ? `0 0 0 3px ${color}55,0 2px 8px rgba(0,0,0,0.3)`
        : "0 1px 4px rgba(0,0,0,0.25)"};
      cursor:pointer;transition:all 0.15s ease;
    "></div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2) - 4],
  });
}

function makePopupHtml(event: Event, color: string): string {
  const priceText = event.price === null ? "Free" : `A$${event.price}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.location.venue}, ${event.location.city} ${event.location.state} Australia`
  )}`;
  return `
    <div style="min-width:210px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;padding:2px 0">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">
        <span style="width:8px;height:8px;border-radius:50%;background:${color};
          flex-shrink:0;margin-top:4px;display:inline-block"></span>
        <span style="font-weight:600;font-size:13px;color:#2C3E50;line-height:1.4">${event.title}</span>
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
      <div>
        ${event.website
          ? `<a href="${event.website}" target="_blank" rel="noopener noreferrer"
              style="display:block;text-align:center;padding:7px 12px;border-radius:8px;
                background:#FF6B6B;color:#fff;font-size:12px;font-weight:600;text-decoration:none;">
              🔗 공식 홈페이지 바로가기
            </a>`
          : `<span style="display:block;text-align:center;padding:7px 12px;border-radius:8px;
              background:#F4F6F8;color:#8898AA;font-size:12px;">홈페이지 정보 없음</span>`
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
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
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
  const [activeState, setState]       = useState("all");
  const [selectedEvent, setSelected]  = useState<Event | null>(null);

  const activeFilterCount = [
    activeCategory !== "all",
    activeDatePreset !== "all",
    activeState !== "all",
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const dateRange = getDateRange(activeDatePreset);
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
  }, [events, query, activeCategory, activeDatePreset, activeState]);

  const handleEventClick = useCallback((event: Event) => {
    setSelected((prev) => (prev?.id === event.id ? null : event));
  }, []);

  const resetAll = () => {
    setQuery(""); setCategory("all"); setDate("all"); setState("all"); setSelected(null);
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
        <FilterSection title="날짜" badge={activeDatePreset !== "all"
          ? DATE_PRESETS.find((d) => d.value === activeDatePreset)?.label : undefined}>
          <div className="grid grid-cols-2 gap-1.5">
            {DATE_PRESETS.map(({ value, label }) => {
              const active = activeDatePreset === value;
              return (
                <button key={value} onClick={() => setDate(value)}
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
