// Shape of an image_alt_text row. Hand-written because the table isn't in the
// generated database types (regenerating them wipes the hand-maintained aliases,
// so — like catering_events — this table is accessed via `as never` casts).
export type AltTextStatus = 'pending' | 'approved'

export type ImageAltTextRow = {
  url: string
  alt_ua: string | null
  alt_en: string | null
  caption_ua: string | null
  caption_en: string | null
  status: AltTextStatus
  created_by_admin_id: string | null
  updated_by_admin_id: string | null
  created_at: string
  updated_at: string
}
