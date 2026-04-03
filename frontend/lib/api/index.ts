import { supabase } from "@/lib/db/supabase";
import type { Event } from "@/lib/types";
import { mapRowToEvent } from "@/lib/api/mappers";

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
  let query = supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true })
    .limit(500);

  // Only apply a startDate floor when the caller explicitly provides one.
  // Omitting this filter lets callers retrieve past events when needed.
  if (filters?.startDate) {
    query = query.gte("date", filters.startDate);
  }
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

  return (data ?? []).map(mapRowToEvent);
}
