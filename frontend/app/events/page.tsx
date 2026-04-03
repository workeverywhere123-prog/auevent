import { CATEGORY_META } from "@/lib/mock-data";
import { fetchEvents } from "@/lib/api";
import EventCard from "@/components/events/EventCard";
import StateFilter from "@/components/events/StateFilter";

const CATEGORIES = ["all", "music", "food", "sports", "arts", "cultural", "markets", "comedy", "film"] as const;

type Props = {
  searchParams: Promise<{ category?: string; state?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const { category = "all", state = "all" } = await searchParams;

  const filtered = await fetchEvents({ category, stateCode: state });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          All Events
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {filtered.length} events found across Australia
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap mb-6">
        <StateFilter current={state} />

        <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = category === cat;
          return (
            <a
              key={cat}
              href={`/events?category=${cat}${state !== "all" ? `&state=${state}` : ""}`}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? meta.color : meta.bg,
                color: active ? "#fff" : meta.color,
              }}
            >
              {meta.label}
            </a>
          );
        })}
        </div>
      </div>

      {/* Event grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          No events found for this category.
        </div>
      )}
    </div>
  );
}
