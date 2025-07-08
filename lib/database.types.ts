export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          google_access_token: string | null
          google_refresh_token: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          google_access_token?: string | null
          google_refresh_token?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          google_access_token?: string | null
          google_refresh_token?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      burnout_scores: {
        Row: {
          id: string
          user_id: string
          overall_score: number
          risk_level: string
          work_hours_score: number
          email_stress_score: number
          meeting_load_score: number
          break_frequency_score: number
          sentiment_score: number
          trend_direction: string
          trend_percentage: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          overall_score: number
          risk_level: string
          work_hours_score: number
          email_stress_score: number
          meeting_load_score: number
          break_frequency_score: number
          sentiment_score: number
          trend_direction: string
          trend_percentage: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          overall_score?: number
          risk_level?: string
          work_hours_score?: number
          email_stress_score?: number
          meeting_load_score?: number
          break_frequency_score?: number
          sentiment_score?: number
          trend_direction?: string
          trend_percentage?: number
          created_at?: string
        }
      }
      work_patterns: {
        Row: {
          id: string
          user_id: string
          date: string
          work_hours: number
          meeting_count: number
          meeting_duration: number
          email_sent: number
          email_received: number
          break_count: number
          break_duration: number
          after_hours_activity: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          work_hours: number
          meeting_count: number
          meeting_duration: number
          email_sent: number
          email_received: number
          break_count: number
          break_duration: number
          after_hours_activity: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          work_hours?: number
          meeting_count?: number
          meeting_duration?: number
          email_sent?: number
          email_received?: number
          break_count?: number
          break_duration?: number
          after_hours_activity?: boolean
          created_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          content: string
          sentiment_score: number
          sentiment_label: string
          ai_insights: Json | null
          word_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          sentiment_score: number
          sentiment_label: string
          ai_insights?: Json | null
          word_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          sentiment_score?: number
          sentiment_label?: string
          ai_insights?: Json | null
          word_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      google_integrations: {
        Row: {
          id: string
          user_id: string
          service: string
          connected: boolean
          access_token: string | null
          refresh_token: string | null
          permissions: Json | null
          last_sync: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service: string
          connected: boolean
          access_token?: string | null
          refresh_token?: string | null
          permissions?: Json | null
          last_sync?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service?: string
          connected?: boolean
          access_token?: string | null
          refresh_token?: string | null
          permissions?: Json | null
          last_sync?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          priority: string
          category: string
          impact: string
          effort: string
          actionable: boolean
          timeframe: string
          details: Json | null
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          priority: string
          category: string
          impact: string
          effort: string
          actionable: boolean
          timeframe: string
          details?: Json | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          priority?: string
          category?: string
          impact?: string
          effort?: string
          actionable?: boolean
          timeframe?: string
          details?: Json | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}