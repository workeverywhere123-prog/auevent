import type { Event } from "@/lib/types";
import CategoryBadge from "./CategoryBadge";
import { CATEGORY_META, STATE_META } from "@/lib/mock-data";
import { Ticket, ExternalLink } from "lucide-react";
import StarButton from "@/components/featured/StarButton";
import { safeUrl } from "@/lib/utils/url";

type Props = {
  event: Event;
  compact?: boolean;
};

function mapsUrl(event: Event) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.location.venue}, ${event.location.city} ${event.location.state} Australia`
  )}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** 캘린더 스타일과 동일한 pill 버튼 쌍 — 오른쪽 정렬 */
function ActionButtons({ website, ticketUrl }: { website?: string; ticketUrl?: string }) {
  return (
    <div className="flex items-center gap-1.5 ml-auto">
      {safeUrl(ticketUrl) ? (
        <a href={safeUrl(ticketUrl)!} target="_blank" rel="noopener noreferrer"
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
      {safeUrl(website) ? (
        <a href={safeUrl(website)!} target="_blank" rel="noopener noreferrer"
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
  );
}

export default function EventCard({ event, compact = false }: Props) {
  const meta = CATEGORY_META[event.category];

  if (compact) {
    return (
      <div
        className="rounded-lg p-3 flex gap-3 items-start"
        style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}
      >
        <div
          className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <span className="text-xs font-bold leading-none">
            {new Date(event.date).getDate()}
          </span>
          <span className="text-[10px] leading-none uppercase">
            {new Date(event.date).toLocaleString("en-AU", { month: "short" })}
          </span>
        </div>
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex items-start gap-1 mb-0.5">
            <p className="text-sm font-semibold truncate flex-1" style={{ color: "var(--text)" }}>
              {event.title}
            </p>
            <StarButton eventId={event.id} />
          </div>
          <a
            href={mapsUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-0.5 truncate flex items-center gap-1"
            style={{ color: "#0984E3", textDecoration: "none" }}
          >
            📍 {event.location.city}, {event.location.state}
            <span style={{ fontSize: 10, opacity: 0.7 }}>↗</span>
          </a>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={event.category} />
            {event.location.state && STATE_META[event.location.state] && (
              <span
                className="inline-block rounded-full font-medium px-2 py-0.5 text-xs"
                style={{
                  color: STATE_META[event.location.state].color,
                  backgroundColor: `${STATE_META[event.location.state].color}18`,
                }}
              >
                {STATE_META[event.location.state].label}
              </span>
            )}
          </div>
          <div className="mt-auto pt-2 flex justify-end">
            <ActionButtons website={event.website} ticketUrl={event.ticketUrl} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow hover:shadow-md flex flex-col"
      style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}
    >
      {/* Image / Placeholder */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: meta.bg }}
          >
            <span className="text-5xl" style={{ opacity: 0.18 }}>🎪</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: meta.color }} />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-snug flex-1" style={{ color: "var(--text)" }}>
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <StarButton eventId={event.id} />
            <CategoryBadge category={event.category} />
            {event.location.state && STATE_META[event.location.state] && (
              <span
                className="inline-block rounded-full font-medium px-2 py-0.5 text-xs"
                style={{
                  color: STATE_META[event.location.state].color,
                  backgroundColor: `${STATE_META[event.location.state].color}18`,
                }}
              >
                {STATE_META[event.location.state].label}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs line-clamp-2 mb-3" style={{ color: "var(--text-muted)" }}>
          {event.description}
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs" style={{ color: "#8898AA" }}>
            🗓 {formatDate(event.date)}
            {event.endDate && event.endDate !== event.date ? ` — ${formatDate(event.endDate)}` : ""}
            {" · "}{event.time}
          </div>
          <a
            href={mapsUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs"
            style={{ color: "#0984E3", textDecoration: "none" }}
          >
            📍 <span className="truncate">{event.location.venue}, {event.location.city}</span>
            <span style={{ fontSize: 10, opacity: 0.7, flexShrink: 0 }}>↗</span>
          </a>
          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Ticket size={13} />
            <span className="text-xs font-medium" style={{ color: event.price === null ? "#55EFC4" : "var(--text-muted)" }}>
              {event.price === null ? "Free" : `A$${event.price}`}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          {event.featured && (
            <div className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ color: "#FF9F43", backgroundColor: "#FFF4E6" }}>
              ★ Featured
            </div>
          )}
          <ActionButtons website={event.website} ticketUrl={event.ticketUrl} />
        </div>
      </div>
    </div>
  );
}
