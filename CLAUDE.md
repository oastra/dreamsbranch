# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dreams Branch of UWAA — a bilingual (UA primary / EN secondary) charity website with a custom admin panel. Next.js 16 (App Router + Turbopack), Supabase (Postgres + Auth + Storage), Tailwind v4, deployed on Vercel. Edited by 1–2 non-technical content managers via the admin panel.

> **`docs/PROJECT-CONTEXT.md` is the canonical deep reference** — design tokens, the Button system, layout conventions, every built page, reusable components, and known open work. Read it before doing substantial UI work. This file is the short operational summary. (`README.md` is stale — it predates the current setup and references tooling that is no longer used.)

> **There is no ORM.** Supabase is the only data layer — supabase-js plus the custom `db` helper below. No Prisma, no `prisma/` directory, no `db:seed`.

## Commands

```bash
npm run dev          # Turbopack dev server → localhost:3000 (public), :3000/admin (panel)
npm run build        # production build
npm run lint         # eslint
npx tsc --noEmit     # typecheck (there is no typecheck script)
npm run types:db     # regenerate src/types/database.ts from the live Supabase schema
supabase db push     # apply supabase/migrations/* to the database
```

- CSS looks wrong after edits → `rm -rf .next && npm run dev` (Turbopack caches aggressively).
- No test framework is configured.

## Architecture

**Routing & i18n.** Two locales (`en`, `ua`; default `en`, but UA is the primary product language). Public pages live under `src/app/[locale]/...`. Locale detection/redirect happens in **`src/proxy.ts`** (Next 16's renamed middleware) — it skips `/api`, `/admin`, `/auth`, and static paths, so the admin panel is **not** localized. `next-intl` config is in `src/i18n/`; translations in `messages/{en,ua}.json`. Per-locale slugs (`slug_ua` / `slug_en` columns) let each locale have its own URL; UA titles are romanized to Latin via `src/lib/slug.ts`.

**Data layer.** `src/lib/db/index.ts` is a custom chainable wrapper over supabase-js (e.g. `db.campaign.create({ data })`) that uses the service-role (admin) client and **bypasses RLS** — it's for the admin panel and server actions, never the browser. Key conventions it enforces:
- Enums: Postgres stores lowercase (`published`), the app uses uppercase (`PUBLISHED`); `toDb()`/`fromDb()` convert. Column names auto-convert camelCase → snake_case.
- `writeWithSlugFallback` silently drops unknown columns on a Postgres `42703` error, so new columns can ship in code before their migration is applied.

**Supabase clients (`src/lib/supabase/`).** `client.ts` = browser (anon, respects RLS). `server.ts` exports `createClient()` (cookie-aware, respects RLS) and `createAdminClient()` (service-role, bypasses RLS — server-only).

**Auth & admin.** Supabase Auth backs an `admin_users` table. `src/lib/auth/helpers.ts` provides `getSession()`, `requireAdmin()`, `requireSuperAdmin()`, and `canManage*()` role checks. The admin panel is gated structurally: `src/app/admin/layout.tsx` is a pass-through (so `/admin/login` is reachable), while `src/app/admin/(protected)/layout.tsx` calls `requireAdmin()`. Admin UI is **English-only**.

**Server actions are the write path** (`src/lib/actions/*.ts`). The standard shape:
1. `requireAdmin()` (stamps `created_by_admin_id` / `updated_by_admin_id`),
2. validate with a zod schema from `src/lib/validations.ts`,
3. write via the `db` helper,
4. revalidate.

**Server actions must never throw** — a rejected promise leaves the admin form spinner stuck forever. Wrap the body in try/catch and return `{ success: false, error }`; map Postgres error codes to readable strings (see `dbErrorMessage` in `src/lib/actions/campaigns.ts`).

**Revalidation.** Use `revalidateLocalizedPath('/about')` from `src/lib/revalidate.ts` (path *without* the locale prefix, `''` for home) instead of `revalidatePath` with a `[locale]` segment — the dynamic-segment form is unreliable on Vercel's ISR cache.

**Storage & uploads.** Single public `media` bucket. Every upload runs through a `sharp` pipeline (`src/lib/supabase/storage.ts`): EXIF-oriented, resized to ≤2000×2000, re-encoded to WebP q85 (SVG/GIF bypass). Admin uploaders `<ImageUpload>` / `<MultiImageUpload>` self-clean Storage on remove/replace; `delete*` actions also fire `deleteFilesAction([...row urls])` (fire-and-forget) so the bucket doesn't accumulate orphans.

**Schema** lives entirely in `supabase/migrations/` (timestamped SQL). After changing it, run `npm run types:db` to regenerate `src/types/database.ts` (an eslint-ignored generated file).

## UI conventions (see PROJECT-CONTEXT.md for the full system)

- **All CTAs go through `<Button>`** (`src/components/ui/button.tsx` + `button-variants.ts`). Never reinvent button styling; the old `.btn-primary`/`.btn-outline` utilities were removed. Render as a link with `<Button render={<Link href=... />}>`.
- **No raw hex colors** — use the `@theme` tokens in `src/app/tokens.css` (`text-text-strong`, `bg-secondary-10`, etc.). Tailwind v4 is CSS-first; there is no `tailwind.config.js`. Brand-mandated externals (e.g. PayPal `#FFC439`) are the only exception.
- Layout primitives: `container-page` (horizontal padding, `max-w-content` 1440px) and `section` (vertical rhythm). Card visuals live on an inner `<div>`, never on the `<section>` landmark itself.
- base-ui (`@base-ui/react`) primitives; shadcn-style structure under `src/components/ui/` (config in `components.json`).
- Slug fields are **read-only** in admin forms (URL stability); slugs auto-generate on create.

## Workflow

- `develop` is the working branch; `main` is the static "coming soon" page (Vercel uses per-branch `vercel.json`).
- Commit style: `feat(scope): summary` / `fix(scope): summary`. Don't push unless asked.
- Match existing patterns; don't introduce a parallel way to do something that already exists.
