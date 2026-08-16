export interface BreadcrumbItem {
  id: string;
  label: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string) => void;
  maxVisibleItems?: number;
  className?: string;
}
