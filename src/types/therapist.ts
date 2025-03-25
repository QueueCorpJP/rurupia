// Therapist type definition with settings fields

export interface TherapistProfile {
  id: string;
  name: string;
  description?: string;
  long_description?: string;
  specialties?: string[];
  experience?: number;
  rating?: number;
  reviews?: number;
  location?: string;
  price?: number;
  availability?: string[];
  working_days?: string[];
  working_hours?: { start: string; end: string };
  image_url?: string;
  avatar_url?: string;
  gallery_images?: string[];
  health_document_url?: string;
  qualifications?: string[];
  created_at?: string;
  height?: number;
  weight?: number;
  hobbies?: string[];
  service_areas?: { prefecture: string; cities: string[] };
  
  // Account settings
  language?: string;
  
  // Privacy settings
  is_profile_public?: boolean;
  show_follower_count?: boolean;
  show_availability?: boolean;
  restrict_messaging?: boolean;
  
  // Notification settings
  email_notifications?: boolean;
  booking_notifications?: boolean;
  message_notifications?: boolean;
  marketing_notifications?: boolean;
}

// Simplified therapist type for lists and cards
export interface TherapistCard {
  id: string;
  name: string;
  description?: string;
  specialties?: string[];
  rating?: number;
  reviews?: number;
  location?: string;
  price?: number;
  image_url?: string;
}

// Type for updating therapist settings
export interface TherapistSettings {
  // Account settings
  name?: string;
  language?: string;
  
  // Privacy settings
  is_profile_public?: boolean;
  show_follower_count?: boolean;
  show_availability?: boolean;
  restrict_messaging?: boolean;
  
  // Notification settings
  email_notifications?: boolean;
  booking_notifications?: boolean;
  message_notifications?: boolean;
  marketing_notifications?: boolean;
} 