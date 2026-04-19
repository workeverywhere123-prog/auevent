import type { Event, EventCategory, AustralianState } from "@/lib/types";

const BASE_URL = "https://www.eventbriteapi.com/v3";

// Eventbrite category ID → our EventCategory
const CATEGORY_MAP: Record<string, EventCategory> = {
  "103": "music",
  "104": "film",
  "105": "arts",
  "108": "sports",
  "110": "food",
  "113": "cultural",
  "116": "cultural",
  "117": "cultural",
};

const VALID_STATES: AustralianState[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

function mapCategory(categoryId: string | null): EventCategory {
  if (!categoryId) return "cultural";
  return CATEGORY_MAP[categoryId] ?? "cultural";
}

function mapState(region: string): AustralianState {
  const r = region?.toUpperCase().trim();
  if (VALID_STATES.includes(r as AustralianState)) return r as AustralianState;
  return "NSW";
}

// ─── Eventbrite response types ───────────────────────────────────────────────

type EBText = { text: string; html: string };
type EBDatetime = { timezone: string; local: string; utc: string };
type EBImage = { url: string };
type EBVenue = {
  name: string;
  address: {
    city: string;
    region: string;   // state code e.g. "VIC"
    latitude: string;
    longitude: string;
  };
};
type EBTicketClass = {
  free: boolean;
  cost?: { major_value: string };
};
type EBEvent = {
  id: string;
  name: EBText;
  description: EBText;
  url: string;
  start: EBDatetime;
  end: EBDatetime;
  logo?: EBImage;
  category_id: string | null;
  is_free: boolean;
  venue?: EBVenue;
  ticket_classes?: EBTicketClass[];
};
type EBResponse = {
  events: EBEvent[];
  pagination: { has_more_items: boolean; continuation?: string };
};

// ─── Main fetch function ─────────────────────────────────────────────────────

export async function fetchEventbriteEvents(params?: {
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;
  stateCode?: string;
}): Promise<Event[]> {
  const apiKey = process.env.EVENTBRITE_API_KEY;
  if (!apiKey) throw new Error("EVENTBRITE_API_KEY is not set in .env.local");

  const allEvents: EBEvent[] = [];
  let continuation: string | undefined;

  // Paginate through all results
  do {
    const url = new URL(`${BASE_URL}/events/search/`);
    url.searchParams.set("location.address", "Australia");
    url.searchParams.set("location.within", "2000km");
    url.searchParams.set("expand", "venue,ticket_classes");
    url.searchParams.set("page_size", "50");

    if (params?.startDate) {
      url.searchParams.set("start_date.range_start", `${params.startDate}T00:00:00`);
    }
    if (params?.endDate) {
      url.searchParams.set("start_date.range_end", `${params.endDate}T23:59:59`);
    }
    if (continuation) {
      url.searchParams.set("continuation", continuation);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Eventbrite API responded with ${res.status}`);
    }

    const data: EBResponse = await res.json();
    allEvents.push(...(data.events ?? []));
    continuation = data.pagination.has_more_items ? data.pagination.continuation : undefined;

    // Safety cap — max 500 events per sync
    if (allEvents.length >= 500) break;
  } while (continuation);

  // Filter to Australian states only (skip events with no venue/coordinates)
  const filtered = allEvents.filter((e) => {
    if (!e.venue?.address?.latitude || !e.venue?.address?.longitude) return false;
    const lat = parseFloat(e.venue.address.latitude);
    const lng = parseFloat(e.venue.address.longitude);
    if (lat === 0 && lng === 0) return false;
    if (lat > 0) return false; // must be southern hemisphere
    if (params?.stateCode && params.stateCode !== "all") {
      if (mapState(e.venue.address.region) !== params.stateCode) return false;
    }
    return true;
  });

  return filtered.map((e): Event => {
    const localDate = e.start.local.slice(0, 10);   // "YYYY-MM-DD"
    const localTime = e.start.local.slice(11, 16);  // "HH:MM"
    const endDate   = e.end.local.slice(0, 10);

    const price = e.is_free
      ? null
      : parseFloat(e.ticket_classes?.[0]?.cost?.major_value ?? "0") || null;

    return {
      id:          `eb_${e.id}`,
      title:       e.name.text,
      description: e.description?.text ?? "",
      date:        localDate,
      endDate:     endDate !== localDate ? endDate : undefined,
      time:        localTime,
      location: {
        venue: e.venue?.name ?? "Venue TBA",
        city:  e.venue?.address?.city ?? "Australia",
        state: mapState(e.venue?.address?.region ?? ""),
        lat:   parseFloat(e.venue?.address?.latitude ?? "0"),
        lng:   parseFloat(e.venue?.address?.longitude ?? "0"),
      },
      category:  mapCategory(e.category_id),
      tags:      [],
      price,
      featured:  false,
      image:     e.logo?.url,
      ticketUrl: e.url,
    };
  });
}
