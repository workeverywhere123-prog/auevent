import { NextResponse } from "next/server";
import { fetchEvents } from "@/lib/api";

export async function GET() {
  try {
    const events = await fetchEvents();
    return NextResponse.json(events);
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
