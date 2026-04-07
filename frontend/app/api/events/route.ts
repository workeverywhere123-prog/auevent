import { NextRequest, NextResponse } from "next/server";
// Using the public anon client intentionally — this route honours RLS read policies.
// If RLS is tightened to restrict anon reads, switch to supabaseAdmin here.
import { supabase } from "@/lib/db/supabase";
import { mapRowToEvent } from "@/lib/api/mappers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawYear  = searchParams.get("year");
  const rawMonth = searchParams.get("month");
  const stateCode = searchParams.get("state") ?? "all";

  if (!rawYear || rawMonth === null) {
    return NextResponse.json({ error: "year and month are required" }, { status: 400 });
  }

  const year  = Number(rawYear);
  const month = Number(rawMonth); // 0-indexed

  if (!Number.isInteger(year) || year < 2000 || year > 2100 ||
      !Number.isInteger(month) || month < 0 || month > 11) {
    return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
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
