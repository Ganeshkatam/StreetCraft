export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      business_members: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          avg_ticket_inr: number | null
          business_id: string
          category: string
          city: string
          default_offer: string | null
          landmarks: string | null
          name: string
          neighborhood: string
          peak_hours: string | null
          phone_whatsapp: string | null
          primary_goal: string | null
          signature_items: string | null
          slow_hours: string | null
          style_voice: string | null
          target_customer: string | null
          target_monthly_customers: number | null
          updated_at: string
        }
        Insert: {
          avg_ticket_inr?: number | null
          business_id: string
          category: string
          city?: string
          default_offer?: string | null
          landmarks?: string | null
          name: string
          neighborhood?: string
          peak_hours?: string | null
          phone_whatsapp?: string | null
          primary_goal?: string | null
          signature_items?: string | null
          slow_hours?: string | null
          style_voice?: string | null
          target_customer?: string | null
          target_monthly_customers?: number | null
          updated_at?: string
        }
        Update: {
          avg_ticket_inr?: number | null
          business_id?: string
          category?: string
          city?: string
          default_offer?: string | null
          landmarks?: string | null
          name?: string
          neighborhood?: string
          peak_hours?: string | null
          phone_whatsapp?: string | null
          primary_goal?: string | null
          signature_items?: string | null
          slow_hours?: string | null
          style_voice?: string | null
          target_customer?: string | null
          target_monthly_customers?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          timezone: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          timezone?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          timezone?: string
        }
        Relationships: []
      }
      campaign_outputs: {
        Row: {
          campaign_id: string
          channel: string
          content: Json
          created_at: string
          id: string
          metadata: Json
          status: string
          updated_at: string
          validation_status: string
        }
        Insert: {
          campaign_id: string
          channel: string
          content: Json
          created_at?: string
          id?: string
          metadata?: Json
          status?: string
          updated_at?: string
          validation_status?: string
        }
        Update: {
          campaign_id?: string
          channel?: string
          content?: Json
          created_at?: string
          id?: string
          metadata?: Json
          status?: string
          updated_at?: string
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_outputs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          audience: string
          business_id: string
          claim_token: string | null
          created_at: string
          error_message: string | null
          id: string
          objective: string
          offer: Json
          performance_notes: string | null
          schedule: Json
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          audience?: string
          business_id: string
          claim_token?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          objective: string
          offer?: Json
          performance_notes?: string | null
          schedule?: Json
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          audience?: string
          business_id?: string
          claim_token?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          objective?: string
          offer?: Json
          performance_notes?: string | null
          schedule?: Json
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      festival_calendar: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          marketing_relevance: string
          name: string
          region: string
          starts_at: string
          suggested_offer: string | null
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          marketing_relevance?: string
          name: string
          region?: string
          starts_at: string
          suggested_offer?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          marketing_relevance?: string
          name?: string
          region?: string
          starts_at?: string
          suggested_offer?: string | null
        }
        Relationships: []
      }
      founder_allocation: {
        Row: {
          claimed_slots: number
          id: number
          total_slots: number
        }
        Insert: {
          claimed_slots?: number
          id: number
          total_slots?: number
        }
        Update: {
          claimed_slots?: number
          id?: number
          total_slots?: number
        }
        Relationships: []
      }
      founder_claims: {
        Row: {
          billing_cycle: string
          claimed_at: string
          id: string
          user_id: string
        }
        Insert: {
          billing_cycle: string
          claimed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          claimed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          annual_price_inr: number
          business_limit: number
          channels: string[]
          created_at: string
          features: string[]
          id: string
          monthly_campaign_limit: number
          monthly_inr: number
          name: string
          quarterly_price_inr: number
        }
        Insert: {
          active?: boolean
          annual_price_inr?: number
          business_limit?: number
          channels?: string[]
          created_at?: string
          features?: string[]
          id: string
          monthly_campaign_limit: number
          monthly_inr: number
          name: string
          quarterly_price_inr?: number
        }
        Update: {
          active?: boolean
          annual_price_inr?: number
          business_limit?: number
          channels?: string[]
          created_at?: string
          features?: string[]
          id?: string
          monthly_campaign_limit?: number
          monthly_inr?: number
          name?: string
          quarterly_price_inr?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          notification_preferences: Json
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          notification_preferences?: Json
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          notification_preferences?: Json
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          provider: string
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          provider?: string
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          provider?: string
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          business_id: string
          campaign_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          units: number
          user_id: string
        }
        Insert: {
          business_id: string
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          units?: number
          user_id: string
        }
        Update: {
          business_id?: string
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          units?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_periods: {
        Row: {
          business_id: string
          campaign_limit: number
          campaigns_used: number
          created_at: string
          id: string
          period_end: string
          period_start: string
          plan: string
        }
        Insert: {
          business_id: string
          campaign_limit?: number
          campaigns_used?: number
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          plan?: string
        }
        Update: {
          business_id?: string
          campaign_limit?: number
          campaigns_used?: number
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          plan?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_periods_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_user_subscription: { Args: never; Returns: Json }
      claim_anonymous_campaign: {
        Args: { p_business_id: string; p_claim_token: string }
        Returns: boolean
      }
      claim_founder_tier: { Args: { p_billing_cycle: string }; Returns: Json }
      confirm_payment_and_activate_subscription: {
        Args: {
          p_billing_cycle: string
          p_order_id: string
          p_payment_id: string
          p_payment_provider: string
          p_plan_id: string
        }
        Returns: Json
      }
      create_business_atomically: {
        Args: {
          p_category: string
          p_city: string
          p_name: string
          p_neighborhood: string
          p_phone: string
        }
        Returns: Json
      }
      delete_business_atomically: {
        Args: { p_business_id: string }
        Returns: Json
      }
      is_business_member:
        | { Args: { target_biz_id: string }; Returns: boolean }
        | {
            Args: { check_user_id: string; target_biz_id: string }
            Returns: boolean
          }
      save_campaign_atomically: {
        Args: {
          p_audience: string
          p_business_id: string
          p_campaign_type: string
          p_google_content: Json
          p_instagram_content: Json
          p_objective: string
          p_offer: Json
          p_poster_content: Json
          p_schedule: Json
          p_whatsapp_content: Json
        }
        Returns: Json
      }
      save_campaign_pack_atomically: {
        Args: {
          p_audience: string
          p_business_id: string
          p_campaign_type: string
          p_google_content: Json
          p_instagram_content: Json
          p_objective: string
          p_offer: Json
          p_poster_content: Json
          p_schedule: Json
          p_whatsapp_content: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const;
