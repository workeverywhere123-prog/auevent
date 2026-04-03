import type { Event } from "@/lib/types";

/**
 * Maps a raw Supabase DB row (snake_case) to the shared Event type.
 * Single source of truth — imported by any file that queries the events table.
 */
export function mapRowToEvent(row: Record<string, unknown>): Event {
  return {
    id:          row.id          as string,
    title:       row.title       as string,
    description: row.description as string,
    date:        row.date        as string,
    endDate:     (row.end_date   as string | null) ?? undefined,
    time:        row.time        as string,
    location: {
      venue: row.venue_name as string,
      city:  row.city       as string,
      state: row.state      as Event["location"]["state"],
      lat:   row.lat        as number,
      lng:   row.lng        as number,
    },
    category:  row.category                        as Event["category"],
    tags:      (row.tags as string[] | null) ?? [],
    price:     (row.price as number | null) ?? null,
    featured:  row.featured as boolean,
    image:     (row.image_url  as string | null) ?? undefined,
    ticketUrl: (row.ticket_url as string | null) ?? undefined,
    website:   (row.website    as string | null) ?? undefined,
  };
}
