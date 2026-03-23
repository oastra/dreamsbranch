# DreamsBranch

**Dreams Branch of UWAA — Help Ukraine Win**

Bilingual (UA/EN) community platform for a Ukrainian-Australian charity. Built with Next.js, Supabase, Prisma, Stripe + PayPal.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **i18n**: next-intl (UA/EN with browser detection)
- **Payments**: Stripe + PayPal (Phase 1)
- **Email**: Resend
- **Hosting**: Vercel

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd dreamsbranch
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Project Settings → Database** and copy:
   - Connection string (URI with pgbouncer) → `DATABASE_URL`
   - Direct connection string → `DIRECT_URL`
4. Go to **Storage** and create a public bucket called `media`

### 3. Create admin user in Supabase Auth

Go to **Authentication → Users** in Supabase dashboard and create a user:
- Email: `admin@dreamsbranch.org`
- Password: `admin123` (change in production!)

### 4. Configure environment

```bash
cp .env.example .env.local
# Fill in your Supabase credentials
```

### 5. Set up database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — public site
Open [http://localhost:3000/admin](http://localhost:3000/admin) — admin panel

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Public pages (i18n)
│   │   ├── page.tsx       # Home
│   │   ├── campaigns/     # Fundraising
│   │   ├── events/        # Events
│   │   ├── news/          # News
│   │   ├── reports/       # Annual reports
│   │   ├── contact/       # Contact form
│   │   ├── shop/          # Shop (Phase 2)
│   │   └── about/         # About us
│   ├── admin/             # Admin panel (protected)
│   │   ├── page.tsx       # Dashboard
│   │   ├── login/         # Login page
│   │   ├── campaigns/     # Campaign CRUD
│   │   ├── events/        # Event CRUD
│   │   ├── news/          # Article CRUD
│   │   ├── reports/       # Report CRUD
│   │   ├── donations/     # Donation list + manual entry
│   │   ├── contacts/      # Contact inbox
│   │   └── home-settings/ # Home page editor
│   ├── api/               # Route Handlers (webhooks only)
│   │   └── payments/
│   └── auth/              # Supabase auth callback
├── components/
│   ├── layout/            # Header, Footer
│   └── admin/             # Admin sidebar
├── lib/
│   ├── db/                # Prisma client
│   ├── supabase/          # Supabase clients (browser, server, storage)
│   ├── auth/              # Auth helpers + role checks
│   ├── payments/          # Payment abstraction layer
│   ├── utils.ts           # Utility functions
│   └── validations.ts     # Zod schemas
├── i18n/                  # next-intl config
└── middleware.ts          # i18n detection + Supabase session refresh

messages/
├── en.json                # English translations
└── ua.json                # Ukrainian translations

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Test data
```

## Data Flow Patterns

- **Server Components** → direct Prisma queries (public pages)
- **Server Actions** → mutations (admin CRUD, contact form, payment initiation)
- **Route Handlers** → webhooks only (Stripe, PayPal)

## Development Phases

- **Phase 1 (MVP)**: Campaigns, donations (Stripe+PayPal), events, news, reports, contact, admin panel
- **Phase 2**: Shop with cart + checkout, catering inquiry, about page
- **Phase 3**: Auctions, lotteries, user accounts, real-time (Supabase Realtime)
