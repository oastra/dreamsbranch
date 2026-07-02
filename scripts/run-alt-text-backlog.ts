// Drain the alt-text backlog: generate bilingual alt text for in-use images
// that don't have a row yet, writing each as status='pending' for review.
//
//   node --env-file=.env.local --import tsx scripts/run-alt-text-backlog.ts [limit]
//
// `limit` defaults to 25. Re-run until it reports 0 remaining. Rows land as
// 'pending' — nothing shows on the public site until approved in the admin queue.

import { getAltTextBacklog, processAltTextBacklog } from '@/lib/alt-text/backlog'
import { ALT_TEXT_MODEL } from '@/lib/alt-text/generate'

async function main() {
  const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 25

  const backlog = await getAltTextBacklog()
  console.log(`Model: ${ALT_TEXT_MODEL}`)
  console.log(`Backlog: ${backlog.length} image(s) without alt text. Processing up to ${limit}...\n`)

  if (backlog.length === 0) {
    console.log('Nothing to do — every in-use image already has an alt-text row.')
    return
  }

  const result = await processAltTextBacklog({ limit, onProgress: (m) => console.log(m) })

  console.log(
    `\nDone. Wrote ${result.processed}, failed ${result.failed}, ${result.remaining} still remaining (of ${result.total}).`,
  )
  if (result.remaining > 0) {
    console.log(`Run again to continue: node --env-file=.env.local --import tsx scripts/run-alt-text-backlog.ts ${limit}`)
  }
  console.log('New rows are status="pending" — review + approve them in the admin queue (Phase 4).')
}

main()
