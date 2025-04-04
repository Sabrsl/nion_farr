export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon: string;
  image?: string;
  description?: string;
  isActive?: boolean;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  rating?: number;
  level?: string;
  memberSince?: Date;
  isVerified?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description?: string;
  price: number;
  rating: number;
  totalReviews: number;
  deliveryTime: number;
  images: string[];
  provider?: User;
  slug: string;
  createdAt: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
  };
  tags?: string[];
  isActive?: boolean;
  orderCount: number;
}

export interface FilterOptions {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  deliveryTime?: string;
  sort?: string;
}

export interface Testimonial {
  id: string;
  user: User;
  content: string;
  rating: number;
  service?: {
    id: string;
    title: string;
  };
  createdAt: string;
} 