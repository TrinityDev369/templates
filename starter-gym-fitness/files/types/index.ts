export interface GymClass {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  intensity: "beginner" | "intermediate" | "advanced";
  category: "strength" | "cardio" | "yoga" | "hiit" | "boxing" | "cycling";
  trainer: Trainer;
  image: string;
  maxCapacity: number;
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  specialties: string[];
  certifications: string[];
  experience: number; // years
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  popular: boolean;
  cta: string;
}

export interface ScheduleEntry {
  id: string;
  classId: string;
  className: string;
  trainerId: string;
  trainerName: string;
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  room: string;
}

export interface Testimonial {
  id: string;
  name: string;
  image: string;
  quote: string;
  memberSince: string;
  rating: number;
}
