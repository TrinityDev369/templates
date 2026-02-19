export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "starters" | "mains" | "desserts" | "drinks";
  image: string;
  calories?: number;
  tags?: string[];
}

export interface Chef {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  text: string;
  rating: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  price?: string;
  image: string;
  badge?: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  hours: { days: string; time: string }[];
}
