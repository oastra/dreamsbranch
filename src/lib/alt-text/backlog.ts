import { db } from '@/lib/db'
import { generateAltText } from './generate'
import { collectInUseImageUrls } from './collect-urls'

// The batch "agent": find every in-use image that has no alt-text row yet
// (the backlog), then loop over them generating + writing pending rows. It's a
// deterministic loop, not an LLM tool-calling loop — the model is called once
// per image via generateAltText, and db.imageAltText.upsert is the tool/write
// path. Everything it writes is status='pending' behind the human-approval gate.

/** In-use image URLs that don't yet have an image_alt_text row. */
export async function getAltTextBacklog(): Promise<string[]> {
  const [inUse, existing] = await Promise.all([
    collectInUseImageUrls(),
    db.imageAltText.findExistingUrls(),
  ])
  return inUse.filter((url) => !existing.has(url))
}

export type BacklogResult = {
  total: number // backlog size before this run
  processed: number // rows written this run
  failed: number // images that errored (skipped)
  remaining: number // still without alt text after this run
}

/**
 * Process up to `limit` backlog images. Sequential on purpose — keeps us well
 * under the API rate limit and makes progress easy to follow. Safe to call
 * repeatedly: each run drains another chunk until `remaining` hits 0.
 *
 * `adminId` stamps the audit columns (null when run from a script — the column
 * is nullable). Never throws per-image: a bad image is counted as failed and
 * the loop continues.
 */
export async function processAltTextBacklog(
  opts: {
    adminId?: string | null
    limit?: number
    onProgress?: (message: string) => void
  } = {},
): Promise<BacklogResult> {
  const { adminId = null, limit = 25, onProgress = () => {} } = opts

  const backlog = await getAltTextBacklog()
  const total = backlog.length
  const batch = backlog.slice(0, limit)

  let processed = 0
  let failed = 0

  for (const [i, url] of batch.entries()) {
    onProgress(`[${i + 1}/${batch.length}] ${url}`)
    try {
      const alt = await generateAltText(url)
      await db.imageAltText.upsert({
        url,
        data: {
          ...alt,
          status: 'pending',
          created_by_admin_id: adminId,
          updated_by_admin_id: adminId,
        },
      })
      processed++
    } catch (err) {
      failed++
      onProgress(`  ✗ failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { total, processed, failed, remaining: Math.max(0, total - processed) }
}
