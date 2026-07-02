import { createAdminClient } from '@/lib/supabase/server'

// Every column across the schema that stores a public image URL — either a bare
// string (cover_image, hero_image, …) or a string[] (gallery_images, …). When a
// new image column ships, add it here so the backlog agent sees those images.
//
// Not covered on purpose: shop_photo_reports stores images as JSON objects that
// already carry their own caption_ua/caption_en, so they have a separate write
// path and aren't part of this backlog.
const IMAGE_SOURCES: { table: string; columns: string[] }[] = [
  { table: 'campaigns', columns: ['cover_image', 'gallery_images'] },
  { table: 'events', columns: ['cover_image', 'hero_image', 'gallery_images'] },
  { table: 'news_articles', columns: ['cover_image', 'body_image', 'gallery_images'] },
  { table: 'shop_products', columns: ['cover_image', 'gallery_images'] },
  { table: 'reports', columns: ['cover_image', 'gallery_images'] },
  { table: 'catering_events', columns: ['images'] },
  { table: 'about_page_settings', columns: ['hero_images', 'team_images'] },
  { table: 'home_page_settings', columns: ['hero_images'] },
  { table: 'shop_reviews', columns: ['avatar'] },
]

/**
 * Every distinct image URL currently in use across the site. Defensive per
 * table: a missing table/column is logged and skipped rather than aborting the
 * whole scan (the generated types lag the live schema in this project).
 */
export async function collectInUseImageUrls(): Promise<string[]> {
  const sb = createAdminClient()
  const urls = new Set<string>()

  const add = (v: unknown) => {
    if (typeof v === 'string' && v.startsWith('http')) urls.add(v)
    else if (Array.isArray(v)) v.forEach(add)
  }

  for (const { table, columns } of IMAGE_SOURCES) {
    // Cast to bypass the literal-table-name / column typing — the live schema is
    // ahead of the generated types (same reason db/index.ts uses `as never`).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb.from(table as never) as any).select(columns.join(','))
    if (error) {
      console.warn(`[collectInUseImageUrls] skipped ${table}: ${error.message}`)
      continue
    }
    for (const row of (data ?? []) as Record<string, unknown>[]) {
      for (const c of columns) add(row[c])
    }
  }

  return [...urls]
}
