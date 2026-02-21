export interface Job {
  id: string;
  title: string;
  company: Company;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  level: "junior" | "mid" | "senior" | "lead";
  salary: { min: number; max: number };
  description: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  postedAt: string; // ISO date
  featured: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  openPositions: number;
}

export interface JobCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface SearchFilters {
  query: string;
  type: string;
  level: string;
  location: string;
}
