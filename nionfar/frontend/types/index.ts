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
  name: string;
  email: string;
  role?: string;
  image?: string;
  avatar?: string;
  createdAt: string;
  isVerified?: boolean;
  specialty?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  username?: string;
  level?: string;
  rating?: number;
  memberSince?: Date;
  phone?: string;
  address?: string;
  website?: string;
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
  status: 'en_attente' | 'validé' | 'rejeté';
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
  orderId: string;
  message: string;
  fileUrls: string[];
  createdAt: string;
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
  status: 'attente' | 'validé' | 'remboursé' | 'échoué';
  method: 'carte' | 'mobile_money' | 'virement';
  transactionId: string;
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