---
name: Project overview
description: job-tracker is a Next.js 16 + Prisma + PostgreSQL app for tracking job applications — routes, schema, stack
type: project
---

Next.js 16.2.4 (App Router, Turbopack), Prisma v7 with `@prisma/adapter-pg`, PostgreSQL. Tailwind CSS v4, TypeScript strict mode.

**Why:** Personal job-application tracker. No auth yet.

**Routes:**
- `/` — Dashboard (stats, donut chart, platform bars, recent applications table)
- `/applications` — Full applications list with filter pills
- `/applications/[id]` — Application detail page
- `/analytics` — Recharts analytics (weekly line chart, status bar chart, platform table, top companies)
- `/calendar` — Placeholder
- `/saved` — Saved jobs page with "+ Save job" modal (POSTs to /api/saved-jobs)
- `/api/applications` — CRUD
- `/api/applications/[id]` — PATCH/DELETE single
- `/api/stats` — Returns Stats + AnalyticsStats fields (weekly, avg response, rates, platform perf, top companies)
- `/api/saved-jobs` — GET / POST

**Schema:** Application, StatusHistory, SavedJob (all already in generated Prisma client)

**Shared layout:** `PageShell` component wraps Sidebar + content for all non-dashboard pages. Dashboard.tsx embeds Sidebar directly.

**Sidebar:** Client component using `usePathname` + `next/link` — 5 nav items with active state.

**How to apply:** When adding new pages, use `PageShell` as the outer shell. New API routes import from `@/lib/prisma`.
