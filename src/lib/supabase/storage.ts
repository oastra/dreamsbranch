import { createAdminClient } from './server'

const BUCKET = 'media'

export async function uploadImage(
  file: File,
  folder: string = 'general',
): Promise<string | null> {
  const supabase = createAdminClient()

  const ext = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
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
