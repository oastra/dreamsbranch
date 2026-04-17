// Auto-generated Supabase types
// Regenerate after schema changes with: npm run types:db
// This is a manual placeholder — run the command above after applying migrations
// to get the full auto-generated version.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Enums ────────────────────────────────────────────────────

export type ContentStatus = 'draft' | 'active' | 'archived'
export type ArticleStatus = 'draft' | 'published'
export type ReportStatus = 'draft' | 'published'
export type DonationSource = 'stripe' | 'paypal' | 'manual'
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type ContactTag = 'general' | 'catering' | 'volunteer'
export type AdminRole = 'super_admin' | 'editor'

// ── Table Row Types ───────────────────────────────────────────

export type Campaign = {
  id: string
  slug: string
  title_ua: string
  title_en: string
  description_ua: Json       // Tiptap rich text JSON
  description_en: Json
  faq_ua: Json               // [{ question: string, answer: string }]
  faq_en: Json
  cover_image: string | null
  gallery_images: string[]   // Photo report (archived)
  goal_amount: number
  current_amount: number
  preset_amounts: number[]   // e.g. [10, 30, 50]
  status: ContentStatus
  sort_order: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Donation = {
  id: string
  campaign_id: string
  donor_name: string
  donor_email: string | null
  amount: number
  currency: string
  source: DonationSource
  external_payment_id: string | null
  status: DonationStatus
  is_anonymous: boolean
  note: string | null
  added_by_admin_id: string | null
  created_at: string
}

export type Event = {
  id: string
  slug: string
  title_ua: string
  title_en: string
  description_ua: Json       // Tiptap rich text JSON
  description_en: Json
  info_blocks_ua: Json       // [{ title, content }]
  info_blocks_en: Json
  cover_image: string | null
  gallery_images: string[]
  event_date: string         // ISO date string
  start_time: string         // "HH:MM"
  end_time: string | null
  location: string
  location_map_url: string | null
  tags: string[]             // 'looking_for_partners' | 'looking_for_volunteers'
  show_volunteer_cta: boolean
  financial_report: {        // Archived events only
    income: { label: string; amount: number }[]
    expenses: { label: string; amount: number }[]
    profit: number
    note?: string
  } | null
  status: ContentStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export type NewsArticle = {
  id: string
  slug: string
  title_ua: string
  title_en: string
  body_ua: Json              // Tiptap rich text JSON (with inline images)
  body_en: Json
  cover_image: string | null
  category: string
  tags: string[]
  is_featured: boolean
  status: ArticleStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Report = {
  id: string
  year: number
  title_ua: string
  title_en: string
  description_ua: string | null
  description_en: string | null
  cover_image: string | null
  gallery_images: string[]
  pdf_url: string | null
  status: ReportStatus
  created_at: string
  updated_at: string
}

export type ContactSubmission = {
  id: string
  name: string
  phone: string | null
  email: string
  message: string
  tag: ContactTag
  is_read: boolean
  created_at: string
}

export type HomePageSettings = {
  id: 1
  hero_title_ua: string
  hero_title_en: string
  hero_subtitle_ua: string
  hero_subtitle_en: string
  hero_description_ua: string
  hero_description_en: string
  hero_video_url: string | null
  hero_image_url: string | null
  stats_raised: number
  stats_people: number
  stats_campaigns: number
  cta_title_ua: string
  cta_title_en: string
  cta_description_ua: string
  cta_description_en: string
  updated_at: string
}

export type AdminUser = {
  id: string
  email: string
  name: string
  role: AdminRole
  created_at: string
  updated_at: string
}

// ── Insert Types (omit auto-generated fields) ─────────────────

export type CampaignInsert = Omit<Campaign, 'id' | 'current_amount' | 'created_at' | 'updated_at'>
export type DonationInsert = Omit<Donation, 'id' | 'created_at'>
export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'>
export type NewsArticleInsert = Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>
export type ReportInsert = Omit<Report, 'id' | 'created_at' | 'updated_at'>
export type ContactSubmissionInsert = Omit<ContactSubmission, 'id' | 'is_read' | 'created_at'>
export type AdminUserInsert = Omit<AdminUser, 'created_at' | 'updated_at'>

// ── Update Types (all fields optional except id) ──────────────

export type CampaignUpdate = Partial<CampaignInsert>
export type EventUpdate = Partial<EventInsert>
export type NewsArticleUpdate = Partial<NewsArticleInsert>
export type ReportUpdate = Partial<ReportInsert>
export type AdminUserUpdate = Partial<Omit<AdminUserInsert, 'id'>>

// ── Database type for Supabase client ─────────────────────────

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      campaigns: {
        Row: Campaign
        Insert: CampaignInsert
        Update: CampaignUpdate
        Relationships: []
      }
      donations: {
        Row: Donation
        Insert: DonationInsert
        Update: Partial<DonationInsert>
        Relationships: []
      }
      events: {
        Row: Event
        Insert: EventInsert
        Update: EventUpdate
        Relationships: []
      }
      news_articles: {
        Row: NewsArticle
        Insert: NewsArticleInsert
        Update: NewsArticleUpdate
        Relationships: []
      }
      reports: {
        Row: Report
        Insert: ReportInsert
        Update: ReportUpdate
        Relationships: []
      }
      contact_submissions: {
        Row: ContactSubmission
        Insert: ContactSubmissionInsert
        Update: { is_read?: boolean }
        Relationships: []
      }
      home_page_settings: {
        Row: HomePageSettings
        Insert: Partial<Omit<HomePageSettings, 'id'>>
        Update: Partial<Omit<HomePageSettings, 'id'>>
        Relationships: []
      }
      admin_users: {
        Row: AdminUser
        Insert: AdminUserInsert
        Update: AdminUserUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      content_status: ContentStatus
      article_status: ArticleStatus
      report_status: ReportStatus
      donation_source: DonationSource
      donation_status: DonationStatus
      contact_tag: ContactTag
      admin_role: AdminRole
    }
  }
}
