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
      analytics: {
        Row: {
          comparison_period: string | null
          comparison_value: number | null
          id: string
          metric_name: string
          metric_value: number
          percentage_change: number | null
          period: string
          recorded_date: string
        }
        Insert: {
          comparison_period?: string | null
          comparison_value?: number | null
          id?: string
          metric_name: string
          metric_value: number
          percentage_change?: number | null
          period: string
          recorded_date?: string
        }
        Update: {
          comparison_period?: string | null
          comparison_value?: number | null
          id?: string
          metric_name?: string
          metric_value?: number
          percentage_change?: number | null
          period?: string
          recorded_date?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_name: string
          category: string
          category_id: string | null
          content: string
          cover_image: string | null
          excerpt: string
          id: string
          published: boolean | null
          published_at: string
          read_time: number
          scheduled_for: string | null
          slug: string
          tags: string[]
          title: string
          views: number
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          category: string
          category_id?: string | null
          content: string
          cover_image?: string | null
          excerpt: string
          id?: string
          published?: boolean | null
          published_at?: string
          read_time?: number
          scheduled_for?: string | null
          slug: string
          tags?: string[]
          title: string
          views?: number
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          category?: string
          category_id?: string | null
          content?: string
          cover_image?: string | null
          excerpt?: string
          id?: string
          published?: boolean | null
          published_at?: string
          read_time?: number
          scheduled_for?: string | null
          slug?: string
          tags?: string[]
          title?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          date: string
          id: string
          location: string | null
          notes: string | null
          price: number
          service_id: string | null
          "status store": string | null
          "status therapist": string
          therapist_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          location?: string | null
          notes?: string | null
          price: number
          service_id?: string | null
          "status store"?: string | null
          "status therapist"?: string
          therapist_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          location?: string | null
          notes?: string | null
          price?: number
          service_id?: string | null
          "status store"?: string | null
          "status therapist"?: string
          therapist_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_age_distribution: {
        Row: {
          age_group: string
          count: number
          id: string
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          age_group: string
          count?: number
          id?: string
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          age_group?: string
          count?: number
          id?: string
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_age_distribution_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      followed_therapists: {
        Row: {
          created_at: string
          id: string
          therapist_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          therapist_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          therapist_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followed_therapists_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          date: string
          email: string
          id: string
          message: string
          name: string
          responded_at: string | null
          response: string | null
          status: string
          subject: string
        }
        Insert: {
          date?: string
          email: string
          id?: string
          message: string
          name: string
          responded_at?: string | null
          response?: string | null
          status?: string
          subject: string
        }
        Update: {
          date?: string
          email?: string
          id?: string
          message?: string
          name?: string
          responded_at?: string | null
          response?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          id: string
          image_url: string | null
          is_read: boolean
          receiver_id: string
          sender_id: string
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          receiver_id: string
          sender_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      monthly_customer_data: {
        Row: {
          id: string
          month: string
          new_customers: number
          returning_customers: number
          store_id: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          id?: string
          month: string
          new_customers?: number
          returning_customers?: number
          store_id?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          id?: string
          month?: string
          new_customers?: number
          returning_customers?: number
          store_id?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_customer_data_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          page: string
          user_agent: string | null
          view_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page: string
          user_agent?: string | null
          view_date?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page?: string
          user_agent?: string | null
          view_date?: string
        }
        Relationships: []
      }
      popular_booking_times: {
        Row: {
          bookings_count: number
          id: string
          recorded_date: string
          store_id: string | null
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          bookings_count?: number
          id?: string
          recorded_date?: string
          store_id?: string | null
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          bookings_count?: number
          id?: string
          recorded_date?: string
          store_id?: string | null
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "popular_booking_times_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          age: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          hobbies: string[] | null
          id: string
          invited_by_store_id: string | null
          is_verified: boolean | null
          mbti: string | null
          name: string | null
          nickname: string | null
          phone: string | null
          status: string | null
          updated_at: string
          user_type: string | null
          verification_document: string | null
        }
        Insert: {
          address?: string | null
          age?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          hobbies?: string[] | null
          id: string
          invited_by_store_id?: string | null
          is_verified?: boolean | null
          mbti?: string | null
          name?: string | null
          nickname?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_type?: string | null
          verification_document?: string | null
        }
        Update: {
          address?: string | null
          age?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          hobbies?: string[] | null
          id?: string
          invited_by_store_id?: string | null
          is_verified?: boolean | null
          mbti?: string | null
          name?: string | null
          nickname?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_type?: string | null
          verification_document?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_invited_by_store_id_fkey"
            columns: ["invited_by_store_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      store_therapists: {
        Row: {
          id: string
          schedule: string | null
          status: string
          store_id: string
          therapist_id: string
        }
        Insert: {
          id?: string
          schedule?: string | null
          status?: string
          store_id: string
          therapist_id: string
        }
        Update: {
          id?: string
          schedule?: string | null
          status?: string
          store_id?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_therapists_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_therapists_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          created_at: string
          description: string | null
          email: string
          id: string
          name: string
          phone: string
          status: string
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          name: string
          phone: string
          status?: string
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      therapist_performance: {
        Row: {
          bookings_count: number
          id: string
          rating: number | null
          recorded_date: string
          store_id: string | null
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          bookings_count?: number
          id?: string
          rating?: number | null
          recorded_date?: string
          store_id?: string | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bookings_count?: number
          id?: string
          rating?: number | null
          recorded_date?: string
          store_id?: string | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_performance_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_performance_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes: number | null
          scheduled_date: string | null
          therapist_id: string
          title: string
          visibility: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes?: number | null
          scheduled_date?: string | null
          therapist_id: string
          title: string
          visibility?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes?: number | null
          scheduled_date?: string | null
          therapist_id?: string
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_posts_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_services: {
        Row: {
          id: string
          price: number | null
          service_id: string
          therapist_id: string
        }
        Insert: {
          id?: string
          price?: number | null
          service_id: string
          therapist_id: string
        }
        Update: {
          id?: string
          price?: number | null
          service_id?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_services_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          availability: string[]
          created_at: string
          description: string
          experience: number
          gallery_images: string[] | null
          health_document_url: string | null
          height: number | null
          hobbies: string[] | null
          id: string
          image_url: string | null
          location: string
          long_description: string | null
          mbti_type: string | null
          name: string
          price: number | null
          qualifications: string[]
          questionnaire_data: Json | null
          rating: number
          reviews: number
          service_areas: Json | null
          specialties: string[]
          weight: number | null
          working_days: string[] | null
          working_hours: Json | null
        }
        Insert: {
          availability?: string[]
          created_at?: string
          description: string
          experience?: number
          gallery_images?: string[] | null
          health_document_url?: string | null
          height?: number | null
          hobbies?: string[] | null
          id?: string
          image_url?: string | null
          location: string
          long_description?: string | null
          mbti_type?: string | null
          name: string
          price?: number | null
          qualifications?: string[]
          questionnaire_data?: Json | null
          rating?: number
          reviews?: number
          service_areas?: Json | null
          specialties?: string[]
          weight?: number | null
          working_days?: string[] | null
          working_hours?: Json | null
        }
        Update: {
          availability?: string[]
          created_at?: string
          description?: string
          experience?: number
          gallery_images?: string[] | null
          health_document_url?: string | null
          height?: number | null
          hobbies?: string[] | null
          id?: string
          image_url?: string | null
          location?: string
          long_description?: string | null
          mbti_type?: string | null
          name?: string
          price?: number | null
          qualifications?: string[]
          questionnaire_data?: Json | null
          rating?: number
          reviews?: number
          service_areas?: Json | null
          specialties?: string[]
          weight?: number | null
          working_days?: string[] | null
          working_hours?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_percentage_change: {
        Args: {
          current_value: number
          previous_value: number
        }
        Returns: number
      }
      create_therapist_record: {
        Args: {
          therapist_id: string
          therapist_name: string
          therapist_description: string
          therapist_location: string
          therapist_price: number
          store_id: string
        }
        Returns: undefined
      }
      get_conversations: {
        Args: {
          user_id: string
        }
        Returns: {
          conversation_id: string
          other_user_id: string
          last_message: string
          last_message_time: string
          unread_count: number
        }[]
      }
      increment_blog_view: {
        Args: {
          slug_param: string
        }
        Returns: undefined
      }
      log_page_view:
        | {
            Args: {
              page_path: string
              ip: string
              user_agent: string
            }
            Returns: undefined
          }
        | {
            Args: {
              page_path: string
              ip: string
              user_agent: string
            }
            Returns: undefined
          }
      log_page_view_text: {
        Args: {
          page_path: string
          ip: string
          user_agent: string
        }
        Returns: undefined
      }
      setup_admin_policies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_analytics_metric: {
        Args: {
          p_metric_name: string
          p_metric_value: number
          p_period: string
          p_comparison_value: number
          p_comparison_period: string
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
