export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      business_members: {
        Row: {
          business_id: string;
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
      };
      business_profiles: {
        Row: {
          avg_ticket_inr: number | null;
          business_id: string;
          category: string;
          city: string;
          default_offer: string | null;
          landmarks: string | null;
          name: string;
          neighborhood: string;
          peak_hours: string | null;
          phone_whatsapp: string | null;
          primary_goal: string | null;
          signature_items: string | null;
          slow_hours: string | null;
          style_voice: string | null;
          target_customer: string | null;
          target_monthly_customers: number | null;
          updated_at: string;
        };
        Insert: {
          avg_ticket_inr?: number | null;
          business_id: string;
          category?: string;
          city?: string;
          default_offer?: string | null;
          landmarks?: string | null;
          name: string;
          neighborhood?: string;
          peak_hours?: string | null;
          phone_whatsapp?: string | null;
          primary_goal?: string | null;
          signature_items?: string | null;
          slow_hours?: string | null;
          style_voice?: string | null;
          target_customer?: string | null;
          target_monthly_customers?: number | null;
          updated_at?: string;
        };
        Update: {
          avg_ticket_inr?: number | null;
          business_id?: string;
          category?: string;
          city?: string;
          default_offer?: string | null;
          landmarks?: string | null;
          name?: string;
          neighborhood?: string;
          peak_hours?: string | null;
          phone_whatsapp?: string | null;
          primary_goal?: string | null;
          signature_items?: string | null;
          slow_hours?: string | null;
          style_voice?: string | null;
          target_customer?: string | null;
          target_monthly_customers?: number | null;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          name: string;
          timezone: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          id?: string;
          name: string;
          timezone?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          name?: string;
          timezone?: string;
        };
      };
      campaign_outputs: {
        Row: {
          campaign_id: string;
          channel: string;
          content: Json;
          created_at: string;
          id: string;
          metadata: Json;
          status: string;
          updated_at: string;
          validation_status: string;
        };
        Insert: {
          campaign_id: string;
          channel: string;
          content?: Json;
          created_at?: string;
          id?: string;
          metadata?: Json;
          status?: string;
          updated_at?: string;
          validation_status?: string;
        };
        Update: {
          campaign_id?: string;
          channel?: string;
          content?: Json;
          created_at?: string;
          id?: string;
          metadata?: Json;
          status?: string;
          updated_at?: string;
          validation_status?: string;
        };
      };
      campaigns: {
        Row: {
          audience: string;
          business_id: string | null;
          claim_token: string | null;
          created_at: string;
          error_message: string | null;
          id: string;
          objective: string;
          offer: Json;
          performance_notes: string | null;
          schedule: Json;
          status: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          audience?: string;
          business_id?: string | null;
          claim_token?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          objective: string;
          offer?: Json;
          performance_notes?: string | null;
          schedule?: Json;
          status?: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          audience?: string;
          business_id?: string | null;
          claim_token?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          objective?: string;
          offer?: Json;
          performance_notes?: string | null;
          schedule?: Json;
          status?: string;
          type?: string;
          updated_at?: string;
        };
      };
      festival_calendar: {
        Row: {
          created_at: string;
          ends_at: string;
          id: string;
          marketing_relevance: string;
          name: string;
          region: string;
          starts_at: string;
          suggested_offer: string | null;
        };
        Insert: {
          created_at?: string;
          ends_at: string;
          id?: string;
          marketing_relevance?: string;
          name: string;
          region?: string;
          starts_at: string;
          suggested_offer?: string | null;
        };
        Update: {
          created_at?: string;
          ends_at?: string;
          id?: string;
          marketing_relevance?: string;
          name?: string;
          region?: string;
          starts_at?: string;
          suggested_offer?: string | null;
        };
      };
      plans: {
        Row: {
          active: boolean;
          channels: string[];
          created_at: string;
          features: string[];
          id: string;
          monthly_pack_limit: number;
          name: string;
          monthly_inr: number;
        };
        Insert: {
          active?: boolean;
          channels?: string[];
          created_at?: string;
          features?: string[];
          id: string;
          monthly_pack_limit: number;
          name: string;
          monthly_inr: number;
        };
        Update: {
          active?: boolean;
          channels?: string[];
          created_at?: string;
          features?: string[];
          id?: string;
          monthly_pack_limit?: number;
          name?: string;
          monthly_inr?: number;
        };
      };
      subscriptions: {
        Row: {
          business_id: string;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          id: string;
          plan_id: string;
          provider: string;
          provider_subscription_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          current_period_end: string;
          current_period_start: string;
          id?: string;
          plan_id: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          id?: string;
          plan_id?: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: string;
          updated_at?: string;
        };
      };
      usage_events: {
        Row: {
          business_id: string;
          campaign_id: string | null;
          created_at: string;
          description: string | null;
          event_type: string;
          id: string;
          units: number;
          user_id: string | null;
        };
        Insert: {
          business_id: string;
          campaign_id?: string | null;
          created_at?: string;
          description?: string | null;
          event_type?: string;
          id?: string;
          units?: number;
          user_id?: string | null;
        };
        Update: {
          business_id?: string;
          campaign_id?: string | null;
          created_at?: string;
          description?: string | null;
          event_type?: string;
          id?: string;
          units?: number;
          user_id?: string | null;
        };
      };
      usage_periods: {
        Row: {
          business_id: string;
          created_at: string;
          id: string;
          pack_limit: number;
          packs_used: number;
          period_end: string;
          period_start: string;
          plan: string;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          id?: string;
          pack_limit?: number;
          packs_used?: number;
          period_end: string;
          period_start: string;
          plan?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          id?: string;
          pack_limit?: number;
          packs_used?: number;
          period_end?: string;
          period_start?: string;
          plan?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_anonymous_campaign: {
        Args: { p_business_id: string; p_claim_token: string };
        Returns: Json;
      };
      is_business_member: { Args: { target_biz_id: string }; Returns: boolean };
      reserve_and_create_campaign: {
        Args: {
          p_audience: string;
          p_business_id: string;
          p_objective: string;
          p_offer: Json;
          p_schedule: Json;
          p_type: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
