
export interface Therapist {
  id: number;
  name: string;
  specialties: string[];
  experience: number;
  rating: number;
  reviews: number;
  description: string;
  longDescription: string;
  location: string;
  price: number;
  availability: string[];
  imageUrl: string;
  services: Service[];
  qualifications: string[];
}

export interface TherapistProfile {
  id: string;
  name: string;
  therapistId: string;
  location: string;
  area: string;
  detailedArea: string;
  workingDays: string[];
  workingHours: { start: string; end: string };
  pricePerHour: number;
  bio: string;
  height?: number;
  weight?: number;
  hobbies?: string[];
  serviceAreas?: { prefecture: string; cities: string[] };
  avatarUrl: string;
  galleryImages?: string[];
  customPricing?: {
    serviceId: number;
    price: number;
  }[];
}

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
}

export interface BookingSlot {
  date: string;
  timeSlots: string[];
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  imageUrl?: string | null;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  views?: number;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  status: string;
  services: Service[];
  therapists: StoreTherapist[];
}

export interface StoreTherapist {
  id: number;
  name: string;
  schedule: string;
  reservations: number;
  totalSales: string;
  status: string;
  newClients?: number;
  repeatClients?: number;
}

export interface Reservation {
  id: string;
  date: string;
  userName: string;
  therapist: string;
  status: string;
  price: string;
}

export interface Inquiry {
  id: number;
  date: string;
  userName: string;
  type: string;
  status: string;
  content: string;
}

export interface BookingRequest {
  id: string;
  clientName: string;
  requestTime: string;
  servicePrice: number;
  serviceLocation: string;
  meetingMethod: string;
  status: "承認待ち" | "確定" | "キャンセル" | "完了";
  therapistId?: number;
  therapistName?: string;
  storeId?: string;
  storeName?: string;
  notes?: string;
  prefecture?: string;
  locationDetails?: string;
}

export interface PostItem {
  id: string;
  content: string;
  postedAt: string;
  likes: number;
  authorName: string;
  authorAvatar: string;
}

export interface Filters {
  search: string;
  specialties: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  availability?: string[];
  location?: string[];
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  age?: string;
  hobbies?: string[];
  mbti?: string;
  isVerified?: boolean;
  verificationDocument?: string;
}
