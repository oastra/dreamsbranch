'use server';

import { db } from '@/lib/db';

/**
 * Resolve the public-site URL that corresponds to an admin pathname.
 *
 * - Settings pages (home/about/campaigns/catering) → the matching public page.
 * - List pages (campaigns / events / news / reports) → public list.
 * - Detail edit pages (e.g. /admin/campaigns/[id]) → DB lookup for the row's
 *   slug → that public detail URL. Falls back to the list when the row is
 *   missing or has no slug.
 *
 * Leading locale segment is intentionally omitted — the public site's
 * middleware redirects "/" to "/{locale}" using the visitor's cookie, so the
 * returned path lets the browser land in the user's current locale.
 */
export async function resolvePublicUrl(adminPath: string): Promise<string> {
  if (!adminPath || adminPath === '/admin' || adminPath === '/admin/') return '/';

  // Strip any trailing slash for consistent matching.
  const path = adminPath.replace(/\/+$/, '');

  // ─── Settings (page-level) ────────────────────────────────────────────
  if (path === '/admin/home-settings') return '/';
  if (path === '/admin/about-settings') return '/about';
  if (path === '/admin/campaigns-settings') return '/campaigns';
  if (path === '/admin/catering-page' || path.startsWith('/admin/catering-page/')) {
    return '/shop/catering';
  }

  // ─── Contact inbox → public contact form ──────────────────────────────
  if (path === '/admin/contacts') return '/contact';

  // ─── Donations admin → donate page ────────────────────────────────────
  if (path === '/admin/donations') return '/donate';

  // ─── Shop sub-areas → /shop ───────────────────────────────────────────
  if (
    path.startsWith('/admin/shop-reviews') ||
    path.startsWith('/admin/shop-photo-reports')
  ) {
    return '/shop';
  }

  // ─── Sluggable entities ───────────────────────────────────────────────
  // Match /admin/<type>/<id> where <id> is a UUID-ish segment (anything
  // that isn't the reserved "new" route).
  const detail = path.match(/^\/admin\/(campaigns|events|news|reports)\/([^/]+)$/);
  if (detail) {
    const [, type, id] = detail;
    if (id === 'new') {
      // Editor for an unsaved row — fall back to the list.
      return `/${type}`;
    }
    try {
      const row = (await db[
        type === 'news' ? 'newsArticle' : (type.slice(0, -1) as 'campaign' | 'event' | 'report')
      ].findUnique({ where: { id } })) as { slug?: string } | null;
      if (row?.slug) return `/${type}/${row.slug}`;
    } catch {
      /* fall through to list */
    }
    return `/${type}`;
  }

  // List pages: /admin/campaigns, /admin/events, /admin/news, /admin/reports
  const list = path.match(/^\/admin\/(campaigns|events|news|reports)$/);
  if (list) return `/${list[1]}`;

  return '/';
}
