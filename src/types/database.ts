export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      about_page_settings: {
        Row: {
          faq_items: Json
          hero_images: string[]
          id: number
          members_value: string
          raised_value: string
          team_images: string[]
          transparency_value: string
          updated_at: string
          years_value: string
        }
        Insert: {
          faq_items?: Json
          hero_images?: string[]
          id?: number
          members_value?: string
          raised_value?: string
          team_images?: string[]
          transparency_value?: string
          updated_at?: string
          years_value?: string
        }
        Update: {
          faq_items?: Json
          hero_images?: string[]
          id?: number
          members_value?: string
          raised_value?: string
          team_images?: string[]
          transparency_value?: string
          updated_at?: string
          years_value?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          cover_image: string | null
          created_at: string
          current_amount: number
          description_en: Json
          description_ua: Json
          faq_en: Json
          faq_ua: Json
          gallery_images: string[]
          goal_amount: number
          id: string
          preset_amounts: number[]
          published_at: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title_en: string
          title_ua: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          current_amount?: number
          description_en?: Json
          description_ua?: Json
          faq_en?: Json
          faq_ua?: Json
          gallery_images?: string[]
          goal_amount?: number
          id?: string
          preset_amounts?: number[]
          published_at?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title_en: string
          title_ua: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          current_amount?: number
          description_en?: Json
          description_ua?: Json
          faq_en?: Json
          faq_ua?: Json
          gallery_images?: string[]
          goal_amount?: number
          id?: string
          preset_amounts?: number[]
          published_at?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
          title_ua?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          tag: Database["public"]["Enums"]["contact_tag"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          tag?: Database["public"]["Enums"]["contact_tag"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          tag?: Database["public"]["Enums"]["contact_tag"]
        }
        Relationships: []
      }
      donations: {
        Row: {
          added_by_admin_id: string | null
          amount: number
          campaign_id: string
          created_at: string
          currency: string
          donor_email: string | null
          donor_name: string
          external_payment_id: string | null
          id: string
          is_anonymous: boolean
          note: string | null
          source: Database["public"]["Enums"]["donation_source"]
          status: Database["public"]["Enums"]["donation_status"]
        }
        Insert: {
          added_by_admin_id?: string | null
          amount: number
          campaign_id: string
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string
          external_payment_id?: string | null
          id?: string
          is_anonymous?: boolean
          note?: string | null
          source: Database["public"]["Enums"]["donation_source"]
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Update: {
          added_by_admin_id?: string | null
          amount?: number
          campaign_id?: string
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string
          external_payment_id?: string | null
          id?: string
          is_anonymous?: boolean
          note?: string | null
          source?: Database["public"]["Enums"]["donation_source"]
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "donations_added_by_admin_id_fkey"
            columns: ["added_by_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image: string | null
          created_at: string
          description_en: Json
          description_ua: Json
          end_time: string | null
          event_date: string
          financial_report: Json | null
          gallery_images: string[]
          id: string
          info_blocks_en: Json
          info_blocks_ua: Json
          location: string
          location_map_url: string | null
          published_at: string | null
          show_volunteer_cta: boolean
          slug: string
          start_time: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title_en: string
          title_ua: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description_en?: Json
          description_ua?: Json
          end_time?: string | null
          event_date: string
          financial_report?: Json | null
          gallery_images?: string[]
          id?: string
          info_blocks_en?: Json
          info_blocks_ua?: Json
          location: string
          location_map_url?: string | null
          published_at?: string | null
          show_volunteer_cta?: boolean
          slug: string
          start_time: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title_en: string
          title_ua: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description_en?: Json
          description_ua?: Json
          end_time?: string | null
          event_date?: string
          financial_report?: Json | null
          gallery_images?: string[]
          id?: string
          info_blocks_en?: Json
          info_blocks_ua?: Json
          location?: string
          location_map_url?: string | null
          published_at?: string | null
          show_volunteer_cta?: boolean
          slug?: string
          start_time?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title_en?: string
          title_ua?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_page_settings: {
        Row: {
          cta_description_en: string
          cta_description_ua: string
          cta_title_en: string
          cta_title_ua: string
          hero_description_en: string
          hero_description_ua: string
          hero_image_url: string | null
          hero_subtitle_en: string
          hero_subtitle_ua: string
          hero_title_en: string
          hero_title_ua: string
          hero_video_url: string | null
          id: number
          stats_campaigns: number
          stats_people: number
          stats_raised: number
          updated_at: string
        }
        Insert: {
          cta_description_en?: string
          cta_description_ua?: string
          cta_title_en?: string
          cta_title_ua?: string
          hero_description_en?: string
          hero_description_ua?: string
          hero_image_url?: string | null
          hero_subtitle_en?: string
          hero_subtitle_ua?: string
          hero_title_en?: string
          hero_title_ua?: string
          hero_video_url?: string | null
          id?: number
          stats_campaigns?: number
          stats_people?: number
          stats_raised?: number
          updated_at?: string
        }
        Update: {
          cta_description_en?: string
          cta_description_ua?: string
          cta_title_en?: string
          cta_title_ua?: string
          hero_description_en?: string
          hero_description_ua?: string
          hero_image_url?: string | null
          hero_subtitle_en?: string
          hero_subtitle_ua?: string
          hero_title_en?: string
          hero_title_ua?: string
          hero_video_url?: string | null
          id?: number
          stats_campaigns?: number
          stats_people?: number
          stats_raised?: number
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          body_en: Json
          body_ua: Json
          category: string
          cover_image: string | null
          created_at: string
          id: string
          is_featured: boolean
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          tags: string[]
          title_en: string
          title_ua: string
          updated_at: string
        }
        Insert: {
          body_en?: Json
          body_ua?: Json
          category?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title_en: string
          title_ua: string
          updated_at?: string
        }
        Update: {
          body_en?: Json
          body_ua?: Json
          category?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title_en?: string
          title_ua?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          cover_image: string | null
          created_at: string
          description_en: string | null
          description_ua: string | null
          gallery_images: string[]
          id: string
          pdf_url_en: string | null
          pdf_url_ua: string | null
          status: Database["public"]["Enums"]["report_status"]
          title_en: string
          title_ua: string
          updated_at: string
          year: number
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description_en?: string | null
          description_ua?: string | null
          gallery_images?: string[]
          id?: string
          pdf_url_en?: string | null
          pdf_url_ua?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title_en: string
          title_ua: string
          updated_at?: string
          year: number
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description_en?: string | null
          description_ua?: string | null
          gallery_images?: string[]
          id?: string
          pdf_url_en?: string | null
          pdf_url_ua?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title_en?: string
          title_ua?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      shop_categories: {
        Row: {
          created_at: string
          id: string
          name_en: string
          name_ua: string
          section: Database["public"]["Enums"]["shop_section"]
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en: string
          name_ua: string
          section: Database["public"]["Enums"]["shop_section"]
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string
          name_ua?: string
          section?: Database["public"]["Enums"]["shop_section"]
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      shop_photo_reports: {
        Row: {
          created_at: string
          id: string
          images: Json
          report_date: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title_en: string
          title_ua: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          images?: Json
          report_date: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title_en: string
          title_ua: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          images?: Json
          report_date?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
          title_ua?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          category_id: string | null
          cover_image: string | null
          created_at: string
          description_en: string | null
          description_ua: string | null
          gallery_images: string[]
          id: string
          price_amount: number
          price_currency: string
          section: Database["public"]["Enums"]["shop_section"]
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title_en: string
          title_ua: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          description_en?: string | null
          description_ua?: string | null
          gallery_images?: string[]
          id?: string
          price_amount?: number
          price_currency?: string
          section: Database["public"]["Enums"]["shop_section"]
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title_en: string
          title_ua: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          description_en?: string | null
          description_ua?: string | null
          gallery_images?: string[]
          id?: string
          price_amount?: number
          price_currency?: string
          section?: Database["public"]["Enums"]["shop_section"]
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
          title_ua?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shop_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_reviews: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          name_en: string
          name_ua: string
          quote_en: string
          quote_ua: string
          rating: number
          role_en: string | null
          role_ua: string | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: string
          name_en: string
          name_ua: string
          quote_en: string
          quote_ua: string
          rating?: number
          role_en?: string | null
          role_ua?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          name_en?: string
          name_ua?: string
          quote_en?: string
          quote_ua?: string
          rating?: number
          role_en?: string | null
          role_ua?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_role: "super_admin" | "editor"
      article_status: "draft" | "published"
      contact_tag: "general" | "catering" | "volunteer"
      content_status: "draft" | "active" | "archived"
      donation_source: "stripe" | "paypal" | "manual"
      donation_status: "pending" | "completed" | "failed" | "refunded"
      report_status: "draft" | "published"
      shop_section: "handmade" | "from_ukraine" | "cuisine" | "catering"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "editor"],
      article_status: ["draft", "published"],
      contact_tag: ["general", "catering", "volunteer"],
      content_status: ["draft", "active", "archived"],
      donation_source: ["stripe", "paypal", "manual"],
      donation_status: ["pending", "completed", "failed", "refunded"],
      report_status: ["draft", "published"],
      shop_section: ["handmade", "from_ukraine", "cuisine", "catering"],
    },
  },
} as const

// ─── Convenience aliases (used throughout the app) ───────────────────────────
// These map the verbose `Database["public"]["Tables"]["X"]["Row"]` shape
// to friendly names that the rest of the codebase imports.

export type AdminRole       = Database["public"]["Enums"]["admin_role"]
export type ArticleStatus   = Database["public"]["Enums"]["article_status"]
export type ContactTag      = Database["public"]["Enums"]["contact_tag"]
export type ContentStatus   = Database["public"]["Enums"]["content_status"]
export type DonationSource  = Database["public"]["Enums"]["donation_source"]
export type DonationStatus  = Database["public"]["Enums"]["donation_status"]
export type ReportStatus    = Database["public"]["Enums"]["report_status"]
export type ShopSection     = Database["public"]["Enums"]["shop_section"]

export type Campaign           = Database["public"]["Tables"]["campaigns"]["Row"]
export type CampaignInsert     = Database["public"]["Tables"]["campaigns"]["Insert"]
export type CampaignUpdate     = Database["public"]["Tables"]["campaigns"]["Update"]

export type Donation           = Database["public"]["Tables"]["donations"]["Row"]
export type DonationInsert     = Database["public"]["Tables"]["donations"]["Insert"]

export type Event              = Database["public"]["Tables"]["events"]["Row"]
export type EventInsert        = Database["public"]["Tables"]["events"]["Insert"]
export type EventUpdate        = Database["public"]["Tables"]["events"]["Update"]

export type NewsArticle        = Database["public"]["Tables"]["news_articles"]["Row"]
export type NewsArticleInsert  = Database["public"]["Tables"]["news_articles"]["Insert"]
export type NewsArticleUpdate  = Database["public"]["Tables"]["news_articles"]["Update"]

export type Report             = Database["public"]["Tables"]["reports"]["Row"]
export type ReportInsert       = Database["public"]["Tables"]["reports"]["Insert"]
export type ReportUpdate       = Database["public"]["Tables"]["reports"]["Update"]

export type ContactSubmission       = Database["public"]["Tables"]["contact_submissions"]["Row"]
export type ContactSubmissionInsert = Database["public"]["Tables"]["contact_submissions"]["Insert"]

export type AdminUser          = Database["public"]["Tables"]["admin_users"]["Row"]
export type AdminUserInsert    = Database["public"]["Tables"]["admin_users"]["Insert"]
export type AdminUserUpdate    = Database["public"]["Tables"]["admin_users"]["Update"]

export type HomePageSettings   = Database["public"]["Tables"]["home_page_settings"]["Row"]
export type AboutPageSettings  = Database["public"]["Tables"]["about_page_settings"]["Row"]

export type ShopCategory       = Database["public"]["Tables"]["shop_categories"]["Row"]
export type ShopCategoryInsert = Database["public"]["Tables"]["shop_categories"]["Insert"]
export type ShopCategoryUpdate = Database["public"]["Tables"]["shop_categories"]["Update"]

export type ShopProduct        = Database["public"]["Tables"]["shop_products"]["Row"]
export type ShopProductInsert  = Database["public"]["Tables"]["shop_products"]["Insert"]
export type ShopProductUpdate  = Database["public"]["Tables"]["shop_products"]["Update"]

export type ShopReview         = Database["public"]["Tables"]["shop_reviews"]["Row"]
export type ShopReviewInsert   = Database["public"]["Tables"]["shop_reviews"]["Insert"]
export type ShopReviewUpdate   = Database["public"]["Tables"]["shop_reviews"]["Update"]

export type ShopPhotoReportImageKind = "product" | "proof" | "chat"

export type ShopPhotoReportImage = {
  url: string
  kind: ShopPhotoReportImageKind
  position: number
  caption_ua?: string
  caption_en?: string
}

type ShopPhotoReportRow = Database["public"]["Tables"]["shop_photo_reports"]["Row"]
type ShopPhotoReportInsertRow = Database["public"]["Tables"]["shop_photo_reports"]["Insert"]
type ShopPhotoReportUpdateRow = Database["public"]["Tables"]["shop_photo_reports"]["Update"]

export type ShopPhotoReport = Omit<ShopPhotoReportRow, "images"> & {
  images: ShopPhotoReportImage[]
}
export type ShopPhotoReportInsert = Omit<ShopPhotoReportInsertRow, "images"> & {
  images?: ShopPhotoReportImage[]
}
export type ShopPhotoReportUpdate = Omit<ShopPhotoReportUpdateRow, "images"> & {
  images?: ShopPhotoReportImage[]
}

// ─── Hand-typed extras (not yet in the live schema) ──────────────────────────
// `campaigns_page_settings` migration is in supabase/migrations/ but was not
// applied to the remote DB (the page falls back to mocks). Keep these types so
// the `db.campaignsSetting` wrapper still compiles.

export type FaqItem = {
  q_ua: string
  a_ua: string
  q_en: string
  a_en: string
}

export type DeliveredItem = {
  count: number
  image: string
  label_ua: string
  label_en: string
}

export type CampaignsPageSettings = {
  id: 1
  hero_images: string[]
  delivered_items: DeliveredItem[]
  updated_at: string
}
