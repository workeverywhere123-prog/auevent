import type { Event } from "@/lib/types";
import CategoryBadge from "./CategoryBadge";
import { MapPin, Clock, Ticket } from "lucide-react";

type Props = {
  event: Event;
  compact?: boolean;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventCard({ event, compact = false }: Props) {
  if (compact) {
    return (
      <div
        className="rounded-lg p-3 flex gap-3 items-start transition-colors hover:opacity-90 cursor-pointer"
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
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
            {event.title}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
            {event.location.city}, {event.location.state}
          </p>
          <div className="mt-1">
            <CategoryBadge category={event.category} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
      style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}
    >
      {/* Header color band */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: "var(--primary)" }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="font-semibold text-sm leading-snug flex-1"
            style={{ color: "var(--text)" }}
          >
            {event.title}
          </h3>
          <CategoryBadge category={event.category} />
        </div>

        <p
          className="text-xs line-clamp-2 mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          {event.description}
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Clock size={13} />
            <span className="text-xs">
              {formatDate(event.date)}
              {event.endDate && event.endDate !== event.date
                ? ` — ${formatDate(event.endDate)}`
                : ""}
              {" · "}
              {event.time}
            </span>
          </div>

          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <MapPin size={13} />
            <span className="text-xs truncate">
              {event.location.venue}, {event.location.city}
            </span>
          </div>

          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Ticket size={13} />
            <span className="text-xs font-medium" style={{ color: event.price === null ? "#55EFC4" : "var(--text-muted)" }}>
              {event.price === null ? "Free" : `A$${event.price}`}
            </span>
          </div>
        </div>

        {event.featured && (
          <div
            className="mt-3 text-xs font-medium px-2 py-1 rounded-full inline-block"
            style={{ color: "#FF9F43", backgroundColor: "#FFF4E6" }}
          >
            ★ Featured
          </div>
        )}
      </div>
    </div>
  );
}
