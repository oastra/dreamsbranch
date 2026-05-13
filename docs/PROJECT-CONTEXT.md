# Dreams Branch — Project Context

> Paste this whole file (or its key sections) into a fresh Claude / Cursor session
> to skip the ramp-up. It captures the project's identity, stack, conventions, and
> open work, so the next session picks up cleanly.

You are helping continue a Next.js 16 charity website called **Dreams Branch of UWAA**
(Union of Ukrainian Women of Australia). The site is bilingual (UA + EN, UA is primary),
deployed on Vercel, and edited via a custom admin panel by 1–2 content managers.

## Repo & stack
- Path: `/Users/olha_chernysh/Documents/FREELANCE/Projects/dreams_branch/www-dreamsbranch`
- Repo: `github.com/oastra/dreamsbranch` — `develop` is the working branch; `main` is
  the static "coming soon" landing page (Vercel uses per-branch `vercel.json`).
- Next.js 16.2.0 with the App Router + Turbopack
- Tailwind CSS v4 (CSS-first `@theme` tokens, no `tailwind.config.js`)
- `next-intl` for i18n (UA = default, EN = secondary), per-locale routes under `/[locale]/...`
- Supabase (Postgres + Auth + Storage) — `supabase/migrations/*` drives the schema
- `base-ui` (`@base-ui/react`) for primitives (Button, Dialog, …)
- shadcn-style structure under `src/components/ui/`

## Design system
Brand tokens live in `src/app/tokens.css` (CSS-first `@theme`):

- **Primary (yellow)**: `#FFD700` (+ 80/60/40/20/10 tints)
- **Secondary (blue)**: `#0057B8` (+ 140/120/40/20/10 tints)
- **Greys**:
  - `grey-100` `#2D3748` = `text-strong`
  - `grey-main-text` `#4A5568` = `text-primary` (body copy)
  - `grey-80` `#6D6C6C` = `text-secondary` (muted captions)
  - `grey-40/20/10` are neutrals
- **Don't use raw hex literals** — use the tokens (`text-text-strong`,
  `text-text-primary`, `text-text-secondary`, `bg-secondary-10`, etc.)
- **Card-hover shadow**: `shadow-card-hover` utility = `0 8px 24px rgba(0,87,184,.32)`
  (Figma "Drop"). Applied to every clickable card.

## Button system (THE source of truth)
All public-site CTAs go through `<Button>` (`src/components/ui/button.tsx`) and its
variants in `src/components/ui/button-variants.ts`. The component adds a cursor-origin
ripple via `[data-slot="button"]::before` (definition in `globals.css`).

**Variants:**

| Variant | Surface | At rest | On hover |
|---|---|---|---|
| `default` | White / light | Blue pill, white text | Yellow ripple, grey text |
| `secondary` | Blue | Yellow pill, grey text | White ripple + blue text + 3px yellow ring |
| `default-on-yellow` | Yellow | Blue pill, white text | White ripple + blue text + 3px blue ring |
| `outline` + `shape="pill"` | Anywhere | White pill, blue border + blue text | Blue ripple, white text |
| `outline` (no `pill`) | Admin | Grey border, dark text | Subtle bg |

**Sizes:** `xl` is the marketing CTA size (`h-13.5` = 54px, `px-10` = 40px, matches
Figma "Button" component). Pair with `shape="pill"` for rounded.

**Rendering as a link:** use `<Button render={<Link href="..." />}>`. Button
auto-sets `nativeButton={false}` so base-ui doesn't warn. 3px outlines use `ring-3`
not `border` so hover doesn't shift layout. Every variant has a `hover:bg-*` fallback
so even Link-style usages (no ripple JS) get the right color transition.

⚠ Do **not** reintroduce `.btn-primary` / `.btn-outline` CSS utilities — they were
removed in favor of `buttonVariants`.

## Layout conventions
- `container-page` — page horizontal padding (`mx-auto max-w-content px-5 sm:px-8
  xl:px-20`, max-w-content = 1440px). Every section's content sits inside one.
- `section` — vertical rhythm (`py-6 md:py-8 lg:py-20`).
- `<section>` is the landmark; horizontal padding belongs on `container-page`, not on
  the `<section>` itself. Never paint the visual card (`rounded-* bg-*`) directly on
  the `<section>` — the card lives on an inner `<div>` so it respects page padding.
- Mobile/tablet breakpoint at `sm` (640px) and `lg` (1024px) is the desktop boundary.
- **Card-row pattern** on home / preview rows: scroll-snap horizontal on mobile
  (`-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 ...`), grid on `sm+`.

## i18n
- Translations live in `messages/ua.json` and `messages/en.json`.
- **Per-locale slugs**: `campaigns` / `events` / `news` / `shop_products` tables have
  `slug_ua` and `slug_en` columns (migration `20260507000001_per_locale_slugs.sql`);
  legacy single `slug` column kept for redirects.
- UA-only slugs are transliterated to Latin via `lib/slug.ts` using KMU 2010
  (Ukrainian passport romanization). E.g. `"Допомога Україні" → "dopomoha-ukraini"`.
  Cyrillic slugs were explicitly rejected in favor of Latin (better for sharing,
  analytics, cache).

## Database (Supabase)
- Single Supabase project; admin client (service role) bypasses RLS for the admin
  panel.
- **DB helper** at `src/lib/db/index.ts` — Prisma-like API on top of supabase-js.
  Includes `writeWithSlugFallback` which silently drops unknown columns on a 42703
  Postgres error so newly added columns ship before their migration is applied.
- **Audit columns** on `campaigns` / `events` / `news_articles`:
  `created_by_admin_id` and `updated_by_admin_id` (FK `admin_users(id)` on delete
  set null). Server actions stamp the admin from `requireAdmin()`. Admin list tables
  show "Edited by X · 3d ago" via `components/admin/shared/edited-by-cell.tsx`.
- All migrations live in `supabase/migrations/` — apply with `supabase db push` (or
  via the Supabase dashboard SQL editor). Most recent is
  `20260512000001_admin_audit_columns.sql`.

## Admin panel
- Routes under `src/app/admin/(protected)/`. Auth via Supabase Auth + `admin_users` table.
- `requireAdmin()` / `requireSuperAdmin()` in `src/lib/auth/helpers.ts` gate routes
  and server actions.
- Admin UI is English-only.
- **Slug fields are read-only** in admin forms (URL stability). Slugs auto-generate
  on create from each locale's title; on edit, title changes don't touch the slug.
  Developer overrides go directly through Supabase Studio.
- **Campaigns require both UA + EN titles AND descriptions** to save. New campaigns
  pre-fill the FAQ tab with `campaigns.default_faq` from `messages/{ua,en}.json` so
  the content manager has a starting set to edit.
- Content-manager docs live in:
  - `docs/CONTENT-MANAGER-EVENTS.md`
  - `docs/CONTENT-MANAGER-CAMPAIGNS.md`
  - `docs/CLIENT-PAYMENTS-SETUP.md`

## Payments
- Stripe + PayPal planned (see `docs/CLIENT-PAYMENTS-SETUP.md`). `.env` keys:
  `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`,
  `PAYPAL_WEBHOOK_ID`. Donation flow on `/campaigns/[slug]` is not wired yet.

## Pages built so far
- `/` home (hero with masked carousel + 2 CTAs, Results, Story, About preview,
  Active campaigns row, Events placeholder, **News preview**, Support, Contact)
- `/about` (full About page)
- `/campaigns` + `/campaigns/[slug]` (with FAQ tab + DonationAmountCard buttons)
- `/events` + `/events/[slug]` (active + archived variants, ShareSection,
  VolunteerCTA, financial report)
- `/news` + `/news/[slug]` (with FeaturedNewsCard hero)
- `/shop`, `/shop/[category]`, `/shop/product/[slug]`
- `/donate`
- `/reports`
- `/privacy`
- `/contact`

## Reusable components worth knowing
- `<ContactSection title description />` — bottom-of-page form panel (image + form)
- `<SupportSection locale />` — multi-channel donate row
- `<ResultsSection title description stats />` — 4-stat headline numbers
- `<StorySection />`, `<HomeAboutSection />` — home-only narrative blocks
- `<VolunteerCTA />` — yellow card with image + CTA (`lg:h-[302px]`, opt out via
  `lg:!h-auto`)
- `<ReportsBanner />` — blue full-width banner with yellow CTA
- `<ShareSection />` — copy-link + social share row
- `<FaqAccordion items />` — used on /about, /donate, /campaigns/[slug]
- `<EditedByCell />` — admin "who/when" cell

## Conventions
- Don't add comments unless they explain a non-obvious *why*.
- Prefer the `<Button>` component for any new CTA — never reinvent button styling.
- Don't introduce raw hex colors except brand-mandated externals (PayPal `#FFC439`).
- For card-style sections: `container-page > div.rounded-3xl bg-secondary-10 p-5
  sm:p-8 lg:p-12 > content`. Title centered above, two-col grid below if needed.
- Server actions: validate with zod (schemas in `src/lib/validations.ts`), call
  `requireAdmin()`, use db helper, `revalidatePath()`.
- For URL changes / slug fixes / "did this content manager break a URL?":
  fix via SQL in Supabase Studio, optionally add a redirect.

## Open / known
- Carousel arrow icon buttons (`CampaignsCarousel`, `RelatedEventsCarousel`,
  `PhotoReportCarousel`, `ReviewsCarousel`) aren't migrated to `<Button>` — they need
  an `iconCircle` size variant first.
- Header/mobile-nav locale switcher is its own component, not part of `buttonVariants`.
- `/events` placeholder on the home page is still a stub, not wired to the DB.
- Donation flow (Stripe/PayPal) is awaiting keys from the client.

## How to work
- Run `npm run dev` (Turbopack). If anything looks weird in CSS, the fix is usually
  `rm -rf .next && npm run dev` — Turbopack caches aggressively.
- Typecheck with `npx tsc --noEmit`.
- Match existing patterns; don't introduce parallel ways to do the same thing.
- Commit messages follow `feat(scope): summary` / `fix(scope): summary` style.
- Don't push without being told to.
