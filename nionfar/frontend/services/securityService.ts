import { User } from '../types';

// Types pour les alertes de sécurité
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityAlert {
  userId: string;
  type: 'withdrawal' | 'login' | 'kyc' | 'payment' | 'ip_change' | 'location_change';
  severity: AlertSeverity;
  details: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
  resolved?: boolean;
}

// Type pour le statut de vérification KYC
export type KycStatus = 'pending' | 'verified' | 'rejected' | 'incomplete';

export interface KycInfo {
  userId: string;
  status: KycStatus;
  phoneVerified: boolean;
  emailVerified: boolean;
  idVerified: boolean;
  addressVerified: boolean;
  submissionDate?: string;
  verificationDate?: string;
  rejectionReason?: string;
  documents?: {
    type: 'id' | 'address' | 'selfie';
    status: 'pending' | 'verified' | 'rejected';
    url: string;
    uploadDate: string;
  }[];
}

// Interface pour les alertes admin
export interface AdminAlert {
  userId: string;
  alertType: 'suspicious_activity' | 'identity_verification' | 'withdrawal_attempt';
  message: string;
  details?: string[];
  timestamp?: Date;
}

// Type pour le statut KYC
export interface KycStatusDetails {
  isVerified: boolean;
  canWithdraw: boolean;
  reasons: string[];
  verifiedFields: {
    phone: boolean;
    email: boolean;
    identity: boolean;
    address: boolean;
  };
  lastUpdate: Date;
}

/**
 * Service pour gérer la sécurité et la prévention de fraude
 */
const securityService = {
  /**
   * Vérifie l'activité de l'utilisateur pour détecter des comportements suspects
   * @param userId - ID de l'utilisateur à vérifier
   * @returns Un objet contenant le résultat de la vérification
   */
  async checkUserActivity(userId: string): Promise<{ 
    isSuspicious: boolean; 
    reasons: string[];
    alerts: SecurityAlert[];
  }> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulation de vérification d'activité (à remplacer par une véritable API)
    const mockReasons: string[] = [];
    const mockAlerts: SecurityAlert[] = [];
    
    // Générer un nombre aléatoire pour simuler des activités suspectes
    const randomFactor = Math.random();
    const isSuspicious = randomFactor > 0.7;
    
    if (isSuspicious) {
      if (randomFactor > 0.9) {
        mockReasons.push('Multiples retraits dans un court laps de temps');
        mockAlerts.push({
          userId,
          type: 'withdrawal',
          severity: 'high',
          details: '10 retraits effectués dans les dernières 24 heures',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
        });
      }
      
      if (randomFactor > 0.8) {
        mockReasons.push('Connexions depuis plusieurs adresses IP différentes');
        mockAlerts.push({
          userId,
          type: 'ip_change',
          severity: 'medium',
          details: 'Connexions depuis 5 adresses IP différentes en 2 heures',
          timestamp: new Date().toISOString(),
        });
      }
      
      if (randomFactor > 0.85) {
        mockReasons.push('Changement de localisation géographique suspect');
        mockAlerts.push({
          userId,
          type: 'location_change',
          severity: 'medium',
          details: 'Connexion depuis un pays différent (Russie) du pays habituel (Sénégal)',
          timestamp: new Date().toISOString(),
          location: 'Moscow, Russia',
        });
      }
    }
    
    return {
      isSuspicious,
      reasons: mockReasons,
      alerts: mockAlerts
    };
  },
  
  /**
   * Vérifie si l'utilisateur a complété sa procédure KYC (Know Your Customer)
   * @param userId - ID de l'utilisateur à vérifier
   * @returns Un objet contenant le statut KYC de l'utilisateur
   */
  async verifyIdentity(userId: string): Promise<{ 
    isVerified: boolean; 
    kycInfo: KycInfo;
    canWithdraw: boolean;
    reasons: string[];
  }> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulation de vérification d'identité (à remplacer par une véritable API)
    const random = Math.random();
    
    const mockKycInfo: KycInfo = {
      userId,
      status: random > 0.7 ? 'verified' : random > 0.4 ? 'pending' : random > 0.2 ? 'incomplete' : 'rejected',
      phoneVerified: random > 0.3,
      emailVerified: random > 0.2,
      idVerified: random > 0.5,
      addressVerified: random > 0.6,
      submissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      documents: [
        {
          type: 'id',
          status: random > 0.6 ? 'verified' : random > 0.3 ? 'pending' : 'rejected',
          url: 'https://example.com/documents/id',
          uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'address',
          status: random > 0.7 ? 'verified' : random > 0.4 ? 'pending' : 'rejected',
          url: 'https://example.com/documents/address',
          uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    if (mockKycInfo.status === 'verified') {
      mockKycInfo.verificationDate = new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString();
    } else if (mockKycInfo.status === 'rejected') {
      mockKycInfo.rejectionReason = random > 0.5 
        ? 'Document d\'identité illisible ou incomplet'
        : 'Adresse du document ne correspond pas à l\'adresse déclarée';
    }
    
    // Déterminer si l'utilisateur peut effectuer un retrait
    const canWithdraw = mockKycInfo.status === 'verified';
    
    // Raisons pour lesquelles l'utilisateur ne peut pas effectuer de retrait
    const reasons: string[] = [];
    if (!canWithdraw) {
      if (mockKycInfo.status === 'pending') {
        reasons.push('Votre vérification d\'identité est en cours de traitement');
      } else if (mockKycInfo.status === 'rejected') {
        reasons.push(`Votre vérification d'identité a été rejetée : ${mockKycInfo.rejectionReason}`);
      } else if (mockKycInfo.status === 'incomplete') {
        if (!mockKycInfo.phoneVerified) reasons.push('Numéro de téléphone non vérifié');
        if (!mockKycInfo.emailVerified) reasons.push('Adresse e-mail non vérifiée');
        if (!mockKycInfo.idVerified) reasons.push('Pièce d\'identité non vérifiée');
        if (!mockKycInfo.addressVerified) reasons.push('Adresse non vérifiée');
      }
    }
    
    return {
      isVerified: mockKycInfo.status === 'verified',
      kycInfo: mockKycInfo,
      canWithdraw,
      reasons
    };
  },
  
  /**
   * Hook pour vérifier si un retrait peut être effectué
   * @param userId - ID de l'utilisateur
   * @param amount - Montant du retrait
   * @returns Un objet indiquant si le retrait est autorisé
   */
  async verifyWithdrawalEligibility(userId: string, amount: number): Promise<{
    isEligible: boolean;
    reasons: string[];
    requiresAdditionalVerification: boolean;
  }> {
    // Vérifier l'activité de l'utilisateur
    const activityCheck = await this.checkUserActivity(userId);
    
    // Vérifier l'identité de l'utilisateur
    const identityCheck = await this.verifyIdentity(userId);
    
    const isEligible = !activityCheck.isSuspicious && identityCheck.canWithdraw;
    const reasons: string[] = [
      ...activityCheck.isSuspicious ? activityCheck.reasons : [],
      ...identityCheck.reasons
    ];
    
    // Déterminer si une vérification supplémentaire est nécessaire (pour les gros montants)
    const requiresAdditionalVerification = amount > 500000 || (activityCheck.isSuspicious && reasons.length === 0);
    
    return {
      isEligible,
      reasons,
      requiresAdditionalVerification
    };
  },
  
  /**
   * Envoie une alerte administrative
   * @param alert Détails de l'alerte à envoyer
   */
  async sendAdminAlert(alert: Omit<SecurityAlert, 'timestamp'>): Promise<{ success: boolean }> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Alerte de sécurité envoyée:', {
      ...alert,
      timestamp: new Date().toISOString()
    });
      
    return { success: true };
  },

  /**
   * Récupère le statut de vérification d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Statut de vérification et informations KYC
   */
  async getUserVerificationStatus(userId: string): Promise<{
    isVerified: boolean;
    verificationLevel: 'none' | 'basic' | 'full';
    kycInfo: KycInfo;
    lastVerificationDate?: string;
    pendingDocuments: string[];
    verificationHistory: Array<{
      date: string;
      action: string;
      status: 'approved' | 'rejected' | 'pending';
      notes?: string;
    }>;
  }> {
    try {
      // Simuler un appel au backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer les informations KYC existantes
      const kycResponse = await this.verifyIdentity(userId);
      const kycInfo = kycResponse.kycInfo;
      
      // Déterminer le niveau de vérification basé sur les informations KYC
      let verificationLevel: 'none' | 'basic' | 'full' = 'none';
      if (kycInfo.idVerified && kycInfo.addressVerified) {
        verificationLevel = 'full';
      } else if (kycInfo.emailVerified && kycInfo.phoneVerified) {
        verificationLevel = 'basic';
      }
      
      // Générer un historique de vérification simulé
      const verificationHistory = [];
      
      if (kycInfo.emailVerified) {
        const emailVerifDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
        verificationHistory.push({
          date: emailVerifDate.toISOString(),
          action: 'Vérification d\'email',
          status: 'approved'
        });
      }
      
      if (kycInfo.phoneVerified) {
        const phoneVerifDate = new Date(Date.now() - Math.random() * 150 * 24 * 60 * 60 * 1000);
        verificationHistory.push({
          date: phoneVerifDate.toISOString(),
          action: 'Vérification de téléphone',
          status: 'approved'
        });
      }
      
      if (kycInfo.idVerified) {
        const idVerifDate = new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000);
        verificationHistory.push({
          date: idVerifDate.toISOString(),
          action: 'Vérification d\'identité',
          status: 'approved',
          notes: 'Carte d\'identité valide'
        });
      }
      
      if (kycInfo.addressVerified) {
        const addressVerifDate = new Date(Date.now() - Math.random() * 100 * 24 * 60 * 60 * 1000);
        verificationHistory.push({
          date: addressVerifDate.toISOString(),
          action: 'Vérification d\'adresse',
          status: 'approved',
          notes: 'Facture d\'électricité acceptée'
        });
      }
      
      // Trier l'historique par date (du plus récent au plus ancien)
      verificationHistory.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Déterminer la date de dernière vérification
      let lastVerificationDate = undefined;
      if (verificationHistory.length > 0) {
        lastVerificationDate = verificationHistory[0].date;
      }
      
      // Documents en attente
      const pendingDocuments = [];
      if (!kycInfo.idVerified) {
        pendingDocuments.push('Pièce d\'identité');
      }
      if (!kycInfo.addressVerified) {
        pendingDocuments.push('Justificatif de domicile');
      }
      
      return {
        isVerified: verificationLevel === 'full',
        verificationLevel,
        kycInfo,
        lastVerificationDate,
        pendingDocuments,
        verificationHistory
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de vérification:', error);
      return {
        isVerified: false,
        verificationLevel: 'none',
        kycInfo: {
          userId: userId,
          status: 'incomplete',
          emailVerified: false,
          phoneVerified: false,
          idVerified: false,
          addressVerified: false
        },
        pendingDocuments: ['Tous les documents requis'],
        verificationHistory: []
      };
    }
  }
};

export default securityService; 