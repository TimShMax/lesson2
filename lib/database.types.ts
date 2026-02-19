export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analysis_history: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          summary: string | null
          user_id: string
          verdict: string
          video_id: string
          video_url: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          summary?: string | null
          user_id: string
          verdict: string
          video_id: string
          video_url: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          summary?: string | null
          user_id?: string
          verdict?: string
          video_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          analysis_id: string | null
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          analysis_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          analysis_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analysis_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          credits: number
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits?: number
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      deduct_credits: {
        Args: {
          p_amount: number
          p_analysis_id?: string
          p_description?: string
          p_user_id: string
        }
        Returns: boolean
      }
      get_user_credits: { Args: { p_user_id: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type AnalysisHistory = Database["public"]["Tables"]["analysis_history"]["Row"]
export type CreditTransaction = Database["public"]["Tables"]["credit_transactions"]["Row"]
