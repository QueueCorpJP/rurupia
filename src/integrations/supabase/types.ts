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
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_name: string
          category: string
          content: string
          cover_image: string | null
          excerpt: string
          id: string
          published_at: string
          read_time: number
          slug: string
          tags: string[]
          title: string
          views: number
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          category: string
          content: string
          cover_image?: string | null
          excerpt: string
          id?: string
          published_at?: string
          read_time?: number
          slug: string
          tags?: string[]
          title: string
          views?: number
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          category?: string
          content?: string
          cover_image?: string | null
          excerpt?: string
          id?: string
          published_at?: string
          read_time?: number
          slug?: string
          tags?: string[]
          title?: string
          views?: number
        }
        Relationships: []
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
          status: string
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
          status?: string
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
          status?: string
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
      profiles: {
        Row: {
          address: string | null
          age: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          hobbies: string[] | null
          id: string
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
        Relationships: []
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
          id: string
          image_url: string | null
          location: string
          long_description: string | null
          name: string
          price: number
          qualifications: string[]
          rating: number
          reviews: number
          specialties: string[]
        }
        Insert: {
          availability?: string[]
          created_at?: string
          description: string
          experience?: number
          id?: string
          image_url?: string | null
          location: string
          long_description?: string | null
          name: string
          price: number
          qualifications?: string[]
          rating?: number
          reviews?: number
          specialties?: string[]
        }
        Update: {
          availability?: string[]
          created_at?: string
          description?: string
          experience?: number
          id?: string
          image_url?: string | null
          location?: string
          long_description?: string | null
          name?: string
          price?: number
          qualifications?: string[]
          rating?: number
          reviews?: number
          specialties?: string[]
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
