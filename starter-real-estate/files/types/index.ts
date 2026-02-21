export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: "house" | "apartment" | "condo" | "townhouse";
  status: "for-sale" | "for-rent" | "sold";
  description: string;
  features: string[];
  images: string[];
  lat: number;
  lng: number;
  yearBuilt: number;
  agent: Agent;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  image: string;
  bio: string;
  specialties: string[];
  listingsCount: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  image: string;
  propertyCount: number;
  avgPrice: number;
}

export interface SearchFilters {
  query: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
}
