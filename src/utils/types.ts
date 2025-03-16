

export interface BookingRequest {
  id: string;
  clientName: string;
  requestTime: string;
  servicePrice: number;
  serviceLocation: string;
  meetingMethod: string;
  status: "承認待ち" | "確定" | "キャンセル" | "完了";
  notes: string;
  therapistId: string;
}

export interface TherapistProfile {
  id: string;
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
  height?: number;
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
}

// Adding missing types
export interface Therapist {
  id: number | string;
  name: string;
  imageUrl: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  availability: string[];
  qualifications: string[];
  specialties: string[];
  services: Service[];
}

export interface Service {
  id: string | number;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  imageUrl: string | null;
}

export interface BlogPost {
  id: number;
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
}

export interface BookingSlot {
  id: number;
  date: string;
  time: string;
  therapistId: number;
  available: boolean;
}

