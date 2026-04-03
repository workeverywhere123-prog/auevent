# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version Notice

This project uses Next.js 16.2.0 which may have breaking changes from your training data. Read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Structure

All active development happens in the `frontend/` directory. The `src/` directory is a placeholder (unused — `src/data/events.json` is dead code, not imported anywhere).

## Commands

Run all commands from `frontend/`:

```bash
npm run dev    # Development server at http://localhost:3000
npm run build  # Production build
npm run lint   # ESLint
npm start      # Start production server
```

## Architecture

**OzFest** is a Next.js App Router event aggregator for Australian events, pulling data from the Ticketmaster Discovery API into Supabase (PostgreSQL).

### Data Flow

1. **Sync:** `POST /api/sync` → `lib/api/ticketmaster.ts:fetchTicketmasterEvents()` → upserts to Supabase `events` table via `supabaseAdmin`
2. **SSR Query:** `lib/api/index.ts:fetchEvents(filters?)` → direct Supabase query → used by all 4 page Server Components
3. **Client Query:** `GET /api/events?year=&month=&state=` → used **only** by `CalendarClient` for client-side month refetch

### Rendering Pattern

Pages are Server Components that fetch data and pass it to a `*Client.tsx` Client Component:

| Page | Server Component | Client Component |
|---|---|---|
| `/calendar` | `app/calendar/page.tsx` | `CalendarClient.tsx` |
| `/map` | `app/map/page.tsx` | `MapPageClient.tsx` |
| `/featured` | `app/featured/page.tsx` | `FeaturedClient.tsx` |
| `/events` | `app/events/page.tsx` | (no client wrapper — all server) |

### Key Types (`lib/types.ts`)

```ts
EventCategory = "music" | "food" | "sports" | "arts" | "cultural" | "markets" | "comedy" | "film"
AustralianState = "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT"

Event {
  id: string
  title: string
  description: string
  date: string            // "YYYY-MM-DD"
  endDate?: string
  time: string            // "HH:MM"
  location: { venue, city, state: AustralianState, lat, lng }
  category: EventCategory
  tags: string[]
  price: number | null    // null = free
  featured: boolean
  image?: string
  ticketUrl?: string
  website?: string
}

// EventFilters (lib/api/index.ts) is the active filter type — FilterState in types.ts is UNUSED
EventFilters { category?, stateCode?, startDate?, endDate? }
```

### Database Schema (`lib/db/schema.sql`)

Table: `events` — key column ↔ type mapping:
- `venue_name` → `location.venue`, `end_date` → `endDate`, `image_url` → `image`, `ticket_url` → `ticketUrl`
- Mapping is centralized in `lib/api/mappers.ts:mapRowToEvent()` — both `lib/api/index.ts` and `app/api/events/route.ts` import from there

### State Management

- `StarredContext` (`contexts/StarredContext.tsx`) — localStorage key `ozfest_starred`, wraps everything via `Providers.tsx`
- `useStarred` (`hooks/useStarred.ts`) — re-export alias for `useStarredContext`

### Display Metadata

- `CATEGORY_META` and `STATE_META` from `lib/mock-data.ts` — canonical display metadata (colors, labels) for categories/states
- **`MapPageClient.tsx` exception:** imports `CATEGORY_META as CATEGORY_META_SOURCE` to derive `CATEGORY_COLORS` (marker colors), but also re-declares a separate local `CATEGORY_META` with **different hex values** for filter UI. This local constant also adds `center:[lat,lng]` + `zoom` for Leaflet `flyTo`. Result: filter pill colors and map marker colors may still diverge.
- `lib/mock-data.ts` acts as production config — consider renaming to `lib/config/categories.ts`

### Known Issues and Security Notes

**[FIXED] Previously dead code — removed:**
- `MOCK_EVENTS`, `getEventsByMonth/Category/State`, `getFeaturedEvents` from `lib/mock-data.ts`
- `FilterState` type from `lib/types.ts`
- DB row → Event mapping duplicated in two files → now in `lib/api/mappers.ts`

**[FIXED] Previously broken UI — fixed:**
- `/about` page created (`app/about/page.tsx`)
- Dashboard "Explore Events" `<div>` → `<Link>`
- `CalendarClient` redundant mount fetch (uses `mountedRef` to skip first render)
- `fetchEvents()` no longer forces `startDate` to today

**Remaining UI (decorative only — not yet implemented):**
- Header search box — no `onChange` handler
- Header Bell icon — no functionality

**[SECURITY — MEDIUM] XSS surface in Leaflet popups:**
- `makePopupHtml()` in both `MapPageClient.tsx` and `FeaturedClient.tsx` interpolates DB strings (`event.title`, `event.location.venue`, etc.) directly into HTML set via Leaflet's `innerHTML`-based `bindPopup()`. React escaping does not apply here.
- Current risk is low (data comes from Ticketmaster sync only), but any future user-submitted content or manual DB edit could be exploited.
- Fix: add `escapeHtml()` helper and apply to all interpolated strings; validate `ticketUrl`/`website` start with `https://`

**[BUG] `app/api/events/route.ts` — `isNaN(month)` validation broken:**
- `Number(null) === 0`, so missing `?month=` param silently queries January. Use `searchParams.has()` presence check before coercing to number.

**[BUG] `lib/api/mappers.ts` — no runtime validation:**
- `mapRowToEvent` uses bare type casts (`as string`). If Supabase returns `null` for required fields, downstream `event.title.toLowerCase()` etc. will throw at runtime. Add a guard for required fields (`id`, `title`, `date`).

**[MINOR] `contexts/StarredContext.tsx` — unnecessary `Promise.resolve().then()` wrapper:**
- `useEffect` already guarantees client-only post-mount execution. The wrapper is redundant and confusing. Can safely replace with a plain effect body.

**[MINOR] `app/api/events/route.ts` — uses public `supabase` client (anon key), not `supabaseAdmin`:**
- Works while RLS allows anon reads, but inconsistent with the sync route. If RLS is ever tightened, this route silently returns empty results.

**[MINOR] `components/featured/FeaturedClient.tsx` line ~737 — type hack:**
- `cats.has(k as never)` — fix by typing `cats` as `Set<string>`.

**Logic still duplicated across files (no shared utility yet):**
- `formatDate()`, `mapsUrl()`, `buildCalendarDays()`, `getEventsForDate()`, `isSameDay()` — in `EventCard`, `CalendarClient`, `MapPageClient`, `FeaturedClient`
- `makeIcon()`, `makePopupHtml()` (Leaflet) — in `MapPageClient` and `FeaturedClient` (if fixing XSS, must apply to **both**)
- Full `CalendarView`, `MapView`, `LeafletMap`, `EventListItem`, `DayEventCard` sub-components copy-pasted in `FeaturedClient.tsx`

### Environment Variables

| Variable | Where used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server Supabase client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — `supabaseAdmin` in sync route |
| `TICKETMASTER_API_KEY` | Server-only — `lib/api/ticketmaster.ts` |
| `SYNC_SECRET` | Optional — protects `POST /api/sync` with `?secret=` param |

### Design System

CSS variables in `app/globals.css`:
- `--primary`: #FF6B6B (coral), `--secondary`: #4ECDC4 (mint), `--background`: #FFFAF5 (cream), `--text`: #2C3E50 (navy)

Full palette: `docs/COLOR-PALETTE.md`. Navigation architecture: `docs/ARCH-navigation.md`.

### `FeaturedClient.tsx` Complexity Note

At ~760 lines, this is the largest and most complex file. It embeds three full view modes ("My Events", "My 캘린더", "My 맵") with duplicated Leaflet map and calendar logic copied from `MapPageClient` and `CalendarClient`. Any map/calendar bug fix likely needs to be applied here too.
