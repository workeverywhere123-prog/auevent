"use client";

import { useEffect } from "react";
import type { Event } from "@/lib/types";
import { CATEGORY_META, STATE_META } from "@/lib/mock-data";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function HighlightedTitle({ title, query }: { title: string; query: string }) {
  const idx = title.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <mark
        style={{
          backgroundColor: "rgba(255, 107, 107, 0.2)",
          color: "var(--primary)",
          borderRadius: "2px",
          padding: "0 1px",
          fontWeight: 700,
        }}
      >
        {title.slice(idx, idx + query.length)}
      </mark>
      {title.slice(idx + query.length)}
    </>
  );
}

type SearchDropdownProps = {
  results: Event[];
  isLoading: boolean;
  query: string;
  activeIndex: number;
  onSelect: (event: Event) => void;
  onMouseEnterItem: (index: number) => void;
};

export default function SearchDropdown({
  results,
  isLoading,
  query,
  activeIndex,
  onSelect,
  onMouseEnterItem,
}: SearchDropdownProps) {
  // Scroll active item into view when navigating with keyboard
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = document.getElementById(`search-option-${activeIndex}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (query.length === 0) return null;

  return (
    <div
      className="w-full rounded-xl shadow-xl overflow-hidden"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border)",
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      {isLoading ? (
        // Skeleton loading state
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="px-4 py-3 flex flex-col gap-2">
              <div
                className="h-4 rounded animate-pulse"
                style={{ backgroundColor: "var(--border)", width: "65%" }}
              />
              <div
                className="h-3 rounded animate-pulse"
                style={{ backgroundColor: "var(--border)", width: "45%" }}
              />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        // Empty state
        <div className="py-8 flex items-center justify-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No results for &lsquo;{query}&rsquo;
          </p>
        </div>
      ) : (
        // Results list
        <ul role="listbox" id="search-listbox" className="list-none m-0 p-0">
          {results.map((event, index) => {
            const meta = CATEGORY_META[event.category];
            const isActive = activeIndex === index;
            const isLast = index === results.length - 1;

            return (
              <li
                key={event.id}
                role="option"
                id={`search-option-${index}`}
                aria-selected={isActive}
                className="px-4 py-4 cursor-pointer"
                style={{
                  backgroundColor: isActive ? "rgba(255, 107, 107, 0.1)" : undefined,
                  borderBottom: isLast ? undefined : "1px solid var(--border)",
                }}
                onMouseEnter={() => onMouseEnterItem(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(event);
                }}
              >
                {/* Row 1: title with match highlight */}
                <p
                  className="font-medium text-sm leading-snug"
                  style={{ color: "var(--text)" }}
                >
                  <HighlightedTitle title={event.title} query={query} />
                </p>

                {/* Row 2: date + location */}
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {formatDate(event.date)}
                  {" · "}
                  {event.location.venue && `${event.location.venue}, `}
                  {event.location.city}, {event.location.state}
                </p>

                {/* Row 3: category + state pills */}
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ color: meta.color, backgroundColor: meta.bg }}
                  >
                    {meta.label}
                  </span>
                  {event.location.state && STATE_META[event.location.state] && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: STATE_META[event.location.state].color,
                        backgroundColor: `${STATE_META[event.location.state].color}18`,
                      }}
                    >
                      {STATE_META[event.location.state].label}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
