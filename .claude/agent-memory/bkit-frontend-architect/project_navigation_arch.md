---
name: AUEvent navigation architecture decision
description: Agreed component structure and state approach for Sidebar and Header — documented in ARCH-navigation.md
type: project
---

Navigation architecture for Sidebar + Header was designed on 2026-03-20 and saved to `/Users/anjongtae/Desktop/auevent/docs/ARCH-navigation.md`.

Key decisions:
- `NavigationProvider` (Client Context) owns mobile sidebar open/close boolean — shared between `HeaderActions` (toggle button) and `SidebarDrawer` (Sheet consumer).
- `Sidebar.tsx` is a Server Component, hidden on mobile (`hidden lg:flex`). `SidebarDrawer.tsx` is the mobile variant using shadcn `Sheet`.
- `Header.tsx` is a Server Component; only `HeaderActions.tsx` (search + hamburger) is `'use client'`.
- Active route highlight via thin `ActiveLink.tsx` client leaf using `usePathname()`.
- Mock nav data lives in `frontend/components/layout/_data/nav-items.ts`.
- `lg` breakpoint (1024px) is the mobile/desktop sidebar threshold.
- No Zustand yet — Context is sufficient until state spans beyond layout.

**Why**: Minimise client JS by keeping `'use client'` at leaf level per Next.js 16 docs recommendation.

**How to apply**: When implementing or modifying navigation components, respect the Server/Client boundary map in section 7 of ARCH-navigation.md.
