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

**[FIXED] Previously dead code — removed (2026-04-04):**
- `MOCK_EVENTS`, `getEventsByMonth/Category/State`, `getFeaturedEvents` from `lib/mock-data.ts`
- `FilterState` type from `lib/types.ts`
- DB row → Event mapping duplicated in two files → now in `lib/api/mappers.ts`

**[FIXED] All issues resolved before feature development (2026-04-04):**
- `/about` page created (`app/about/page.tsx`)
- Dashboard "Explore Events" `<div>` → `<Link>`
- `CalendarClient` redundant mount fetch (uses `mountedRef` to skip first render)
- `fetchEvents()` no longer forces `startDate` to today
- XSS in Leaflet popups — `escapeHtml()` in `lib/utils/html.ts`, imported by both `MapPageClient` and `FeaturedClient`
- URL injection — `safeUrl()` in `lib/utils/url.ts`, applied to all `<a href>` across `EventCard`, `CalendarClient`, `MapPageClient`, `FeaturedClient`
- Leaflet CSS moved from inline JSX `<link>` to `app/globals.css` `@import` (eliminates FOUC)
- `isNaN(month)` + year range validation in `app/api/events/route.ts`
- `app/events/page.tsx` — category/state params validated against allowlist before `fetchEvents()`
- `mapRowToEvent` — required field guard (`id`, `title`, `date`, `state`) + `?? ""` fallbacks
- `FeaturedClient` `cats.has(k as never)` → `Set<string>` type fix
- `CalendarClient` `fetchMonth` — `catch` block added, network errors set `fetchError`

**Remaining UI (decorative only — not yet implemented):**
- Header search box — no `onChange` handler
- Header Bell icon — no functionality

**[NOTE] `contexts/StarredContext.tsx` — `Promise.resolve().then()` wrapper is intentional:**
- `react-hooks/set-state-in-effect` lint rule forbids synchronous `setState` inside an effect body. The `Promise.resolve().then()` wrapper is required to satisfy this rule. Do not remove it.

**[NOTE] `app/api/events/route.ts` — uses public `supabase` client (anon key) intentionally:**
- Honours RLS read policies. Comment in file explains the decision. If RLS is tightened, switch to `supabaseAdmin`.

**Logic still duplicated across files (tracked for future refactor):**
- `formatDate()`, `mapsUrl()`, `buildCalendarDays()`, `getEventsForDate()`, `isSameDay()` — in `EventCard`, `CalendarClient`, `MapPageClient`, `FeaturedClient`
- `makeIcon()`, `makePopupHtml()`, `LeafletMap`, `CalendarView`, `MapView`, `EventListItem`, `DayEventCard` — copy-pasted between `MapPageClient`/`CalendarClient` and `FeaturedClient`

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
