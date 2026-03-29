import { supabase } from "@/lib/db/supabase";
import type { Event } from "@/lib/types";

export type EventFilters = {
  category?: string;
  stateCode?: string;
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
};

/**
 * Unified event fetch — reads from Supabase.
 * New data sources get synced into the DB via /api/sync, not added here.
 */
export async function fetchEvents(filters?: EventFilters): Promise<Event[]> {
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("events")
    .select("*")
    .gte("date", filters?.startDate ?? today)
    .order("date", { ascending: true })
    .limit(500);

  if (filters?.endDate) {
    query = query.lte("date", filters.endDate);
  }
  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters?.stateCode && filters.stateCode !== "all") {
    query = query.eq("state", filters.stateCode);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id:          row.id,
    title:       row.title,
    description: row.description,
    date:        row.date,
    endDate:     row.end_date ?? undefined,
    time:        row.time,
    location: {
      venue: row.venue_name,
      city:  row.city,
      state: row.state,
      lat:   row.lat,
      lng:   row.lng,
    },
    category:  row.category,
    tags:      row.tags ?? [],
    price:     row.price ?? null,
    featured:  row.featured,
    image:     row.image_url ?? undefined,
    ticketUrl: row.ticket_url ?? undefined,
    website:   row.website ?? undefined,
  }));
}
