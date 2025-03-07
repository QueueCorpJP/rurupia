
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
