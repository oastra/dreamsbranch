import { createAdminClient } from '@/lib/supabase/server'

type AltRow = { url: string; alt_ua: string | null; alt_en: string | null }

function pickAlt(row: AltRow, locale: string): string | null {
  const value = locale === 'ua' ? row.alt_ua : row.alt_en
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/**
 * Approved alt text for a set of image URLs, as a Map<url, alt> in the given
 * locale. Only 'approved' rows are returned — images without a reviewed row are
 * simply absent from the map, so callers keep their existing (title-based) alt
 * until the backlog fills. One query for the whole page, no N+1.
 */
export async function getApprovedAltMap(
  urls: (string | null | undefined)[],
  locale: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const unique = [...new Set(urls.filter((u): u is string => !!u))]
  if (unique.length === 0) return map

  const sb = createAdminClient()
  const { data } = await sb
    .from('image_alt_text' as never)
    .select('url, alt_ua, alt_en')
    .eq('status', 'approved')
    .in('url', unique)

  for (const row of (data ?? []) as AltRow[]) {
    const alt = pickAlt(row, locale)
    if (alt) map.set(row.url, alt)
  }
  return map
}

/** Approved alt for a single image URL in the given locale, or null if none. */
export async function getApprovedAlt(
  url: string | null | undefined,
  locale: string,
): Promise<string | null> {
  if (!url) return null
  const map = await getApprovedAltMap([url], locale)
  return map.get(url) ?? null
}
