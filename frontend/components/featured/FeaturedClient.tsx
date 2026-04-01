"use client";

import { useState, useEffect, useRef } from "react";
import { useStarred } from "@/hooks/useStarred";
import type { Event } from "@/lib/types";
import EventCard from "@/components/events/EventCard";
import { CATEGORY_META, STATE_META } from "@/lib/mock-data";
import { Ticket, ExternalLink, MapPin, Clock, Star, ChevronDown } from "lucide-react";
import StarButton from "@/components/featured/StarButton";

type ViewMode = "카테고리" | "캘린더" | "맵";

// ─── 날짜 포맷 ─────────────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

// ─── 캘린더 뷰: 날짜별 그룹 ──────────────────────────────────────────────────
function CalendarView({ events }: { events: Event[] }) {
  // 날짜별 그룹
  const groups: Record<string, Event[]> = {};
  for (const e of events) {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  }
  const dates = Object.keys(groups).sort();

  if (dates.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-6">
      {dates.map(date => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: "var(--primary)", color: "#fff" }}>
              {new Date(date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long" })}
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{groups[date].length}개</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups[date].map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 맵 뷰: Leaflet ──────────────────────────────────────────────────────────
function MapView({ events }: { events: Event[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<unknown>(null);
  const [selected, setSelected] = useState<Event | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    let cancelled = false;

    import("leaflet").then(L => {
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current).setView([-25.2744, 133.7751], 4);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 18,
      }).addTo(map);
      leafletRef.current = map;

      for (const event of events) {
        const { lat, lng } = event.location;
        if (!lat || !lng) continue;
        const color = CATEGORY_META[event.category]?.color ?? "#FF6B6B";
        const icon = L.divIcon({
          html: `<div style="background:transparent;border:none"><svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.6 14 22 14 22s14-12.4 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/><circle cx="14" cy="14" r="6" fill="white"/></svg></div>`,
          className: "",
          iconSize: [28, 36],
          iconAnchor: [14, 36],
        });
        const marker = L.marker([lat, lng], { icon });
        marker.on("click", () => setSelected(event));
        marker.addTo(map);
      }
    });

    return () => { cancelled = true; };
  }, [events]);

  return (
    <div className="flex gap-4 h-[600px]">
      {/* 지도 */}
      <div ref={mapRef} className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }} />
      {/* 선택된 이벤트 패널 */}
      <div className="w-72 flex flex-col gap-2 overflow-y-auto">
        {selected ? (
          <EventCard event={selected} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full"
            style={{ color: "var(--text-muted)" }}>
            <MapPin size={32} style={{ opacity: 0.3 }} />
            <p className="text-sm mt-2">핀을 클릭하면<br />이벤트 상세가 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
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

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function FeaturedClient({ allEvents }: { allEvents: Event[] }) {
  const { starred, isStarred, ready } = useStarred();
  const [view, setView] = useState<ViewMode>("카테고리");
  const [open, setOpen] = useState(false);

  const views: ViewMode[] = ["카테고리", "캘린더", "맵"];

  const starredEvents = ready
    ? allEvents.filter(e => isStarred(e.id))
    : [];

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            ★ Featured
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {starredEvents.length}개의 즐겨찾기 이벤트
          </p>
        </div>

        {/* 뷰 선택 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            {view === "카테고리" && "🗂 카테고리"}
            {view === "캘린더" && "📅 캘린더"}
            {view === "맵" && "🗺 맵"}
            <ChevronDown size={14} />
          </button>
          {open && (
            <div
              className="absolute right-0 mt-1 w-36 rounded-lg overflow-hidden shadow-lg z-50"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              {views.map(v => (
                <button
                  key={v}
                  onClick={() => { setView(v); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: view === v ? "#FFF0EF" : "transparent",
                    color: view === v ? "var(--primary)" : "var(--text)",
                    fontWeight: view === v ? 600 : 400,
                  }}
                >
                  {v === "카테고리" && "🗂 카테고리"}
                  {v === "캘린더" && "📅 캘린더"}
                  {v === "맵" && "🗺 맵"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 뷰 렌더링 */}
      {!ready ? (
        <div className="flex justify-center py-24" style={{ color: "var(--text-muted)" }}>
          <p>로딩 중...</p>
        </div>
      ) : starredEvents.length === 0 ? (
        <EmptyState />
      ) : view === "카테고리" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {starredEvents.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      ) : view === "캘린더" ? (
        <CalendarView events={starredEvents} />
      ) : (
        <MapView events={starredEvents} />
      )}
    </div>
  );
}
