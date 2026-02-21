export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: Venue;
  category: "conference" | "workshop" | "meetup" | "webinar" | "hackathon";
  image: string;
  speakers: Speaker[];
  ticketTiers: TicketTier[];
  featured: boolean;
  tags: string[];
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  image: string;
  topics: string[];
  social: { twitter?: string; linkedin?: string; website?: string };
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  capacity: number;
  mapUrl: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  available: number;
  maxPerOrder: number;
}

export interface ScheduleSlot {
  id: string;
  eventId: string;
  time: string;
  endTime: string;
  title: string;
  speaker: string;
  room: string;
  type: "talk" | "workshop" | "break" | "networking" | "keynote";
}
