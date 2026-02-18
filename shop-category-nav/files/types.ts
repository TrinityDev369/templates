export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  children?: Category[];
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
