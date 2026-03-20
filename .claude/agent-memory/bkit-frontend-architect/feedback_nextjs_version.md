---
name: Always read local Next.js docs before writing code
description: This project uses Next.js 16.2.0 which has breaking changes — never rely on memorised APIs
type: feedback
---

Always read `frontend/node_modules/next/dist/docs/` before writing any Next.js code for this project.

**Why**: The AGENTS.md in `frontend/` explicitly states "This is NOT the Next.js you know. This version has breaking changes." Version is 16.2.0 — well beyond training data. Notable differences include: `params` is now a Promise in layouts and pages, `PageProps`/`LayoutProps` are globally available type helpers without imports, `unstable_instant` export for instant navigation validation, `use cache` directive for caching, `cacheComponents` config option.

**How to apply**: Before writing any page, layout, or component that touches routing or data fetching, read the relevant doc from the local `dist/docs/` tree first.
