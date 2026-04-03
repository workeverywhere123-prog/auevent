import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { mapRowToEvent } from "@/lib/api/mappers";

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

  const events = (data ?? []).map(mapRowToEvent);

  return NextResponse.json(events);
}
