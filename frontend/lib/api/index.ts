import { fetchTicketmasterEvents } from "./ticketmaster";
import type { Event } from "@/lib/types";

export type EventFilters = {
  category?: string;
  stateCode?: string;
  size?: number;
};

/**
 * Unified event fetch — all pages should call this, not individual source adapters.
 * To add a new data source, add it to the Promise.all below.
 */
export async function fetchEvents(filters?: EventFilters): Promise<Event[]> {
  const [tmEvents] = await Promise.all([
    fetchTicketmasterEvents(filters),
    // fetchMelbourneEvents(filters),  ← plug in here when ready
  ]);

  // Merge sources and sort by date ascending
  return [...tmEvents].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });
}
