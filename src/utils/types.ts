
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
}
