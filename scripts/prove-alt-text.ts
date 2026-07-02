// Eyeball the AI alt-text output on real images before we wire anything to the DB.
// No database, no writes — image URL(s) in, generated text printed out.
//
// Run it (loads ANTHROPIC_API_KEY from .env.local):
//   node --env-file=.env.local --import tsx scripts/prove-alt-text.ts "<url1>" "<url2>" ...
//
// Pass 3–4 varied real image URLs from the site (a portrait, a busy scene, a
// logo/graphic, a photo with text in it). Look at each result and ask:
//   • Is the Ukrainian natural, or does it read like Google Translate?
//   • Does it describe the right things, or just list objects?
//   • Does it hallucinate names / text that aren't there?
//   • Is the alt length screen-reader-appropriate (not a paragraph)?

import { generateAltText, ALT_TEXT_MODEL } from '@/lib/alt-text/generate'

async function main() {
  const urls = process.argv.slice(2)

  if (urls.length === 0) {
    console.error(
      'Usage: node --env-file=.env.local --import tsx scripts/prove-alt-text.ts "<image-url>" ["<image-url>" ...]',
    )
    process.exit(1)
  }

  console.log(`Model: ${ALT_TEXT_MODEL}\n`)

  for (const url of urls) {
    console.log('─'.repeat(72))
    console.log(url)
    try {
      const result = await generateAltText(url)
      console.log('\n  alt_ua:     ', result.alt_ua)
      console.log('  alt_en:     ', result.alt_en)
      console.log('  caption_ua: ', result.caption_ua)
      console.log('  caption_en: ', result.caption_en)
      console.log()
    } catch (err) {
      console.error('  ERROR:', err instanceof Error ? err.message : err, '\n')
    }
  }
}

main()
