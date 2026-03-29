import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import type { Event } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year     = Number(searchParams.get("year"));
  const month    = Number(searchParams.get("month")); // 0-indexed
  const stateCode = searchParams.get("state") ?? "all";

  if (!year || isNaN(month)) {
    return NextResponse.json({ error: "year and month are required" }, { status: 400 });
  }

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay   = new Date(year, month + 1, 0).getDate();
  const endDate   = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

  let query = supabase
    .from("events")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (stateCode !== "all") {
    query = query.eq("state", stateCode);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map DB rows → Event type
  const events: Event[] = (data ?? []).map((row) => ({
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

  return NextResponse.json(events);
}
