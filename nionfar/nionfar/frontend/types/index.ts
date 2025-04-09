import { ReactNode } from 'react';
import { IconType } from 'react-icons';

export type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  count: number;
  image?: string;
  parentId?: string;
  children?: Category[];
  subcategories?: SubCategory[];
};

export type NavItem = {
  name: string;
  href: string;
  icon: IconType;
  badge?: number;
};

export interface User {
  id: string;
  username?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'client' | 'provider' | 'admin';
  isVerified?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isFreelancer?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  lastActivityAt?: string;
  bio?: string;
  location?: string;
  website?: string;
  languages?: string[];
  skills?: string[];
  joinedAt?: string;
  rating?: number;
  level?: string;
  memberSince?: Date;
  specialty?: string;
  totalReviews?: number;
  completedOrders?: number;
  isOnline?: boolean;
  averageResponseTime?: number;
  lastActive?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  gallery?: string[];
  category?: string | { id: string; name: string };
  subcategory?: string;
  tags?: string[];
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  isFeatured?: boolean;
  deliveryTime?: number;
  revisions?: number;
  provider?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    totalReviews?: number;
    username?: string;
    level?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  queuedOrders?: number;
  images?: string[];
  slug?: string;
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
  | 'cancelled'
  | 'litige'
  | 'dispute'
  | 'livraison_en_retard'
  | 'terminée_manuellement';

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'message' | 'review' | 'system';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  message?: string;
}

export interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage?: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  clientId: string;
  status: OrderStatus;
  price: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  rating?: number;
  review?: string;
  deliverables?: Deliverable[];
  title?: string;
  client?: any;
  service?: any;
  createdAt?: string;
  deadline?: string;
  isPaid?: boolean;
  requirements?: string;
  messages?: any[];
  seller?: any;
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
  earnings: {
    total: number;
    pending: number;
    withdrawn: number;
    available: number;
  };
  activeOrders: number;
  analytics: {
    totalOrders: number;
    views: number;
    conversionRate: number;
    averageRating: number;
    totalReviews: number;
    clicks: number;
    completionRate: number;
    pendingOrders: number;
    totalEarnings: number;
  };
  pendingReviews: number;
  responseRate: number;
  responseTime: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: string | number;
  type: string;
  thumbnailUrl?: string;
  extension?: string;
  originalName?: string;
  uploadedAt?: string;
}

export interface Message {
  id: string;
  conversationId?: string;
  conversation?: string;
  senderId?: string;
  sender?: any;
  receiverId?: string;
  receiver?: any;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  attachments?: Attachment[];
  isTemporary?: boolean;
  isDelivered?: boolean;
  subject?: string;
  hasAttachment?: boolean;
  serviceId?: string;
  serviceTitle?: string;
}

export interface Conversation {
  id: string;
  participants: string[] | any[];
  lastMessage?: string | any;
  lastMessageDate?: string;
  unreadCount: number;
  orderId?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  order?: any;
}

export interface Review {
  id: string;
  serviceId?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  content: string;
  createdAt: string;
  title?: string;
  helpfulCount?: number;
  reply?: {
    content: string;
    createdAt: string;
  };
  reviewer?: any;
  service?: any;
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
  userId: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  amount: number;
  method: 'bank_transfer' | 'mobile_money';
  accountDetails: {
    type: string;
    number: string;
    name: string;
  };
  status: 'en_attente' | 'validé' | 'rejeté' | 'completed' | 'pending';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
  transactionDetails?: {
    reference: string;
    processedAt: string;
    notes?: string;
  };
}

export interface Deliverable {
  id: string;
  name: string;
  url: string;
  size?: string;
  orderId?: string;
  message?: string;
  fileUrls?: string[];
  createdAt?: string;
  isRevision?: boolean;
}

export interface RevisionRequest {
  id: string;
  orderId: string;
  message: string;
  createdAt: string;
}

export interface DisputeLogEntry {
  id: string;
  disputeId: string;
  userId: string;
  userType: 'client' | 'vendeur' | 'admin' | 'system';
  action: 'création' | 'commentaire' | 'pièce_jointe' | 'changement_statut' | 'résolution' | 'vue' | 'clic' | 'notification_envoyée' | 'notification_lue' | 'autre';
  details: string;
  metadata?: Record<string, any>;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  initiatedBy: string;
  reason: string;
  details: string;
  attachments: string[];
  status: 'ouvert' | 'en_attente_de_reponse' | 'en_traitement' | 'résolu_en_faveur_client' | 
    'résolu_en_faveur_vendeur' | 'clos_automatiquement' | 'refusé';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: ResolutionType;
  resolutionReason?: string;
  updates: {
    userId: string;
    message: string;
    createdAt: string;
    type: 'status_change' | 'comment' | 'resolution';
  }[];
  logs?: DisputeLogEntry[];
  summary?: string;
  followers?: string[];
}

export type ResolutionType = 
  | 'remboursement_partiel' 
  | 'remboursement_total' 
  | 'livraison_corrigée' 
  | 'refus_du_litige' 
  | 'prolongation_délai' 
  | 'arrangement_amiable';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: 'card' | 'wave' | 'orange';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
}

// Interface pour le classement des freelancers
export interface FreelancerRanking {
  userId: string;
  overallScore: number;
  reliabilityScore: number; // score basé sur les litiges et leur résolution
  qualityScore: number; // score basé sur les évaluations
  deliveryScore: number; // score basé sur les délais de livraison
  responseScore: number; // score basé sur le temps de réponse
  verificationBonus: number; // bonus pour la vérification KYC
  tier: 'nouveau' | 'établi' | 'premium' | 'elite'; // niveau du freelancer
  position: number; // position dans le classement global
  categoryPosition?: number; // position dans la catégorie
  disputeStats: {
    totalDisputes: number;
    resolvedInFavor: number;
    resolvedAgainst: number;
    disputeRatio: number; // ratio de litiges par commande
  };
  warningBadges: Array<{
    type: 'dispute_rate' | 'resolution_rate' | 'delivery_time' | 'response_time';
    severity: 'low' | 'medium' | 'high';
    label: string;
    description: string;
  }>;
  updatedAt: string;
}

// Interface pour un historique de litiges
export interface DisputeHistory {
  totalDisputes: number;
  resolvedInFavor: number;
  resolvedAgainst: number;
  openDisputes: number;
  disputeSummary: Array<{
    disputeId: string;
    orderId: string;
    status: string;
    createdAt: string;
    resolvedAt?: string;
    isResolvedInFavor: boolean;
  }>;
}

// Interface pour les statistiques de commande du freelancer
export interface FreelancerOrderStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  inProgressOrders: number;
  disputedOrders: number;
  orderCompletionRate: number;
  averageCompletionTime: number; // en jours
  revenueStats: {
    total: number;
    lastMonth: number;
    lastWeek: number;
  };
}

// Interface pour un facteur de ranking
export interface RankingFactor {
  name: string;
  weight: number; // poids dans le calcul du score (0-1)
  description: string;
  score: number; // score actuel du freelancer pour ce facteur (0-100)
  trend: 'up' | 'down' | 'stable'; // tendance
  lastUpdated: string;
}

// Interfaces pour la détection de comportements anormaux

export interface Account {
  id: string;
  userId: string;
  email: string;
  phone?: string;
  lastIpAddress?: string;
  lastDeviceId?: string;
  lastLoginAt?: string;
  createdAt: string;
  creationIpAddress?: string;
  verificationLevel: 'none' | 'email' | 'phone' | 'id' | 'full';
  status: 'active' | 'pending' | 'suspended' | 'restricted' | 'banned';
  statusReason?: string;
  suspendedUntil?: string;
  restrictions?: AccountRestriction[];
  securityFlags?: SecurityFlag[];
  loginHistory?: LoginRecord[];
  geolocations?: GeoLocation[];
  relatedAccounts?: string[];
}

export interface AccountRestriction {
  id: string;
  accountId: string;
  type: 'warning' | 'limited_access' | 'payment_hold' | 'suspension' | 'ban';
  reason: string;
  appliedAt: string;
  appliedBy?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface SecurityFlag {
  id: string;
  accountId: string;
  type: 'multi_accounts' | 'shared_phone' | 'shared_ip' | 'location_mismatch' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high';
  details: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
}

export interface LoginRecord {
  id: string;
  accountId: string;
  timestamp: string;
  ipAddress: string;
  deviceId?: string;
  deviceInfo?: string;
  browser?: string;
  operatingSystem?: string;
  geolocation?: GeoLocation;
  status: 'success' | 'failed' | 'blocked';
  failureReason?: string;
}

export interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  timezone?: string;
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  accountId: string;
  type: 'multi_accounts' | 'shared_phone' | 'shared_ip' | 'location_mismatch' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high';
  details: string;
  createdAt: string;
  status: 'new' | 'investigating' | 'resolved';
  assignedTo?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  relatedAlerts?: string[];
  relatedAccounts?: string[];
}

export interface AccountLink {
  id: string;
  primaryAccountId: string;
  linkedAccountId: string;
  linkType: 'same_person' | 'same_household' | 'business_relationship' | 'suspicious';
  confidence: number; // 0 à 1
  matchReason: 'ip' | 'phone' | 'device' | 'email_pattern' | 'payment_info' | 'manual';
  createdAt: string;
  createdBy?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

/**
 * Certificate type definition
 */
export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

/**
 * Portfolio item type definition
 */
export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  category?: string;
  images?: string[];
  projectUrl?: string;
  technologies?: string[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
}

export interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 