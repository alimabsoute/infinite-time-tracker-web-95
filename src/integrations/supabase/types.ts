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
      goal_milestones: {
        Row: {
          achieved_at: string | null
          created_at: string
          description: string | null
          goal_id: string
          id: string
          target_percentage: number
          title: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          target_percentage: number
          title: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          target_percentage?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress: {
        Row: {
          created_at: string
          date: string
          goal_id: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          goal_id: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          date?: string
          goal_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          current_value: number
          deadline: string | null
          description: string | null
          end_date: string | null
          id: string
          is_template: boolean | null
          priority: number | null
          start_date: string
          status: string
          target_value: number
          template_name: string | null
          timer_ids: string[] | null
          title: string
          type: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_template?: boolean | null
          priority?: number | null
          start_date?: string
          status?: string
          target_value: number
          template_name?: string | null
          timer_ids?: string[] | null
          title: string
          type: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_template?: boolean | null
          priority?: number | null
          start_date?: string
          status?: string
          target_value?: number
          template_name?: string | null
          timer_ids?: string[] | null
          title?: string
          type?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
        }
        Insert: {
          id: string
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
        }
        Update: {
          id?: string
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      timer_sessions: {
        Row: {
          created_at: string
          duration_ms: number | null
          end_time: string | null
          id: string
          start_time: string
          timer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          timer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          timer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timer_sessions_timer_id_fkey"
            columns: ["timer_id"]
            isOneToOne: false
            referencedRelation: "timers"
            referencedColumns: ["id"]
          },
        ]
      }
      timers: {
        Row: {
          category: string | null
          created_at: string
          deadline: string | null
          deleted_at: string | null
          deleted_by: string | null
          elapsed_time: number
          id: string
          is_running: boolean
          last_accessed_at: string | null
          name: string
          priority: number | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          deadline?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          elapsed_time?: number
          id?: string
          is_running?: boolean
          last_accessed_at?: string | null
          name: string
          priority?: number | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          deadline?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          elapsed_time?: number
          id?: string
          is_running?: boolean
          last_accessed_at?: string | null
          name?: string
          priority?: number | null
          tags?: string[] | null
          user_id?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
