
import { Therapist, BookingSlot } from './types';

export const therapists: Therapist[] = [
  {
    id: 1,
    name: "Michael Johnson",
    specialties: ["Swedish", "Deep Tissue", "Sports"],
    experience: 8,
    rating: 4.9,
    reviews: 127,
    description: "Specialized in therapeutic massage targeting chronic pain and sports injuries.",
    longDescription: "With over 8 years of experience, I specialize in therapeutic massage techniques that target chronic pain, sports injuries, and stress relief. My approach combines Swedish relaxation techniques with targeted deep tissue work to address specific areas of tension. My background in sports therapy allows me to effectively work with athletes and active individuals to improve performance and recovery times. I'm passionate about helping clients achieve a greater sense of well-being and mobility through personalized massage therapy.",
    location: "Downtown Wellness Center",
    price: 90,
    availability: ["Mon", "Tue", "Thu", "Fri"],
    imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
    services: [
      { id: 1, name: "Swedish Massage", duration: 60, price: 90, description: "Relaxing full-body massage using long, flowing strokes." },
      { id: 2, name: "Deep Tissue Massage", duration: 60, price: 100, description: "Focused massage targeting deeper muscle layers and connective tissue." },
      { id: 3, name: "Sports Massage", duration: 75, price: 120, description: "Specialized techniques to enhance athletic performance and recovery." }
    ],
    qualifications: [
      "Certified Massage Therapist (CMT)",
      "Sports Massage Certification",
      "Bachelor's in Kinesiology"
    ]
  },
  {
    id: 2,
    name: "David Thompson",
    specialties: ["Hot Stone", "Aromatherapy", "Relaxation"],
    experience: 5,
    rating: 4.7,
    reviews: 89,
    description: "Expert in holistic relaxation techniques incorporating aromatherapy and hot stones.",
    longDescription: "I've dedicated 5 years to mastering holistic massage approaches that promote deep relaxation and stress relief. My sessions incorporate aromatherapy oils, hot stone techniques, and mindfulness practices to create a truly rejuvenating experience. I believe in the connection between physical and mental wellbeing, and tailor each session to address both aspects. My clients appreciate my calm demeanor and attentive approach to their unique needs. I specialize in creating a peaceful environment where healing and relaxation can naturally occur.",
    location: "Serenity Spa & Wellness",
    price: 95,
    availability: ["Wed", "Thu", "Sat", "Sun"],
    imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3",
    services: [
      { id: 1, name: "Aromatherapy Massage", duration: 60, price: 95, description: "Relaxing massage using essential oils to enhance wellbeing." },
      { id: 2, name: "Hot Stone Massage", duration: 75, price: 115, description: "Therapeutic massage incorporating smooth heated stones." },
      { id: 3, name: "Relaxation Massage", duration: 90, price: 135, description: "Extended full-body relaxation session with gentle techniques." }
    ],
    qualifications: [
      "Licensed Massage Therapist (LMT)",
      "Aromatherapy Certification",
      "Hot Stone Therapy Certification"
    ]
  },
  {
    id: 3,
    name: "Robert Williams",
    specialties: ["Shiatsu", "Thai Massage", "Reflexology"],
    experience: 12,
    rating: 4.8,
    reviews: 215,
    description: "Combines Eastern and Western techniques for comprehensive therapeutic sessions.",
    longDescription: "With 12 years of practice, I've developed a unique approach that blends Eastern and Western massage philosophies. My training in Shiatsu, Thai massage, and reflexology allows me to address both physical tension and energy flow within the body. I specialize in helping clients with chronic stress, insomnia, and tension-related headaches. My extensive experience working with diverse clients has given me insights into adapting techniques to various body types and conditions. I'm committed to continuing education and regularly incorporate new research-backed approaches into my practice.",
    location: "Eastern Healing Arts Center",
    price: 110,
    availability: ["Mon", "Tue", "Wed", "Fri", "Sat"],
    imageUrl: "https://images.unsplash.com/photo-1543132220-3ec99c6094dc?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3",
    services: [
      { id: 1, name: "Shiatsu Massage", duration: 60, price: 110, description: "Japanese pressure point therapy to balance energy and relieve tension." },
      { id: 2, name: "Thai Massage", duration: 90, price: 140, description: "Dynamic yoga-like stretches combined with pressure point therapy." },
      { id: 3, name: "Reflexology Session", duration: 45, price: 80, description: "Focused foot and hand pressure point work for whole-body benefits." }
    ],
    qualifications: [
      "Master Certification in Asian Bodywork Therapy",
      "Thai Massage Specialist",
      "Certified Reflexologist"
    ]
  },
  {
    id: 4,
    name: "James Martinez",
    specialties: ["Myofascial Release", "Trigger Point", "Medical Massage"],
    experience: 10,
    rating: 4.9,
    reviews: 176,
    description: "Clinical approach to addressing chronic pain and movement restrictions.",
    longDescription: "I specialize in clinical massage therapy with a focus on pain management and improved mobility. With 10 years in the field, I've worked alongside physical therapists and chiropractors to develop effective protocols for various conditions. My technique centers on myofascial release, trigger point therapy, and medical massage approaches that target specific issues rather than general relaxation. I excel at helping clients with persistent conditions that haven't responded to other treatments. My background in exercise science informs my approach to not just treating symptoms but addressing underlying movement patterns and imbalances.",
    location: "Integrated Health Clinic",
    price: 120,
    availability: ["Tue", "Wed", "Thu", "Fri", "Sat"],
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3",
    services: [
      { id: 1, name: "Medical Massage", duration: 60, price: 120, description: "Targeted therapeutic massage for specific medical conditions." },
      { id: 2, name: "Myofascial Release", duration: 60, price: 120, description: "Specialized technique to release fascial restrictions and improve mobility." },
      { id: 3, name: "Trigger Point Therapy", duration: 75, price: 140, description: "Focused work on muscle knots and trigger points causing pain." }
    ],
    qualifications: [
      "Clinical Massage Therapy Certification",
      "Myofascial Release Specialist",
      "Master's in Exercise Physiology"
    ]
  },
  {
    id: 5,
    name: "Alexander Chen",
    specialties: ["Therapeutic", "Cupping", "Acupressure"],
    experience: 7,
    rating: 4.6,
    reviews: 92,
    description: "Integrates traditional Chinese medicine techniques with modern therapeutic massage.",
    longDescription: "I bring together traditional Chinese medicine philosophies and contemporary therapeutic techniques in my 7 years of practice. My sessions often incorporate cupping therapy, acupressure, and therapeutic massage to address both symptoms and underlying imbalances. I believe in the body's innate ability to heal when given the right support. My approach is particularly effective for stress-related conditions, chronic fatigue, and tension patterns that haven't resolved with conventional methods. I prioritize client education and often provide self-care techniques to extend the benefits of our work together.",
    location: "Harmony Healing Center",
    price: 100,
    availability: ["Mon", "Thu", "Fri", "Sat", "Sun"],
    imageUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=1480&ixlib=rb-4.0.3",
    services: [
      { id: 1, name: "Therapeutic Massage", duration: 60, price: 100, description: "Customized massage targeting your specific needs and concerns." },
      { id: 2, name: "Cupping Therapy", duration: 45, price: 85, description: "Traditional suction technique to improve circulation and release tension." },
      { id: 3, name: "Acupressure Session", duration: 60, price: 100, description: "Pressure point therapy based on traditional Chinese medicine principles." }
    ],
    qualifications: [
      "Traditional Chinese Medicine Foundations",
      "Certified Cupping Therapist",
      "Acupressure Specialist"
    ]
  },
  {
    id: 6,
    name: "Daniel Wilson",
    specialties: ["Craniosacral", "Lymphatic Drainage", "Prenatal"],
    experience: 9,
    rating: 4.9,
    reviews: 134,
    description: "Gentle yet effective approach specializing in subtle therapeutic techniques.",
    longDescription: "Over my 9 years in practice, I've focused on gentle yet powerful modalities that support the body's natural healing processes. My specialty areas include craniosacral therapy, lymphatic drainage, and prenatal massage. These approaches use light touch but can create profound shifts in the nervous system and overall wellbeing. I excel at working with sensitive individuals, those with autoimmune conditions, and clients seeking deep relaxation without intense pressure. My prenatal work is informed by extensive specialized training to ensure both comfort and safety. I create a calm, nurturing environment where healing can occur at its own pace.",
    location: "Gentle Touch Wellness Studio",
    price: 105,
    availability: ["Mon", "Tue", "Wed", "Fri"],
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3",
    services: [
      { id: 1, name: "Craniosacral Therapy", duration: 60, price: 105, description: "Gentle touch therapy focusing on the craniosacral system and nervous system regulation." },
      { id: 2, name: "Lymphatic Drainage", duration: 60, price: 105, description: "Light touch technique to improve lymphatic flow and reduce swelling." },
      { id: 3, name: "Prenatal Massage", duration: 75, price: 125, description: "Safe, comfortable massage specifically designed for pregnancy." }
    ],
    qualifications: [
      "Certified Craniosacral Therapist",
      "Lymphatic Drainage Specialist",
      "Certified Prenatal Massage Therapist"
    ]
  }
];

export const availableSlots: Record<number, BookingSlot[]> = {
  1: [
    {
      date: "2023-05-15",
      timeSlots: ["10:00", "13:00", "15:00", "17:00"]
    },
    {
      date: "2023-05-16",
      timeSlots: ["09:00", "11:00", "14:00", "16:00"]
    },
    {
      date: "2023-05-18",
      timeSlots: ["10:00", "12:00", "15:00", "17:00"]
    }
  ],
  2: [
    {
      date: "2023-05-17",
      timeSlots: ["11:00", "14:00", "16:00", "18:00"]
    },
    {
      date: "2023-05-18",
      timeSlots: ["10:00", "13:00", "15:00", "17:00"]
    },
    {
      date: "2023-05-20",
      timeSlots: ["09:00", "11:00", "14:00", "16:00"]
    }
  ],
  3: [
    {
      date: "2023-05-15",
      timeSlots: ["09:00", "11:00", "14:00", "16:00"]
    },
    {
      date: "2023-05-16",
      timeSlots: ["10:00", "13:00", "15:00", "17:00"]
    },
    {
      date: "2023-05-17",
      timeSlots: ["09:00", "11:00", "14:00", "16:00"]
    }
  ],
  4: [
    {
      date: "2023-05-16",
      timeSlots: ["10:00", "12:00", "15:00", "17:00"]
    },
    {
      date: "2023-05-17",
      timeSlots: ["11:00", "14:00", "16:00", "18:00"]
    },
    {
      date: "2023-05-18",
      timeSlots: ["10:00", "13:00", "15:00", "17:00"]
    }
  ],
  5: [
    {
      date: "2023-05-15",
      timeSlots: ["10:00", "13:00", "15:00", "17:00"]
    },
    {
      date: "2023-05-18",
      timeSlots: ["11:00", "14:00", "16:00", "18:00"]
    },
    {
      date: "2023-05-20",
      timeSlots: ["09:00", "11:00", "14:00", "16:00"]
    }
  ],
  6: [
    {
      date: "2023-05-15",
      timeSlots: ["09:00", "11:00", "14:00", "16:00"]
    },
    {
      date: "2023-05-16",
      timeSlots: ["10:00", "13:00", "15:00", "17:00"]
    },
    {
      date: "2023-05-17",
      timeSlots: ["09:00", "11:00", "14:00", "16:00"]
    }
  ]
};
