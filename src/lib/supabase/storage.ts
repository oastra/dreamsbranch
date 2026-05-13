import sharp from 'sharp'
import { createAdminClient } from './server'

const BUCKET = 'media'

// ─── Image-processing tuning knobs ──────────────────────────────────────────
//
// Every upload is passed through sharp: clamped to MAX_DIMENSION on the longer
// axis (so a 12MP phone photo doesn't end up in the bucket at full size),
// re-encoded as WebP, and stored with a `.webp` extension. Tweak QUALITY to
// trade file size for fidelity — 75 is small but slightly soft, 85 is the
// sweet spot, 90 is near-pristine but ~25% bigger.
//
// SVG / GIF skip the pipeline — sharp can't faithfully rasterise SVGs and
// re-encoding GIFs would drop the animation.
const MAX_DIMENSION = 2000
const QUALITY = 85
const SKIP_TYPES = new Set(['image/svg+xml', 'image/gif'])

async function processImage(file: File): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  const original = Buffer.from(await file.arrayBuffer())

  if (SKIP_TYPES.has(file.type)) {
    const ext = file.type === 'image/svg+xml' ? 'svg' : 'gif'
    return { buffer: original, contentType: file.type, extension: ext }
  }

  // `rotate()` first honours EXIF orientation before metadata gets stripped
  // by the encode step. `withoutEnlargement` avoids upscaling small avatars.
  const webp = await sharp(original)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .toBuffer()

  return { buffer: webp, contentType: 'image/webp', extension: 'webp' }
}

export async function uploadImage(
  file: File,
  folder: string = 'general',
): Promise<string | null> {
  const supabase = createAdminClient()

  let buffer: Buffer
  let contentType: string
  let extension: string
  try {
    ;({ buffer, contentType, extension } = await processImage(file))
  } catch (err) {
    console.error('Image processing failed:', err)
    return null
  }

  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteImage(url: string): Promise<boolean> {
  const supabase = createAdminClient()

  const path = url.split(`/storage/v1/object/public/${BUCKET}/`)[1]
  if (!path) return false

  const { error } = await supabase.storage.from(BUCKET).remove([path])

  return !error
}

export function getPublicUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}
