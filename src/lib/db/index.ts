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

    async findUnique({ where }: { where: { id?: string; slug?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('campaigns').select('*');
      if (where.id)   q = q.eq('id', where.id);
      if (where.slug) q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') } as unknown as CampaignInsert;
      const { data: created } = await sb.from('campaigns').insert(row).select().single();
      return created ? normStatus(created as Record<string, unknown>) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data) as unknown as CampaignUpdate;
      const { data: updated } = await sb.from('campaigns').update(row).eq('id', where.id).select().single();
      return updated ? normStatus(updated as Record<string, unknown>) : null;
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

    async findUnique({ where }: { where: { id?: string; slug?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('events').select('*');
      if (where.id)   q = q.eq('id', where.id);
      if (where.slug) q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') } as unknown as EventInsert;
      const { data: created } = await sb.from('events').insert(row).select().single();
      return created ? normStatus(created as Record<string, unknown>) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data) as unknown as EventUpdate;
      const { data: updated } = await sb.from('events').update(row).eq('id', where.id).select().single();
      return updated ? normStatus(updated as Record<string, unknown>) : null;
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

    async findUnique({ where }: { where: { id?: string; slug?: string } }) {
      const sb = createAdminClient();
      let q = sb.from('news_articles').select('*');
      if (where.id)   q = q.eq('id', where.id);
      if (where.slug) q = q.eq('slug', where.slug);
      const { data } = await q.maybeSingle();
      return data ? normStatus(data as Record<string, unknown>) : null;
    },

    async create({ data }: { data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = { ...data, status: toDb((data.status as string) ?? 'DRAFT') } as unknown as NewsArticleInsert;
      const { data: created } = await sb.from('news_articles').insert(row).select().single();
      return created ? normStatus(created as Record<string, unknown>) : null;
    },

    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sb = createAdminClient();
      const row = (data.status ? { ...data, status: toDb(data.status as string) } : data) as unknown as NewsArticleUpdate;
      const { data: updated } = await sb.from('news_articles').update(row).eq('id', where.id).select().single();
      return updated ? normStatus(updated as Record<string, unknown>) : null;
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
