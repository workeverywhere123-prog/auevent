import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { fetchTicketmasterEvents } from "@/lib/api/ticketmaster";
import { fetchEventbriteEvents } from "@/lib/api/eventbrite";

// Simple auth — set SYNC_SECRET in .env.local and pass as ?secret=xxx
function isAuthorized(req: NextRequest) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return true; // no secret set → allow (dev mode)
  return req.nextUrl.searchParams.get("secret") === secret;
}

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end   = new Date(year, month + 1, 0); // last day of month
  const fmt   = (d: Date) => d.toISOString().split("T")[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: { month: string; fetched: number; upserted: number }[] = [];

  // Fetch next 6 months month by month
  for (let i = 0; i < 6; i++) {
    const date  = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year  = date.getFullYear();
    const month = date.getMonth();
    const { startDate, endDate } = getMonthRange(year, month);
    const label = `${year}-${String(month + 1).padStart(2, "0")}`;

    const events = await fetchTicketmasterEvents({ startDate, endDate, size: 200 });

    if (events.length === 0) {
      results.push({ month: label, fetched: 0, upserted: 0 });
      continue;
    }

    // Map Event type → DB row
    const rows = events.map((e) => ({
      id:          e.id,
      source:      "ticketmaster",
      title:       e.title,
      description: e.description,
      date:        e.date,
      end_date:    e.endDate ?? null,
      time:        e.time,
      venue_name:  e.location.venue,
      city:        e.location.city,
      state:       e.location.state,
      lat:         e.location.lat,
      lng:         e.location.lng,
      category:    e.category,
      tags:        e.tags,
      price:       e.price,
      image_url:   e.image ?? null,
      ticket_url:  e.ticketUrl ?? null,
      website:     e.website ?? null,
      featured:    e.featured,
      synced_at:   new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from("events")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ error: error.message, month: label }, { status: 500 });
    }

    results.push({ month: label, fetched: events.length, upserted: rows.length });
  }

  // ── Eventbrite sync ──────────────────────────────────────────────────────
  const ebResults: { month: string; fetched: number; upserted: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const date  = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year  = date.getFullYear();
    const month = date.getMonth();
    const { startDate, endDate } = getMonthRange(year, month);
    const label = `${year}-${String(month + 1).padStart(2, "0")}`;

    let events;
    try {
      events = await fetchEventbriteEvents({ startDate, endDate });
    } catch (err) {
      ebResults.push({ month: label, fetched: 0, upserted: 0 });
      console.error("Eventbrite fetch error:", err);
      continue;
    }

    if (events.length === 0) {
      ebResults.push({ month: label, fetched: 0, upserted: 0 });
      continue;
    }

    const rows = events.map((e) => ({
      id:          e.id,
      source:      "eventbrite",
      title:       e.title,
      description: e.description,
      date:        e.date,
      end_date:    e.endDate ?? null,
      time:        e.time,
      venue_name:  e.location.venue,
      city:        e.location.city,
      state:       e.location.state,
      lat:         e.location.lat,
      lng:         e.location.lng,
      category:    e.category,
      tags:        e.tags,
      price:       e.price,
      image_url:   e.image ?? null,
      ticket_url:  e.ticketUrl ?? null,
      website:     e.website ?? null,
      featured:    e.featured,
      synced_at:   new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from("events")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ error: error.message, source: "eventbrite", month: label }, { status: 500 });
    }

    ebResults.push({ month: label, fetched: events.length, upserted: rows.length });
  }

  return NextResponse.json({ ok: true, ticketmaster: results, eventbrite: ebResults });
}
