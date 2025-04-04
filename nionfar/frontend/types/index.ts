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
  isOnline?: boolean;
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

export interface Order {
  id: string;
  title: string;
  client: User;
  service: Service;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'revision';
  price: number;
  createdAt: string;
  deadline: string;
  isPaid: boolean;
  requirements?: string;
  messages?: number;
}

export interface Earnings {
  total: number;
  pending: number;
  withdrawn: number;
  available: number;
}

export interface Analytics {
  views: number;
  clicks: number;
  conversionRate: number;
  averageRating: number;
  completionRate: number;
  totalOrders: number;
  pendingOrders: number;
  totalEarnings: number;
  totalReviews: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'message' | 'system' | 'payment';
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface FreelancerStats {
  earnings: Earnings;
  analytics: Analytics;
  activeOrders: number;
  pendingReviews: number;
  responseRate: number;
  responseTime: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'archive' | 'other';
  size: number;
  thumbnailUrl?: string;
  extension?: string;
  originalName?: string;
  uploadedAt?: string;
  isUploading?: boolean;
  progress?: number;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  receiver: User;
  conversation: string;
  createdAt: string;
  isRead: boolean;
  attachments?: Attachment[];
  isDelivered?: boolean;
  isFailed?: boolean;
  isUploading?: boolean;
  replyTo?: Message;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  order?: Order;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
} 