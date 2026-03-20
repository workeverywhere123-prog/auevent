# AUEvent Navigation Components — Product Requirements Document

> **Summary**: Define the Sidebar and Header navigation components for the AUEvent frontend, enabling users to browse and filter Australian events efficiently.
>
> **Project**: AUEvent (Australian Event Aggregator)
> **Version**: 0.1.0
> **Author**: Product Manager
> **Created**: 2026-03-20
> **Last Modified**: 2026-03-20
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Users visiting AUEvent have no navigation structure to orient themselves, browse event categories, or move between sections of the app. |
| **Solution** | Build a persistent Header (top bar) and collapsible Sidebar (left panel) as the primary navigation shell for the Next.js frontend. |
| **Function/UX Effect** | Users can immediately understand the app structure, navigate to event categories, and access key actions without disorientation. |
| **Core Value** | A clear, consistent navigation layer lowers cognitive load and sets the foundation for all future feature surfaces (search, filters, user profile). |

---

## 1. Feature Overview & Goals

### 1.1 Purpose

AUEvent is a web application that aggregates Australian events sourced from open data portals (e.g., data.gov.au, state government APIs). The application currently has no navigation structure. Before any event-browsing features can be built, a reliable navigation shell must exist.

This PRD covers two navigation components:
- **Header**: Top-level app bar providing brand identity, global actions, and mobile navigation toggle.
- **Sidebar**: Left-panel navigation for event categories, filters, and section links.

### 1.2 Background

The frontend is a fresh Next.js 16 + TypeScript + Tailwind CSS project. No layout components exist yet beyond the root `layout.tsx`. The team (SSO as Lead Engineer, 안종태 as Engineer) will implement these components as the first frontend milestone before backend integration.

Navigation must be designed frontend-only — no auth, no API calls — with placeholder data until the backend is ready.

### 1.3 Goals

| Goal | Description |
|------|-------------|
| G-01 | Give users a consistent navigation shell across all pages |
| G-02 | Support browsing by Australian state/territory and event category |
| G-03 | Provide a responsive layout that works on mobile and desktop |
| G-04 | Establish a component architecture pattern the team will follow for future features |

### 1.4 Non-Goals (Current Iteration)

- User authentication / login UI
- Real API data integration
- Search functionality
- Notifications or alerts
- User profile / settings pages

---

## 2. User Stories

### 2.1 Header

**US-H01 — Brand Recognition**
As a first-time visitor, I want to see the AUEvent logo and name in the header so that I immediately know which product I am using.

Acceptance Criteria:
- The header displays the AUEvent logo/wordmark on the left side.
- The logo links back to the home page (`/`).
- Visible on all routes.

---

**US-H02 — Primary Navigation Links**
As a user, I want quick-access links in the header so that I can jump to the main sections of the app without opening the sidebar.

Acceptance Criteria:
- Header contains at minimum: "Events", "Map", "About" links.
- Active link is visually distinguished (e.g., underline, bold, or colour change).
- Links are reachable via keyboard (`Tab` navigation).

---

**US-H03 — Mobile Navigation Toggle**
As a mobile user, I want a hamburger/menu button in the header so that I can open and close the sidebar on small screens.

Acceptance Criteria:
- On screens narrower than `md` breakpoint (768px), primary nav links are hidden and a hamburger icon appears.
- Tapping the hamburger icon opens the Sidebar as an overlay.
- Tapping outside the overlay or pressing Escape closes it.
- The toggle button has an accessible `aria-label`.

---

**US-H04 — Consistent Top Bar Height**
As a developer, I want the header to have a fixed, predictable height so that page content is not obscured by the navigation bar.

Acceptance Criteria:
- Header is `position: sticky` at the top.
- Main content area has correct top offset to avoid overlap.
- Height is defined as a Tailwind class or CSS variable so other components can reference it.

---

### 2.2 Sidebar

**US-S01 — Category Navigation**
As an event browser, I want to see a list of event categories in the sidebar so that I can filter events by type.

Acceptance Criteria:
- Sidebar displays categories such as: Music, Sports, Arts & Culture, Family, Food & Drink, Community, Technology.
- Each category is a clickable link or button.
- The currently active category is visually highlighted.
- Categories use placeholder data (static list) until the backend is ready.

---

**US-S02 — State/Territory Filter**
As a user, I want to filter events by Australian state or territory so that I can find events near me.

Acceptance Criteria:
- Sidebar includes a "Location" section listing: NSW, VIC, QLD, WA, SA, TAS, ACT, NT.
- Selecting a state visually marks it as active.
- Multiple states can be selected simultaneously (multi-select pattern).
- State abbreviations are used in the list with full names as tooltip or secondary text.

---

**US-S03 — Sidebar Collapse on Desktop**
As a power user on desktop, I want to collapse the sidebar so that I have more horizontal space to browse events.

Acceptance Criteria:
- A collapse/expand toggle button is visible on the sidebar (e.g., chevron icon).
- When collapsed, the sidebar shrinks to show only icons (icon-only rail mode) or hides completely.
- The layout reflows so the content area expands to fill the available width.
- Collapse state persists in `localStorage` so it is remembered on page reload.

---

**US-S04 — Mobile Sidebar Overlay**
As a mobile user, I want the sidebar to appear as a slide-in drawer so that it does not permanently consume screen space.

Acceptance Criteria:
- On `md` breakpoint and below, the sidebar is hidden by default.
- Opening is triggered by the Header hamburger button (US-H03).
- The drawer slides in from the left with a smooth transition (150–250ms).
- A semi-transparent backdrop covers the content area while the drawer is open.
- Closing can be done via the backdrop tap, Escape key, or an explicit close button within the drawer.

---

**US-S05 — Sidebar Section Labels**
As a user, I want section headings in the sidebar so that I can quickly scan what types of navigation options are available.

Acceptance Criteria:
- Category list has a visible section label (e.g., "Categories").
- Location filter has a visible section label (e.g., "Location").
- Section labels are not interactive (not clickable links).
- Labels are visually distinct from nav items (smaller, muted colour).

---

## 3. Functional Requirements

| ID | Requirement | Priority | MoSCoW |
|----|-------------|----------|--------|
| FR-01 | Header renders a logo/wordmark linking to `/` | High | Must |
| FR-02 | Header renders primary nav links (Events, Map, About) | High | Must |
| FR-03 | Header includes a mobile hamburger toggle that controls sidebar visibility | High | Must |
| FR-04 | Header is sticky at the top of the viewport | High | Must |
| FR-05 | Sidebar renders a static list of event categories | High | Must |
| FR-06 | Sidebar renders Australian state/territory filters | High | Must |
| FR-07 | Sidebar supports desktop collapse/expand with icon-rail fallback | Medium | Should |
| FR-08 | Sidebar collapse state is persisted to `localStorage` | Medium | Should |
| FR-09 | Sidebar renders as a slide-in overlay on mobile | High | Must |
| FR-10 | Sidebar overlay closes on backdrop click or Escape key | High | Must |
| FR-11 | Active nav item (category, state, or link) is visually highlighted | High | Must |
| FR-12 | All interactive elements are keyboard-navigable and ARIA-labelled | Medium | Should |
| FR-13 | Sidebar section labels are present and visually distinct | Low | Could |
| FR-14 | Navigation state (active category, selected states) is managed via React state | High | Must |

---

## 4. UI/UX Requirements

### 4.1 Layout Structure

```
┌──────────────────────────────────────────────────┐
│  HEADER (sticky, full width, z-index: above all) │
├──────────────┬───────────────────────────────────┤
│              │                                   │
│   SIDEBAR    │        MAIN CONTENT AREA          │
│  (fixed L)   │                                   │
│              │                                   │
└──────────────┴───────────────────────────────────┘
```

- Header height: 64px (h-16 in Tailwind).
- Sidebar width (expanded): 240px (w-60 in Tailwind).
- Sidebar width (collapsed/rail): 64px (w-16 in Tailwind).
- Main content area fills remaining width.

### 4.2 Responsive Breakpoints

| Breakpoint | Sidebar Behaviour | Header Behaviour |
|------------|-------------------|-----------------|
| `< md` (< 768px) | Hidden; opens as overlay drawer | Hamburger icon shown; nav links hidden |
| `md` (768px–1023px) | Collapsed rail mode by default | Full header with nav links |
| `>= lg` (>= 1024px) | Expanded by default | Full header with nav links |

### 4.3 Visual Design Principles

- **Colour palette**: Use Tailwind's default palette. Suggested base: neutral/slate for sidebar background, white for header. Brand accent colour TBD (reserve a CSS variable `--color-brand`).
- **Typography**: Use the existing Geist Sans font loaded in `layout.tsx`.
- **Icons**: Use a lightweight icon library (e.g., `lucide-react`) for nav icons, hamburger, chevron, and state/category icons. Icon library selection is subject to Lead Engineer approval.
- **Spacing**: Follow Tailwind's spacing scale consistently (4px base unit).
- **Dark mode**: Out of scope for this iteration. Structure CSS variables to make future dark mode addition straightforward.

### 4.4 Accessibility Requirements

- All interactive elements must have visible focus indicators.
- Sidebar overlay must trap focus while open (`focus-trap` pattern).
- Hamburger button must have `aria-expanded` reflecting sidebar state.
- Nav links must use semantic `<nav>` element with `aria-label`.
- Colour contrast must meet WCAG 2.1 AA (4.5:1 for normal text).

### 4.5 Animation & Motion

- Sidebar overlay slide-in: `transition: transform 200ms ease-in-out`.
- Backdrop fade-in: `transition: opacity 150ms ease`.
- Collapse/expand on desktop: `transition: width 200ms ease`.
- Respect `prefers-reduced-motion` — skip transitions when enabled.

---

## 5. Acceptance Criteria (Definition of Done)

### 5.1 Component Delivery

- [ ] `Header` component created at `frontend/components/layout/Header.tsx`
- [ ] `Sidebar` component created at `frontend/components/layout/Sidebar.tsx`
- [ ] Root `layout.tsx` updated to render Header + Sidebar wrapper around `{children}`
- [ ] Components are written in TypeScript with explicit prop types
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No ESLint errors (`eslint` passes)

### 5.2 Functional Acceptance

- [ ] Header logo visible and links to `/` on all pages
- [ ] Header primary nav links render and active state is highlighted
- [ ] Hamburger button appears on mobile; hidden on desktop
- [ ] Sidebar renders all 7 event categories
- [ ] Sidebar renders all 8 Australian states/territories
- [ ] Sidebar opens as overlay on mobile when hamburger is tapped
- [ ] Sidebar overlay closes on backdrop click and Escape key
- [ ] Sidebar collapse/expand works on desktop
- [ ] Collapse state persists across page reloads (`localStorage`)

### 5.3 Quality Acceptance

- [ ] Manual testing completed on Chrome, Safari (latest)
- [ ] Manual testing on mobile viewport (375px width)
- [ ] All interactive elements reachable via keyboard Tab
- [ ] `aria-label` present on hamburger button, sidebar nav, and header nav
- [ ] No layout shift when sidebar collapses/expands
- [ ] Build succeeds (`next build` passes without errors)

---

## 6. Scope

### 6.1 In Scope

- [ ] Header component (logo, nav links, mobile toggle)
- [ ] Sidebar component (categories, state filters, collapse, mobile overlay)
- [ ] Layout wrapper integrating Header + Sidebar
- [ ] Static/placeholder navigation data
- [ ] Responsive behaviour across mobile, tablet, desktop
- [ ] Accessibility baseline (ARIA, keyboard nav)

### 6.2 Out of Scope

- User authentication UI
- Search bar or search results
- Real data from backend APIs
- Dark mode
- Internationalisation (i18n)
- Breadcrumbs
- User profile menu / avatar
- Notification bell

---

## 7. Architecture Considerations

### 7.1 Project Level

**Starter** — appropriate for this frontend-only phase. Simple `components/`, `lib/`, `types/` structure within the `frontend/` directory.

### 7.2 Component File Structure

```
frontend/
  components/
    layout/
      Header.tsx
      Sidebar.tsx
      SidebarNav.tsx        # internal nav item list
      MobileOverlay.tsx     # backdrop + focus trap wrapper
  types/
    navigation.ts           # NavItem, Category, StateFilter types
  lib/
    navigation-data.ts      # static category + state placeholder data
```

### 7.3 State Management

- Sidebar open/closed state: React `useState` in a shared layout context or passed as props from the root layout.
- Active nav item: managed via Next.js `usePathname()` hook for route-based highlighting.
- Collapse preference: `localStorage` read/write via a small custom hook (`useLocalStorage`).
- No external state library needed for this phase.

### 7.4 Key Technical Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Framework | Next.js 16 (App Router) | Already in project |
| Styling | Tailwind CSS v4 | Already in project |
| Icons | `lucide-react` (proposed) | Lightweight, tree-shakable, TypeScript-native |
| State | React `useState` + `usePathname` | Sufficient for navigation scope |
| Focus trap | Custom hook or `focus-trap-react` | Required for accessible mobile overlay |

---

## 8. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Next.js 16 App Router has breaking changes vs earlier versions | High | Medium | Read `node_modules/next/dist/docs/` before implementation (per AGENTS.md). SSO to confirm Router conventions. |
| Tailwind CSS v4 config syntax differs from v3 | Medium | Medium | Check `postcss.config.mjs` and Tailwind v4 docs before writing config-dependent styles. |
| Icon library adds unnecessary bundle weight | Low | Low | Audit bundle size post-implementation; switch to inline SVG if needed. |
| Collapse state using `localStorage` causes SSR hydration mismatch | Medium | Medium | Read collapse state only on client (`useEffect`) to avoid SSR/client mismatch. |
| Mobile overlay lacks focus trap, causing accessibility failure | High | Medium | Implement focus trap pattern before QA sign-off; include in acceptance checklist. |

---

## 9. Timeline

| Milestone | Owner | Target |
|-----------|-------|--------|
| PRD review and approval | SSO (Lead) | 2026-03-23 |
| Header component implementation | 안종태 | 2026-03-25 |
| Sidebar component implementation | 안종태 | 2026-03-27 |
| Layout integration + responsive testing | SSO + 안종태 | 2026-03-28 |
| Accessibility review | SSO | 2026-03-29 |
| Sign-off / merge to main | SSO | 2026-03-31 |

---

## 10. Related Documents

- Design document (to be created): `docs/02-design/features/navigation.design.md`
- Plan document (PDCA): `docs/01-plan/features/navigation.plan.md`
- Frontend entry point: `frontend/app/layout.tsx`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-20 | Initial draft | PM Agent |
