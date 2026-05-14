/**
 * Supabase-backed DB client with a Prisma-like API.
 * Uses the admin (service-role) client so it bypasses RLS.
 *
 * Enum convention:
 *  • PostgreSQL stores lowercase  → 'super_admin', 'active', 'published'
 *  • App layer uses uppercase     → 'SUPER_ADMIN', 'ACTIVE', 'PUBLISHED'
 *  • toDb() / fromDb() convert between the two
 */
import { createAdminClient } from '../supabase/server';
import type {
  AdminUserInsert,
  AdminUserUpdate,
  CampaignInsert,
  CampaignUpdate,
  DonationInsert,
  EventInsert,
  EventUpdate,
  NewsArticleInsert,
  NewsArticleUpdate,
  ReportInsert,
  ReportUpdate,
  ShopCategoryInsert,
  ShopCategoryUpdate,
  ShopProductInsert,
  ShopProductUpdate,
  ShopPhotoReportInsert,
  ShopPhotoReportUpdate,
  ShopReviewInsert,
  ShopReviewUpdate,
} from '@/types/database';

// ─── Enum helpers ─────────────────────────────────────────────────────────────

function toDb(val: string): string {
  return val.toLowerCase();
}

function fromDb(val: string): string {
  return val.toUpperCase();
}

// ─── Column name helper (camelCase → snake_case) ─────────────────────────────

const COLUMN_MAP: Record<string, string> = {
  isRead: 'is_read',
  campaignId: 'campaign_id',
  isFeatured: 'is_featured',
  isAnonymous: 'is_anonymous',
  addedByAdminId: 'added_by_admin_id',
};

function col(key: string): string {
  return COLUMN_MAP[key] ?? key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// ─── Where-clause builder ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyWhere(query: any, where: Record<string, unknown>): any {
  for (const [key, val] of Object.entries(where)) {
    const column = col(key);
    if (typeof val === 'string') {
      query = query.eq(column, toDb(val));
    } else {
      query = query.eq(column, val);
    }
  }
  return query;
}

// ─── Decimal-like wrapper (matches Prisma's Decimal.toNumber()) ───────────────

class DecimalLike {
  constructor(private v: number) {}
  toNumber() { return this.v; }
}

// ─── Row normalisers ──────────────────────────────────────────────────────────

function normRole(row: Record<string, unknown>) {
  return { ...row, role: fromDb(row.role as string) };
}

function normStatus(row: Record<string, unknown>) {
  return { ...row, status: fromDb(row.status as string) };
}

function normStatusSource(row: Record<string, unknown>) {
  return {
    ...row,
    status: fromDb(row.status as string),
    source: fromDb(row.source as string),
  };
}

function normTag(row: Record<string, unknown>) {
  return { ...row, tag: fromDb(row.tag as string) };
}

// Retry a Supabase write while transparently dropping any column the
// target table doesn't have yet. Lets new optional columns ship before
// their migration has been applied without breaking existing writes —
// each unknown column is stripped on the next attempt and we keep going
// until the write succeeds or fails for an unrelated reason.
type DbErr = { code?: string; message?: string } | null;

function getMissingColumn(err: DbErr): string | null {
  if (!err) return null;
  const msg = err.message ?? '';
  // Postgres "column does not exist" (42703) — the SQL actually executed.
  if (err.code === '42703') {
    const m = /column .*?"?(\w+)"?.* does not exist/i.exec(msg);
    if (m) return m[1];
  }
  // PostgREST schema-cache miss (PGRST204) — Supabase rejects the request
  // before SQL runs because its cached schema doesn't yet know the column.
  // Same recovery: strip the column and retry so a write doesn't break
  // while a migration is still propagating.
  const cacheMatch = /Could not find the '(\w+)' column/i.exec(msg);
  if (cacheMatch) return cacheMatch[1];
  return null;
}

// Throws a DbWriteError on a non-recoverable failure so the caller can
// surface the message back to the UI. Recoverable "column does not exist"
// errors are still handled silently (column stripped + retried).
export class DbWriteError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'DbWriteError';
    this.code = code;
  }
}

async function writeWithSlugFallback<T>(
  attempt: (row: Record<string, unknown>) => PromiseLike<{ data: T | null; error: DbErr }>,
  row: Record<string, unknown>,
  context: string,
): Promise<T | null> {
  const stripped = new Set<string>();
  let current: Record<string, unknown> = row;
  let { data, error } = await attempt(current);
  while (error) {
    const col = getMissingColumn(error);
    if (!col || stripped.has(col) || !(col in current)) break;
    console.warn(`[${context}] column "${col}" missing — stripping and retrying. Run any pending migrations.`);
    stripped.add(col);
    current = { ...current };
    delete current[col];
    ({ data, error } = await attempt(current));
  }
  if (error) {
    console.error(`[${context}]`, error);
    throw new DbWriteError(error.message ?? 'Database write failed', error.code);
  }
  return data;
}

// ─── DB client ────────────────────────────────────────────────────────────────

export const db = {

  // ── admin_users ─────────────────────────────────────────────────────────────
  adminUser: {
    async findUnique({ where }: { where: Record<string, unknown> }) {
      const sb = createAdminClient();
      let q = sb.from('admin_users').select('*');
      q = applyWhere(q, where);
      const { data } = await q.maybeSingle();
      return data ? normRole(data as Record<string, unknown>) : null;
    },

    async findMany() {
      const sb = createAdminClient();
      const { data } = await sb.from('admin_users').select('*').order('created_at');
      return (data ?? []).map(r => normRole(r as Record<string, unknown>));
    },

    async count() {
      const sb = createAdminClient();
      const { count } = await sb.from('admin_users').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, role: toDb(data.role as string) } as unknown as AdminUserInsert;
      const { data: created } = await sb.from('admin_users').insert(row).select().single();
      return created ? normRole(created as Record<string, unknown>) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.role ? { ...data, role: toDb(data.role as string) } : data) as unknown as AdminUserUpdate;
      const { data: updated } = await sb.from('admin_users').update(row).eq('id', where.id).select().single();
      return updated ? normRole(updated as Record<string, unknown>) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('admin_users').delete().eq('id', where.id);
    },
  },

  // ── campaigns ────────────────────────────────────────────────────────────────
  campaign: {
    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('campaigns').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({ where = {}, skip, take }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb.from('campaigns').select('*').order('created_at', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normStatus(r as Record<string, unknown>));
    },

    async findUnique({ where }: { where: { id?: string; slug?: string; slugUa?: string; slugEn?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('campaigns').select('*');
      if (where.id)     q = q.eq('id', where.id);
      if (where.slugUa) q = q.eq('slug_ua', where.slugUa);
      if (where.slugEn) q = q.eq('slug_en', where.slugEn);
      if (where.slug)   q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') };
      const created = await writeWithSlugFallback<Record<string, unknown>>(
        (r) => sb.from('campaigns').insert(r as unknown as CampaignInsert).select().single(),
        row,
        'db.campaign.create',
      );
      return created ? normStatus(created) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data);
      const updated = await writeWithSlugFallback<Record<string, unknown>>(
        (r) => sb.from('campaigns').update(r as unknown as CampaignUpdate).eq('id', where.id).select().single(),
        row,
        'db.campaign.update',
      );
      return updated ? normStatus(updated) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('campaigns').delete().eq('id', where.id);
    },
  },

  // ── donations ────────────────────────────────────────────────────────────────
  donation: {
    async aggregate({ where = {}, _sum }: { where?: Record<string, unknown>; _sum?: Record<string, boolean> }) {
      const sb = createAdminClient();
      let q = sb.from('donations').select('amount');
      q = applyWhere(q, where);
      const { data } = await q;
      const total = (data ?? []).reduce((acc, r) => acc + Number((r as Record<string, unknown>).amount), 0);
      return { _sum: { amount: _sum?.amount ? new DecimalLike(total) : null } };
    },

    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('donations').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({ where = {}, skip, take }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb.from('donations').select('*').order('created_at', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normStatusSource(r as Record<string, unknown>));
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = {
        ...data,
        status: toDb((data.status as string) ?? 'PENDING'),
        source: toDb(data.source as string),
      } as unknown as DonationInsert;
      const { data: created } = await sb.from('donations').insert(row).select().single();
      return created ? normStatusSource(created as Record<string, unknown>) : null;
    },
  },

  // ── events ───────────────────────────────────────────────────────────────────
  event: {
    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('events').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({ where = {}, skip, take }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb.from('events').select('*').order('event_date', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normStatus(r as Record<string, unknown>));
    },

    async findUnique({ where }: { where: { id?: string; slug?: string; slugUa?: string; slugEn?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('events').select('*');
      if (where.id)     q = q.eq('id', where.id);
      if (where.slugUa) q = q.eq('slug_ua', where.slugUa);
      if (where.slugEn) q = q.eq('slug_en', where.slugEn);
      if (where.slug)   q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') };
      const created = await writeWithSlugFallback<Record<string, unknown>>(
        (r) => sb.from('events').insert(r as unknown as EventInsert).select().single(),
        row,
        'db.event.create',
      );
      return created ? normStatus(created) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data);
      const updated = await writeWithSlugFallback<Record<string, unknown>>(
        (r) => sb.from('events').update(r as unknown as EventUpdate).eq('id', where.id).select().single(),
        row,
        'db.event.update',
      );
      return updated ? normStatus(updated) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('events').delete().eq('id', where.id);
    },
  },

  // ── news_articles ─────────────────────────────────────────────────────────────
  newsArticle: {
    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('news_articles').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({ where = {}, skip, take }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb.from('news_articles').select('*').order('created_at', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normStatus(r as Record<string, unknown>));
    },

    async findUnique({ where }: { where: { id?: string; slug?: string; slugUa?: string; slugEn?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('news_articles').select('*');
      if (where.id)     q = q.eq('id', where.id);
      if (where.slugUa) q = q.eq('slug_ua', where.slugUa);
      if (where.slugEn) q = q.eq('slug_en', where.slugEn);
      if (where.slug)   q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') };
      const created = await writeWithSlugFallback<Record<string, unknown>>(
        (r) => sb.from('news_articles').insert(r as unknown as NewsArticleInsert).select().single(),
        row,
        'db.newsArticle.create',
      );
      return created ? normStatus(created) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data);
      const updated = await writeWithSlugFallback<Record<string, unknown>>(
        (r) => sb.from('news_articles').update(r as unknown as NewsArticleUpdate).eq('id', where.id).select().single(),
        row,
        'db.newsArticle.update',
      );
      return updated ? normStatus(updated) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('news_articles').delete().eq('id', where.id);
    },
  },

  // ── reports ──────────────────────────────────────────────────────────────────
  report: {
    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('reports').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({ where = {}, skip, take }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb.from('reports').select('*').order('year', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normStatus(r as Record<string, unknown>));
    },

    async findUnique({ where }: { where: { id?: string; year?: number } }) {
      const sb = createAdminClient();
      let q = sb.from('reports').select('*');
      if (where.id)   q = q.eq('id', where.id);
      if (where.year) q = q.eq('year', where.year);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') } as unknown as ReportInsert;
      const { data: created } = await sb.from('reports').insert(row).select().single();
      return created ? normStatus(created as Record<string, unknown>) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data) as unknown as ReportUpdate;
      const { data: updated } = await sb.from('reports').update(row).eq('id', where.id).select().single();
      return updated ? normStatus(updated as Record<string, unknown>) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('reports').delete().eq('id', where.id);
    },
  },

  // ── contact_submissions ───────────────────────────────────────────────────────
  contactSubmission: {
    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('contact_submissions').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({ where = {}, skip, take }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb.from('contact_submissions').select('*').order('created_at', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normTag(r as Record<string, unknown>));
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const { data: updated } = await sb.from('contact_submissions').update(data as { is_read?: boolean }).eq('id', where.id).select().single();
      return updated ? normTag(updated as Record<string, unknown>) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('contact_submissions').delete().eq('id', where.id);
    },
  },

  // ── home_page_settings (singleton row id=1) ───────────────────────────────────
  homeSetting: {
    async findFirst() {
      const sb = createAdminClient();
      const { data } = await sb.from('home_page_settings').select('*').eq('id', 1).single();
      return data;
    },

    async update({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const { data: updated } = await sb
        .from('home_page_settings')
        .update({ ...data, updated_at: new Date().toISOString() } as Partial<Omit<import('@/types/database').HomePageSettings, 'id'>>)
        .eq('id', 1)
        .select()
        .single();
      return updated;
    },
  },

  // ── campaigns_page_settings (singleton row id=1) ──────────────────────────────
  // NOTE: this table is defined in supabase/migrations/20260428000002_campaigns_page_settings.sql
  // but has not yet been applied to the remote DB, so it's missing from the
  // auto-generated `Database` types. Cast the table name with `as never` to
  // bypass the literal check until the migration is applied and types are regenerated.
  campaignsSetting: {
    async findFirst() {
      const sb = createAdminClient();
      const { data } = await sb.from('campaigns_page_settings' as never).select('*').eq('id', 1).single();
      return data;
    },

    async update({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const { data: updated } = await sb
        .from('campaigns_page_settings' as never)
        .update({ ...data, updated_at: new Date().toISOString() } as never)
        .eq('id', 1)
        .select()
        .single();
      return updated;
    },
  },

  // ── shop_categories ──────────────────────────────────────────────────────────
  shopCategory: {
    async findMany({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('shop_categories').select('*').order('sort_order');
      q = applyWhere(q, where);
      const { data } = await q;
      return data ?? [];
    },

    async findUnique({ where }: { where: { id?: string; slug?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('shop_categories').select('*');
      if (where.id)   q = q.eq('id', where.id);
      if (where.slug) q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const { data: created } = await sb
        .from('shop_categories')
        .insert(data as unknown as ShopCategoryInsert)
        .select()
        .single();
      return created;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const { data: updated } = await sb
        .from('shop_categories')
        .update(data as unknown as ShopCategoryUpdate)
        .eq('id', where.id)
        .select()
        .single();
      return updated;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('shop_categories').delete().eq('id', where.id);
    },
  },

  // ── shop_products ────────────────────────────────────────────────────────────
  shopProduct: {
    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('shop_products').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({
      where = {},
      skip,
      take,
    }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb.from('shop_products').select('*').order('sort_order').order('created_at', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normStatus(r as Record<string, unknown>));
    },

    async findUnique({ where }: { where: { id?: string; slug?: string; slugUa?: string; slugEn?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('shop_products').select('*');
      if (where.id)     q = q.eq('id', where.id);
      if (where.slugUa) q = q.eq('slug_ua', where.slugUa);
      if (where.slugEn) q = q.eq('slug_en', where.slugEn);
      if (where.slug)   q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') };
      const created = await writeWithSlugFallback<Record<string, unknown>>(
        (r) => sb.from('shop_products').insert(r as unknown as ShopProductInsert).select().single(),
        row,
        'db.shopProduct.create',
      );
      return created ? normStatus(created) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data);
      const updated = await writeWithSlugFallback<Record<string, unknown>>(
        (r) => sb.from('shop_products').update(r as unknown as ShopProductUpdate).eq('id', where.id).select().single(),
        row,
        'db.shopProduct.update',
      );
      return updated ? normStatus(updated) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('shop_products').delete().eq('id', where.id);
    },
  },

  // ── shop_photo_reports ───────────────────────────────────────────────────────
  shopPhotoReport: {
    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('shop_photo_reports').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({
      where = {},
      skip,
      take,
    }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb
        .from('shop_photo_reports')
        .select('*')
        .order('sort_order')
        .order('report_date', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normStatus(r as Record<string, unknown>));
    },

    async findUnique({ where }: { where: { id?: string; slug?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('shop_photo_reports').select('*');
      if (where.id)   q = q.eq('id', where.id);
      if (where.slug) q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') } as unknown as ShopPhotoReportInsert;
      const { data: created } = await sb.from('shop_photo_reports').insert(row).select().single();
      return created ? normStatus(created as Record<string, unknown>) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data) as unknown as ShopPhotoReportUpdate;
      const { data: updated } = await sb.from('shop_photo_reports').update(row).eq('id', where.id).select().single();
      return updated ? normStatus(updated as Record<string, unknown>) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('shop_photo_reports').delete().eq('id', where.id);
    },
  },

  // ── shop_reviews ─────────────────────────────────────────────────────────────
  shopReview: {
    async count({ where = {} }: { where?: Record<string, unknown> } = {}) {
      const sb = createAdminClient();
      let q = sb.from('shop_reviews').select('*', { count: 'exact', head: true });
      q = applyWhere(q, where);
      const { count } = await q;
      return count ?? 0;
    },

    async findMany({
      where = {},
      skip,
      take,
    }: { where?: Record<string, unknown>; skip?: number; take?: number } = {}) {
      const sb = createAdminClient();
      let q = sb
        .from('shop_reviews')
        .select('*')
        .order('sort_order')
        .order('created_at', { ascending: false });
      q = applyWhere(q, where);
      if (skip !== undefined && take !== undefined) q = q.range(skip, skip + take - 1);
      else if (take) q = q.limit(take);
      const { data } = await q;
      return (data ?? []).map(r => normStatus(r as Record<string, unknown>));
    },

    async findUnique({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      const { data } = await sb.from('shop_reviews').select('*').eq('id', where.id).maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') } as unknown as ShopReviewInsert;
      const { data: created } = await sb.from('shop_reviews').insert(row).select().single();
      return created ? normStatus(created as Record<string, unknown>) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data) as unknown as ShopReviewUpdate;
      const { data: updated } = await sb.from('shop_reviews').update(row).eq('id', where.id).select().single();
      return updated ? normStatus(updated as Record<string, unknown>) : null;
    },

    async delete({ where }: { where: { id: string } }) {
      const sb = createAdminClient();
      await sb.from('shop_reviews').delete().eq('id', where.id);
    },
  },

  // ── about_page_settings (singleton row id=1) ──────────────────────────────────
  aboutSetting: {
    async findFirst() {
      const sb = createAdminClient();
      const { data } = await sb.from('about_page_settings').select('*').eq('id', 1).single();
      return data;
    },

    async update({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const { data: updated } = await sb
        .from('about_page_settings')
        .update({ ...data, updated_at: new Date().toISOString() } as Partial<Omit<import('@/types/database').AboutPageSettings, 'id'>>)
        .eq('id', 1)
        .select()
        .single();
      return updated;
    },
  },
};
