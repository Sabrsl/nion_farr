import { ReactNode } from 'react';
import { IconType } from 'react-icons';

export type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  count: number;
};

export type NavItem = {
  name: string;
  href: string;
  icon: IconType;
  badge?: number;
};

export interface User {
  id: string;
  email?: string;
  name?: string;
  username?: string;
  level?: string;
  rating?: number;
  memberSince?: Date;
  isVerified?: boolean;
  role?: 'client' | 'freelancer' | 'admin';
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
  completedOrders?: number;
}

export interface Service {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  price: number;
  rating?: number;
  totalReviews?: number;
  deliveryTime?: number;
  revisions?: number;
  images?: string[];
  image?: string;
  provider?: User;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
  };
  tags?: string[];
  isActive?: boolean;
  orderCount?: number;
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

export type OrderStatus = 
  | 'en_attente'
  | 'en_attente_acceptation'
  | 'en_attente_paiement'
  | 'en_cours'
  | 'in_progress'
  | 'pending'
  | 'completed'
  | 'revision'
  | 'livré'
  | 'révision_demandée'
  | 'en_modification'
  | 'terminé'
  | 'terminée'
  | 'annulé'
  | 'annulée'
  | 'litige'
  | 'livraison_en_retard'
  | 'terminée_manuellement';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  content?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'order' | 'system' | 'payment';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Order {
  id: string;
  title: string;
  client: User;
  seller?: User;
  service: Service;
  status: OrderStatus;
  price: number;
  createdAt: string;
  deadline: string;
  isPaid: boolean;
  requirements: string;
  messages: any[] | number;
  deliverables?: Deliverable[];
  revisionRequests?: RevisionRequest[];
  dispute?: Dispute;
  payment?: Payment;
  lastUpdatedAt?: string;
  deliveryValidationDeadline?: string;
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

export interface NotificationLegacy {
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
  availableBalance?: number;
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

export interface Review {
  id: string;
  order: Order;
  service: Service;
  reviewer: User;
  recipient: User;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isPublic: boolean;
  reply?: {
    content: string;
    createdAt: string;
  };
  likes: number;
  isHelpful?: boolean;
  tags?: string[];
}

export interface Transaction {
  id: string;
  type: 'order' | 'withdrawal' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  orderId?: string;
  withdrawalId?: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: 'bank_transfer' | 'mobile_money';
  accountDetails: {
    type: string;
    number: string;
    name: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface Deliverable {
  id: string;
  orderId: string;
  message: string;
  fileUrls: string[];
  createdAt: string;
}

export interface RevisionRequest {
  id: string;
  orderId: string;
  message: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  initiatedBy: string;
  reason: string;
  details: string;
  attachments: string[];
  status: 'ouvert' | 'résolu' | 'fermé';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: 'client' | 'vendeur';
  resolutionReason?: string;
  updates: {
    userId: string;
    message: string;
    createdAt: string;
    type: 'status_change' | 'comment' | 'resolution';
  }[];
  followers?: string[];
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'attente' | 'validé' | 'remboursé' | 'échoué';
  method: 'carte' | 'mobile_money' | 'virement';
  transactionId: string;
  createdAt: string;
} 