import type { Event, EventCategory, AustralianState } from "@/lib/types";

const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

// Ticketmaster segment IDs for filtering
const SEGMENT_IDS: Partial<Record<EventCategory, string>> = {
  music: "KZFzniwnSyZfZ7v7nJ",
  sports: "KZFzniwnSyZfZ7v7nE",
  arts: "KZFzniwnSyZfZ7v7na",
  film: "KZFzniwnSyZfZ7v7nn",
};

function mapCategory(classifications: TicketmasterClassification[]): EventCategory {
  if (!classifications?.length) return "cultural";
  const primary = classifications.find((c) => c.primary) ?? classifications[0];
  const segment = primary.segment?.name?.toLowerCase() ?? "";
  const genre = primary.genre?.name?.toLowerCase() ?? "";
  const subGenre = primary.subGenre?.name?.toLowerCase() ?? "";

  if (segment === "music") return "music";
  if (segment === "sports") return "sports";
  if (segment.includes("arts") || segment.includes("theatre")) return "arts";
  if (segment === "film") return "film";
  if (genre.includes("comedy") || subGenre.includes("comedy")) return "comedy";
  if (genre.includes("food") || genre.includes("dining") || genre.includes("market")) return "markets";
  if (genre.includes("festival") || genre.includes("fair")) return "cultural";
  return "cultural";
}

const VALID_STATES: AustralianState[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

function mapState(stateCode: string): AustralianState {
  return VALID_STATES.includes(stateCode as AustralianState)
    ? (stateCode as AustralianState)
    : "NSW";
}

function getBestImage(images: TicketmasterImage[]): string | undefined {
  if (!images?.length) return undefined;
  const preferred = images.find((img) => img.ratio === "16_9" && img.width >= 1024);
  return (preferred ?? images[0])?.url;
}

// ─── Ticketmaster response types ────────────────────────────────────────────

type TicketmasterImage = {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
};

type TicketmasterClassification = {
  primary: boolean;
  segment?: { id: string; name: string };
  genre?: { id: string; name: string };
  subGenre?: { id: string; name: string };
};

type TicketmasterVenue = {
  name: string;
  city?: { name: string };
  state?: { name: string; stateCode: string };
  location?: { latitude: string; longitude: string };
};

type TicketmasterEvent = {
  id: string;
  name: string;
  url: string;
  info?: string;
  pleaseNote?: string;
  images: TicketmasterImage[];
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  classifications?: TicketmasterClassification[];
  priceRanges?: { min: number; max: number; currency: string }[];
  _embedded?: {
    venues?: TicketmasterVenue[];
  };
};

// ─── Main fetch function ─────────────────────────────────────────────────────

export async function fetchTicketmasterEvents(params?: {
  category?: string;
  stateCode?: string;
  size?: number;
}): Promise<Event[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) throw new Error("TICKETMASTER_API_KEY is not set in .env.local");

  const url = new URL(`${BASE_URL}/events.json`);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("countryCode", "AU");
  url.searchParams.set("size", String(params?.size ?? 200)); // max 200
  url.searchParams.set("sort", "date,asc");
  // Only show events from today onwards
  url.searchParams.set("startDateTime", new Date().toISOString().split(".")[0] + "Z");

  if (params?.category && params.category !== "all") {
    const segmentId = SEGMENT_IDS[params.category as EventCategory];
    if (segmentId) url.searchParams.set("segmentId", segmentId);
  }

  if (params?.stateCode && params.stateCode !== "all") {
    url.searchParams.set("stateCode", params.stateCode);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Ticketmaster API responded with ${res.status}`);
  }

  const data = await res.json();
  const rawEvents: TicketmasterEvent[] = data._embedded?.events ?? [];

  // Filter out non-event entries (parking, extras, hospitality add-ons, etc.)
  const JUNK_NAMES = /^(extra|parking|hospitality|vip upgrade|add-on|addon)$/i;
  const events = rawEvents.filter((e) => !JUNK_NAMES.test(e.name.trim()));

  return events.map((e): Event => {
    const venue = e._embedded?.venues?.[0];
    const cityName = venue?.city?.name;
    const stateName = venue?.state?.name;

    return {
      id: e.id,
      title: e.name,
      description: e.info ?? e.pleaseNote ?? "",
      date: e.dates.start.localDate,
      time: e.dates.start.localTime?.slice(0, 5) ?? "00:00",
      location: {
        venue: venue?.name ?? "Venue TBA",
        city: cityName ?? stateName ?? "Australia",
        state: mapState(venue?.state?.stateCode ?? ""),
        lat: parseFloat(venue?.location?.latitude ?? "0"),
        lng: parseFloat(venue?.location?.longitude ?? "0"),
      },
      category: mapCategory(e.classifications ?? []),
      tags: (e.classifications ?? [])
        .map((c) => c.genre?.name)
        .filter((name): name is string => !!name && name !== "Undefined"),
      price: e.priceRanges?.[0]?.min ?? null,
      featured: false,
      image: getBestImage(e.images),
      ticketUrl: e.url,
    };
  });
}
