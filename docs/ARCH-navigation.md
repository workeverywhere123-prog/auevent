# AUEvent — Navigation Architecture: Sidebar & Header

> Status: Design
> Date: 2026-03-20
> Author: Frontend Architect
> Next.js version in use: 16.2.0 (App Router)

---

## 1. Component File Tree

```
frontend/
├── app/
│   ├── layout.tsx                     # Root layout — mounts Header + Sidebar shell
│   ├── globals.css
│   ├── page.tsx                       # Home (event feed)
│   ├── events/
│   │   ├── page.tsx                   # /events listing
│   │   └── [id]/
│   │       └── page.tsx               # /events/:id detail
│   └── categories/
│       └── [slug]/
│           └── page.tsx               # /categories/:slug
│
└── components/
    ├── layout/
    │   ├── AppShell.tsx               # Composes Sidebar + Header + main content
    │   ├── Header.tsx                 # Server Component — logo, search slot, auth slot
    │   ├── HeaderActions.tsx          # 'use client' — search, menu toggle button
    │   ├── Sidebar.tsx                # Server Component — static nav links
    │   ├── SidebarDrawer.tsx          # 'use client' — mobile Sheet wrapper
    │   └── SidebarNav.tsx             # Server Component — nav item list (shared)
    │
    ├── ui/                            # shadcn/ui primitives (install as needed)
    │   ├── button.tsx
    │   ├── sheet.tsx                  # Used by SidebarDrawer on mobile
    │   ├── separator.tsx
    │   ├── badge.tsx                  # Event category badges
    │   └── input.tsx                  # Search input
    │
    └── providers/
        └── NavigationProvider.tsx     # 'use client' — sidebar open/close state
```

---

## 2. Component Responsibilities

### `app/layout.tsx` (Server Component — root layout)

- Defines `<html>` and `<body>` tags with Geist font variables.
- Imports `NavigationProvider` (Client) which wraps `AppShell`.
- Does **not** contain any interactive logic itself.
- Sets site-wide `<Metadata>` (title template, description, og:image).

### `components/layout/AppShell.tsx` (Server Component)

- Structural composition only: renders `<Header>`, `<Sidebar>` (desktop), `<SidebarDrawer>` (mobile), and `{children}`.
- Uses Tailwind grid/flex to define the two-column desktop layout.
- No state — delegates interactivity downward.

```
Desktop layout (lg+):
┌──────────────────────────────────────────┐
│              Header (full width)         │
├──────────┬───────────────────────────────┤
│ Sidebar  │  main content (children)      │
│ 240px    │  flex-1, overflow-y-auto      │
└──────────┴───────────────────────────────┘

Mobile layout (<lg):
┌──────────────────────────────────────────┐
│  Header (hamburger | logo | actions)     │
├──────────────────────────────────────────┤
│  main content (full width)               │
│                                          │
│  [SidebarDrawer slides in from left]     │
└──────────────────────────────────────────┘
```

### `components/layout/Header.tsx` (Server Component)

Responsibilities:
- Render the AUEvent logo (link to `/`).
- Render a `<HeaderActions>` slot (Client Component) for search and mobile menu toggle.
- Render an auth placeholder (static "Sign in" link for now; replace when auth lands).
- Export `metadata`-compatible markup (landmark `<header>`, `role="banner"`).

Does NOT own: open/close state, search query state.

### `components/layout/HeaderActions.tsx` (`'use client'`)

Responsibilities:
- Hamburger / close icon button that calls `useSidebar()` context to toggle drawer.
- Search input — controls local `searchQuery` state, dispatches to URL via `useRouter().push()` with a `?q=` param on submit.
- Keyboard shortcut listener (`Cmd+K`) to focus search.

Why Client Component: needs `onClick`, `useState`, `useRouter`, browser keyboard events.

### `components/layout/Sidebar.tsx` (Server Component — desktop only, `hidden lg:block`)

Responsibilities:
- Render the `<SidebarNav>` list.
- Render category links from mock data (static import for now; replace with `async` fetch when backend lands).
- Render a "Submit Event" CTA at the bottom.
- Sticky positioning (`sticky top-0 h-screen overflow-y-auto`).

Visible only on `lg+` breakpoint via Tailwind. Mobile uses `SidebarDrawer` instead.

### `components/layout/SidebarDrawer.tsx` (`'use client'`)

Responsibilities:
- Reads `isSidebarOpen` and `closeSidebar` from `NavigationProvider` context.
- Wraps `<SidebarNav>` inside a shadcn/ui `<Sheet side="left">`.
- Handles focus trapping and `Escape` key dismissal (Sheet provides this).
- Renders on all breakpoints but is hidden by default; only opened on mobile via `HeaderActions`.

### `components/layout/SidebarNav.tsx` (Server Component)

Responsibilities:
- Pure presentational list of nav items (no state, no interactivity).
- Accepts `items: NavItem[]` prop.
- Uses Next.js `<Link>` for client-side navigation.
- Highlights active route — uses a thin `'use client'` wrapper `ActiveLink.tsx` per item to call `usePathname()`.

### `components/providers/NavigationProvider.tsx` (`'use client'`)

Responsibilities:
- Provides `{ isSidebarOpen, openSidebar, closeSidebar, toggleSidebar }` via React Context.
- Owns the single boolean that controls mobile drawer visibility.
- Mounted once in `app/layout.tsx` wrapping `AppShell`.

---

## 3. State Management

| State | Type | Owner | Why here |
|---|---|---|---|
| Mobile sidebar open/close | Client UI state | `NavigationProvider` (Context) | Shared between `HeaderActions` (toggle button) and `SidebarDrawer` (consumer). Scoped to layout, not global app state. |
| Search query (input value) | Local component state | `HeaderActions` (`useState`) | Only needed within the input before submission. |
| Active route | Derived from URL | `usePathname()` in `ActiveLink` | No stored state — derived from the router. |
| Nav items / categories | Static mock data | Imported directly into `Sidebar.tsx` | No async needed until backend exists. Swap for `async` Server Component fetch in Phase 4. |
| Auth / user | Not implemented yet | — | Placeholder only in Header for now. |

**Rationale — no Zustand yet:** With only two components sharing sidebar state, a Context provider is the right fit. Zustand should be introduced when global state spans more than layout concerns (e.g. event cart, saved events, auth session).

---

## 4. Responsive Design

### Breakpoint strategy

Using Tailwind's default `lg` breakpoint (1024px) as the sidebar toggle threshold — this is appropriate for an event aggregator where the sidebar carries category filters that benefit from persistent visibility on tablet-landscape and above.

| Viewport | Sidebar behavior | Header behavior |
|---|---|---|
| `< lg` (mobile / tablet-portrait) | Hidden; accessible via Sheet drawer from left | Shows hamburger icon (from `HeaderActions`) |
| `>= lg` (tablet-landscape / desktop) | Always visible, `240px` fixed left column | Hamburger hidden (`lg:hidden` on the toggle button) |

### Implementation notes

- `Sidebar.tsx` has `className="hidden lg:flex"` — excluded from mobile DOM flow entirely.
- `SidebarDrawer.tsx` renders at all sizes but the `Sheet` is only open when `isSidebarOpen === true`. On desktop, the trigger button is hidden so it is never opened.
- The `<Sheet>` component from shadcn/ui provides accessible focus trapping, `Escape` dismissal, and `aria-modal`. No custom trap logic needed.
- `AppShell.tsx` layout: `flex flex-col min-h-screen` outer, `flex flex-1` inner row containing sidebar + main.

### Accessibility

- `<header>` element with `role="banner"` on `Header.tsx`.
- `<nav>` element with `aria-label="Main navigation"` wrapping `SidebarNav.tsx`.
- Mobile drawer: `aria-label="Site navigation"` on the `Sheet` content.
- Hamburger button: `aria-label="Open navigation menu"` / `aria-expanded` toggled by context state.
- Active link: `aria-current="page"` set by `ActiveLink.tsx` when `pathname` matches.
- Focus is returned to the hamburger trigger on `SidebarDrawer` close.

---

## 5. Recommended shadcn/ui Components

Install with `npx shadcn@latest add <component>` from inside `frontend/`.

| Component | Used in | Purpose |
|---|---|---|
| `sheet` | `SidebarDrawer` | Mobile sidebar drawer with focus trap and overlay |
| `button` | `HeaderActions`, Sidebar CTA | Consistent button variants (ghost for icon buttons) |
| `input` | `HeaderActions` search | Styled search input |
| `separator` | `SidebarNav` | Visual divider between nav sections |
| `badge` | `SidebarNav` category items | Event count badges next to category labels |
| `tooltip` | Sidebar icon labels (future collapsed state) | Accessible hover labels |

**Do not install yet:** `navigation-menu`, `dropdown-menu` — add when auth dropdown and mega-menu are scoped. Installing unused components adds bundle weight.

---

## 6. Mock Data Contract (Phase 3)

Until the backend exists, `Sidebar.tsx` imports from:

```
frontend/components/layout/_data/nav-items.ts
```

Expected shape:

```typescript
export interface NavItem {
  label: string
  href: string
  icon?: string          // Lucide icon name
  badgeCount?: number    // Optional event count
}

export interface NavSection {
  title?: string         // Optional section heading
  items: NavItem[]
}
```

Example sections:
- **Discover**: All Events, This Weekend, Free Events, Online Events
- **By State**: NSW, VIC, QLD, WA, SA, TAS, ACT, NT
- **Categories**: Music, Arts, Food & Drink, Sport, Community, Festivals

This shape maps directly to what a future `/api/nav` endpoint would return.

---

## 7. Server vs Client Component Boundary Summary

```
app/layout.tsx              [Server]
  └── NavigationProvider    [Client]  ← context boundary
        └── AppShell        [Server]
              ├── Header    [Server]
              │     └── HeaderActions  [Client]  ← toggle + search
              ├── Sidebar   [Server]              ← desktop only
              │     └── SidebarNav    [Server]
              │           └── ActiveLink [Client] ← usePathname per item
              ├── SidebarDrawer  [Client]          ← mobile Sheet
              │     └── SidebarNav    [Server]    ← same component, different context
              └── {children}    [Server pages]
```

Key rule from Next.js 16 docs: keep `'use client'` boundaries as **leaf-level as possible** to minimise JavaScript sent to the browser. `Header`, `Sidebar`, `AppShell`, and `SidebarNav` should remain Server Components. Only interactive leaves (`HeaderActions`, `SidebarDrawer`, `ActiveLink`, `NavigationProvider`) cross the boundary.

---

## 8. Implementation Order (for 2-engineer team)

| Step | Owner | File(s) | Notes |
|---|---|---|---|
| 1 | Either | `NavigationProvider.tsx` | Simple context, no dependencies |
| 2 | Either | `_data/nav-items.ts` | Static mock, unblocks sidebar |
| 3 | Engineer A | `SidebarNav.tsx`, `ActiveLink.tsx` | Server + one client leaf |
| 4 | Engineer A | `Sidebar.tsx`, `SidebarDrawer.tsx` | Needs sheet installed |
| 5 | Engineer B | `HeaderActions.tsx` | Needs button + input installed |
| 6 | Engineer B | `Header.tsx` | Composes logo + HeaderActions |
| 7 | Either | `AppShell.tsx` | Composes all layout pieces |
| 8 | Either | `app/layout.tsx` | Wire NavigationProvider + AppShell |

Install shadcn components before step 3: `npx shadcn@latest add sheet button input separator badge`

---

## 9. Future Considerations

- **Collapsed sidebar state** (icon-only mode on desktop): add `isCollapsed` to `NavigationProvider`; `Sidebar` reads it via context to switch between full and icon-only render.
- **Auth integration**: `Header.tsx` gets an `async` user fetch; auth action buttons move from placeholder to a `UserMenu` Client Component.
- **Category counts from API**: `Sidebar.tsx` becomes `async`, fetches live counts. Add `'use cache'` with a short `cacheLife` (e.g. 5 minutes) to avoid re-fetching on every navigation.
- **`unstable_instant`**: Once caching is introduced, add `export const unstable_instant = { prefetch: 'static' }` to the main event listing pages and validate with Next.js DevTools instant navigation panel.
