export type EventCategory =
  | "music"
  | "food"
  | "sports"
  | "arts"
  | "cultural"
  | "markets"
  | "comedy"
  | "film";

export type AustralianState =
  | "NSW"
  | "VIC"
  | "QLD"
  | "WA"
  | "SA"
  | "TAS"
  | "ACT"
  | "NT";

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;         // "YYYY-MM-DD"
  endDate?: string;     // multi-day events
  time: string;         // "19:00"
  location: {
    venue: string;
    city: string;
    state: AustralianState;
    lat: number;
    lng: number;
  };
  category: EventCategory;
  tags: string[];
  price: number | null; // null = free
  featured: boolean;
  image?: string;
  ticketUrl?: string;
  website?: string;
};

export type FilterState = {
  category: EventCategory | "all";
  state: AustralianState | "all";
  dateFrom: string | null;
  dateTo: string | null;
  freeOnly: boolean;
};
