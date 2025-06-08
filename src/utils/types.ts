// Update the types.ts file to ensure consistency in ID types

export interface BookingRequest {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientAvatar?: string;
  userId?: string;
  requestTime: string;
  originalDate?: Date; // Store the original Date object for notifications
  servicePrice: number;
  serviceLocation: string;
  meetingMethod: string;
  status: "承認待ち" | "確定" | "キャンセル" | "完了";
  notes?: string;
  therapistId?: string;
  therapistName?: string;
}

// Define the questionnaire data interface for type safety
export interface QuestionnaireData {
  mood?: string;
  therapistType?: string;
  treatmentType?: string;
  therapistAge?: string;
}

export interface TherapistProfile {
  id: string | number;
  name: string;
  image_url?: string;
  description: string;
  long_description?: string;
  qualifications: string[];
  specialties: string[];
  location: string;
  price: number;
  rating: number;
  reviews: number;
  experience: number;
  availability: string[];
  
  // Additional properties needed for TherapistProfileForm
  height?: number | string;
  weight?: number;
  hobbies?: string[];
  serviceAreas?: {
    prefecture: string;
    cities?: string[];
  };
  workingDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  pricePerHour: number;
  bio: string;
  avatarUrl?: string;
  therapistId?: string;
  area?: string;
  detailedArea?: string;
  mbtiType?: string;
  questionnaireData?: QuestionnaireData;
  
  // New fields for enhanced filtering
  service_style?: string[];
  facial_features?: string;
  body_type?: string[];
  personality_traits?: string[];
}

export interface StoreProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  status: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

export interface UserProfile {
  id: string;
  nickname?: string;
  age?: string;
  avatar_url?: string;
  mbti?: string;
  hobbies?: string[];
  is_verified?: boolean;
  verification_document?: string;
  email?: string; // Added email field
  needs_email_setup?: boolean; // For LINE users without email addresses
}

// Adding missing types
export interface Therapist {
  id: string | number;  // Allow both string and number for flexibility
  name: string;
  imageUrl: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  review_count?: number;
  availability: string[];
  qualifications: string[];
  specialties: string[];
  services: Service[];
  // Additional fields from Supabase
  galleryImages?: string[];
  height?: number | string | null;
  weight?: number | null;
  workingDays?: string[];
  workingHours?: { start?: string; end?: string } | Record<string, any>;
  hobbies?: string[];
  age?: string;
  area?: string;
  detailedArea?: string;
  mbtiType?: string;
  questionnaireData?: QuestionnaireData;
  
  // New fields for enhanced filtering
  serviceStyle?: string[];
  facialFeatures?: string;
  bodyType?: string[];
  personalityTraits?: string[];
}

export interface Service {
  id: string | number;  // Allow both string and number for flexibility
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export interface Message {
  id: string | number;  // Allow both string and number for flexibility
  senderId: string | number;
  receiverId: string | number;
  content: string;
  timestamp: string;
  isRead: boolean;
  imageUrl: string | null;
}

export interface BlogPost {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: number;
  views?: number;
  author_name?: string;
  author_avatar?: string;
}

export interface Filters {
  search?: string;
  specialties: string[];
  maxPrice: number;
  minPrice: number | null;
  minRating: number;
  availability: string[];
  location: string[];
  mbtiType?: string;
  mood?: string;
  therapistType?: string;
  treatmentType?: string;
  therapistAge?: string;
  height?: string;
  serviceStyle?: string[];
  facialFeatures?: string;
  bodyType?: string[];
  personalityTraits?: string[];
}

export interface BookingSlot {
  id: number | string;
  date: string;
  time: string;
  therapistId: number | string;
  available: boolean;
}
