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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      currency_rates: {
        Row: {
          currency: string
          fetched_at: string
          id: string
          rate_per_tnd: number
          source: string
          updated_at: string
        }
        Insert: {
          currency: string
          fetched_at?: string
          id?: string
          rate_per_tnd: number
          source?: string
          updated_at?: string
        }
        Update: {
          currency?: string
          fetched_at?: string
          id?: string
          rate_per_tnd?: number
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_config: {
        Row: {
          created_at: string
          display_order: number
          id: string
          key: string
          kind: string
          label: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          key: string
          kind: string
          label: string
          updated_at?: string
          value?: number
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          key?: string
          kind?: string
          label?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          concept: string | null
          created_at: string
          display_order: number
          featured: boolean
          gallery: string[] | null
          hero_image: string | null
          id: string
          location: string | null
          map_url: string | null
          materials: string | null
          short_description: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          category: string
          concept?: string | null
          created_at?: string
          display_order?: number
          featured?: boolean
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          location?: string | null
          map_url?: string | null
          materials?: string | null
          short_description?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          category?: string
          concept?: string | null
          created_at?: string
          display_order?: number
          featured?: boolean
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          location?: string | null
          map_url?: string | null
          materials?: string | null
          short_description?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      quotation_requests: {
        Row: {
          admin_notes: string | null
          ai_draft: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          currency: string
          estimated_max: number | null
          estimated_min: number | null
          final_quotation: string | null
          id: string
          message: string | null
          project_location: string | null
          project_size: string | null
          project_style: string | null
          project_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          ai_draft?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          currency?: string
          estimated_max?: number | null
          estimated_min?: number | null
          final_quotation?: string | null
          id?: string
          message?: string | null
          project_location?: string | null
          project_size?: string | null
          project_style?: string | null
          project_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          ai_draft?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          currency?: string
          estimated_max?: number | null
          estimated_min?: number | null
          final_quotation?: string | null
          id?: string
          message?: string | null
          project_location?: string | null
          project_size?: string | null
          project_style?: string | null
          project_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_text: string | null
          contact_email: string
          facebook_url: string | null
          hero_subtext: string
          hero_tagline: string
          hero_title: string
          id: string
          instagram_url: string | null
          map_url: string | null
          updated_at: string
        }
        Insert: {
          about_text?: string | null
          contact_email?: string
          facebook_url?: string | null
          hero_subtext?: string
          hero_tagline?: string
          hero_title?: string
          id?: string
          instagram_url?: string | null
          map_url?: string | null
          updated_at?: string
        }
        Update: {
          about_text?: string | null
          contact_email?: string
          facebook_url?: string | null
          hero_subtext?: string
          hero_tagline?: string
          hero_title?: string
          id?: string
          instagram_url?: string | null
          map_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      pricing_catalog: {
        Row: {
          display_order: number | null
          id: string | null
          key: string | null
          kind: string | null
          label: string | null
        }
        Insert: {
          display_order?: number | null
          id?: string | null
          key?: string | null
          kind?: string | null
          label?: string | null
        }
        Update: {
          display_order?: number | null
          id?: string | null
          key?: string | null
          kind?: string | null
          label?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
