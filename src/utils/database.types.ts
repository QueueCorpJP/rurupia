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
      therapists: {
        Row: {
          id: string
          name: string
          specialties: string[]
          experience: number
          rating: number
          reviews: number
          description: string
          long_description: string | null
          location: string
          price: number | null
          availability: string[]
          image_url: string | null
          qualifications: string[]
          created_at: string
          gallery_images: string[] | null
          working_days: string[] | null
          working_hours: Json | null
          height: number | null
          weight: number | null
          hobbies: string[] | null
          health_document_url: string | null
          service_areas: Json | null
        }
        Insert: {
          id: string
          name: string
          specialties?: string[]
          experience?: number
          rating?: number
          reviews?: number
          description: string
          long_description?: string | null
          location: string
          price?: number | null
          availability?: string[]
          image_url?: string | null
          qualifications?: string[]
          created_at?: string
          gallery_images?: string[] | null
          working_days?: string[] | null
          working_hours?: Json | null
          height?: number | null
          weight?: number | null
          hobbies?: string[] | null
          health_document_url?: string | null
          service_areas?: Json | null
        }
        Update: {
          id?: string
          name?: string
          specialties?: string[]
          experience?: number
          rating?: number
          reviews?: number
          description?: string
          long_description?: string | null
          location?: string
          price?: number | null
          availability?: string[]
          image_url?: string | null
          qualifications?: string[]
          created_at?: string
          gallery_images?: string[] | null
          working_days?: string[] | null
          working_hours?: Json | null
          height?: number | null
          weight?: number | null
          hobbies?: string[] | null
          health_document_url?: string | null
          service_areas?: Json | null
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          message_notifications: boolean
          booking_notifications: boolean
          promotion_notifications: boolean
          review_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          message_notifications?: boolean
          booking_notifications?: boolean
          promotion_notifications?: boolean
          review_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          message_notifications?: boolean
          booking_notifications?: boolean
          promotion_notifications?: boolean
          review_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          email_sent: boolean
          data: Json
          created_at: string
          read: boolean
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          email_sent?: boolean
          data?: Json
          created_at?: string
          read?: boolean
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          email_sent?: boolean
          data?: Json
          created_at?: string
          read?: boolean
          read_at?: string | null
        }
      }
    }
  }
} 