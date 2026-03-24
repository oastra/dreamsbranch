// Auto-generated Supabase types
// Regenerate after schema changes with: npm run types:db
//
// This file is a placeholder — run the command above once your
// Supabase tables are created to get full type safety.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
