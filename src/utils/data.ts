import { Therapist, BookingSlot } from "./types";

export const therapists: Therapist[] = [
  {
    id: 1,
    name: "鈴木 健太",
    imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    description: "5年の経験を持つプロフェッショナルセラピスト。特にスポーツマッサージに特化しています。",
    location: "東京都渋谷区",
    price: 80,
    rating: 4.8,
    reviews: 124,
    availability: ["月", "火", "水", "金", "土"],
    qualifications: ["認定マッサージセラピスト", "スポーツマッサージ認定"],
    specialties: ["スウェーディッシュ", "ディープティシュー", "スポーツ"],
    services: [
      { id: 1, name: "Swedish Massage", price: 80, duration: 60 },
      { id: 2, name: "Deep Tissue Massage", price: 100, duration: 60 },
      { id: 3, name: "Sports Massage", price: 90, duration: 60 }
    ]
  },
  {
    id: 2,
    name: "山田 花子",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d674c8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=461&q=80",
    description: "アロマセラピーとリフレクソロジーの専門家。心地よいリラクゼーションを提供します。",
    location: "東京都新宿区",
    price: 90,
    rating: 4.9,
    reviews: 98,
    availability: ["火", "木", "土", "日"],
    qualifications: ["アロマセラピー認定", "リフレクソロジー認定"],
    specialties: ["アロマセラピー", "リフレクソロジー", "リラクゼーション"],
    services: [
      { id: 4, name: "Aromatherapy Massage", price: 90, duration: 60 },
      { id: 5, name: "Reflexology", price: 85, duration: 60 },
      { id: 6, name: "Relaxation Massage", price: 75, duration: 60 }
    ]
  },
  {
    id: 3,
    name: "田中 美咲",
    imageUrl: "",
    description: "経験豊富な指圧セラピスト。体のバランスを整え、自然治癒力を高めます。",
    location: "神奈川県横浜市",
    price: 75,
    rating: 4.7,
    reviews: 112,
    availability: ["月", "水", "金", "日"],
    qualifications: ["指圧セラピスト", "整体師"],
    specialties: ["指圧", "整体", "マッサージ"],
    services: [
      { id: 7, name: "Shiatsu Massage", price: 75, duration: 60 },
      { id: 8, name: "Seitai", price: 80, duration: 60 },
      { id: 9, name: "General Massage", price: 70, duration: 60 }
    ]
  },
  {
    id: 4,
    name: "小林 達也",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd8b401e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=627&q=80",
    description: "タイ古式マッサージのスペシャリスト。体の柔軟性を高め、エネルギーの流れを改善します。",
    location: "埼玉県さいたま市",
    price: 85,
    rating: 4.6,
    reviews: 89,
    availability: ["火", "木", "土"],
    qualifications: ["タイ古式マッサージ認定"],
    specialties: ["タイ古式", "ストレッチ", "リラクゼーション"],
    services: [
      { id: 10, name: "Thai Massage", price: 85, duration: 60 },
      { id: 11, name: "Stretch Therapy", price: 90, duration: 60 },
      { id: 12, name: "Relaxation Therapy", price: 70, duration: 60 }
    ]
  }
];

export const bookingSlots: BookingSlot[] = [
  { id: 1, date: "2023-11-15", time: "10:00", therapistId: 1, available: true },
  { id: 2, date: "2023-11-15", time: "11:00", therapistId: 1, available: true },
  { id: 3, date: "2023-11-15", time: "13:00", therapistId: 1, available: false },
  { id: 4, date: "2023-11-16", time: "14:00", therapistId: 2, available: true },
  { id: 5, date: "2023-11-16", time: "15:00", therapistId: 2, available: true },
  { id: 6, date: "2023-11-17", time: "16:00", therapistId: 3, available: true },
  { id: 7, date: "2023-11-17", time: "17:00", therapistId: 3, available: false },
  { id: 8, date: "2023-11-18", time: "18:00", therapistId: 4, available: true },
  { id: 9, date: "2023-11-18", time: "19:00", therapistId: 4, available: true }
];

export const availableSlots: Record<string | number, { date: string; timeSlots: string[] }[]> = {
  1: [
    { date: "2023-11-15", timeSlots: ["10:00", "11:00", "13:00"] },
    { date: "2023-11-16", timeSlots: ["14:00", "15:00"] },
    { date: "2023-11-17", timeSlots: ["09:00", "16:00"] }
  ],
  2: [
    { date: "2023-11-15", timeSlots: ["09:00", "10:00"] },
    { date: "2023-11-18", timeSlots: ["13:00", "14:00", "15:00"] }
  ],
  3: [
    { date: "2023-11-16", timeSlots: ["11:00", "12:00"] },
    { date: "2023-11-19", timeSlots: ["16:00", "17:00"] }
  ],
  4: [
    { date: "2023-11-17", timeSlots: ["10:00", "11:00"] },
    { date: "2023-11-20", timeSlots: ["13:00", "14:00"] }
  ]
};
