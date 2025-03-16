
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
