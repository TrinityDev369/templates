export interface User {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string | null;
  price: string;
  category_id: number;
  seller_id: number;
  image_url: string | null;
  status: "active" | "sold" | "archived";
  created_at: string;
}

export interface ListingWithSeller extends Listing {
  seller_name: string;
  category_name: string;
}
