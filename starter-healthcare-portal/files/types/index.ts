export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  education: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  availableDays: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  type: "in-person" | "telehealth";
  notes: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  type: "lab-result" | "prescription" | "visit-summary" | "immunization";
  title: string;
  doctor: string;
  summary: string;
  status: "normal" | "attention" | "critical";
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  doctorCount: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
