import { Service, User } from '../types';

/**
 * Service de validation pour les services/offres des freelancers
 */
class ServiceValidationService {
  private readonly MAX_ACTIVE_SERVICES = 10;
  
  // Motifs à rechercher pour les contacts directs
  private readonly CONTACT_PATTERNS = [
    // Email
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
    // Téléphone international
    /((?:\+|00)[0-9]{1,3}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4})/gi,
    // Téléphone local
    /(0[0-9]{1,2}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2})/gi,
    // WhatsApp
    /whatsapp[\s.:]+([0-9+\s.-]+)/gi,
    // Telegram
    /telegram[\s.:@]+([a-zA-Z0-9_]+)/gi,
    // Instagram
    /instagram[\s.:@]+([a-zA-Z0-9._]+)/gi,
    // Facebook
    /facebook[\s.:]+([a-zA-Z0-9.]+)/gi,
    // URL
    /(https?:\/\/[^\s]+)/gi,
  ];
  
  // Mots-clés interdits nécessitant une modération manuelle
  private readonly FORBIDDEN_KEYWORDS = [
    "parions sport",
    "certificat de mariage",
    "faux document",
    "diplôme",
    "certificat médical",
    "hacke",
    "pirater compte",
    "piratage",
    "attestation",
    "casino",
    "jeu d'argent",
    "paris sportif",
    "permis de conduire",
    "contrefaçon",
    "faux papier",
    "tricher",
    "examen",
    "porno",
    "sexuel",
    "mémoire universitaire",
    "thèse",
    "dissert",
    "devoir",
    "examen",
  ];

  /**
   * Vérifie si un utilisateur peut créer un nouveau service actif
   * @param userId ID de l'utilisateur
   * @param activeServicesCount Nombre de services actifs actuels
   * @returns {Promise<{isValid: boolean, message: string}>} Résultat de la validation
   */
  async canCreateActiveService(userId: string, activeServicesCount: number): Promise<{isValid: boolean, message: string}> {
    if (activeServicesCount >= this.MAX_ACTIVE_SERVICES) {
      return {
        isValid: false,
        message: `Vous ne pouvez pas avoir plus de ${this.MAX_ACTIVE_SERVICES} services actifs simultanément. Veuillez désactiver un service existant avant d'en créer un nouveau.`
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Vérifie que le titre du service est unique
   * @param title Titre du service
   * @param existingServices Liste des services existants
   * @param currentServiceId ID du service actuel (pour l'édition)
   * @returns {Promise<{isValid: boolean, message: string}>} Résultat de la validation
   */
  async validateUniqueTitle(
    title: string, 
    existingServices: Service[], 
    currentServiceId?: string
  ): Promise<{isValid: boolean, message: string}> {
    const isDuplicate = existingServices.some(service => 
      service.title.toLowerCase() === title.toLowerCase() && 
      (!currentServiceId || service.id !== currentServiceId)
    );
    
    if (isDuplicate) {
      return {
        isValid: false,
        message: 'Ce titre de service existe déjà. Veuillez choisir un titre unique.'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Vérifie si la description contient des informations de contact directes
   * @param description Description du service
   * @returns {Promise<{isValid: boolean, message: string, matches: string[]}>} Résultat de la validation
   */
  async validateNoDirectContact(description: string): Promise<{isValid: boolean, message: string, matches: string[]}> {
    const matches: string[] = [];
    
    // Vérifier chaque pattern
    this.CONTACT_PATTERNS.forEach(pattern => {
      const result = description.match(pattern);
      if (result) {
        matches.push(...result);
      }
    });
    
    if (matches.length > 0) {
      return {
        isValid: false,
        message: 'La description ne peut pas contenir des informations de contact directes (email, téléphone, liens vers des réseaux sociaux, etc.)',
        matches
      };
    }
    
    return {
      isValid: true,
      message: '',
      matches: []
    };
  }

  /**
   * Vérifie si le service nécessite une modération manuelle
   * @param service Service à vérifier
   * @returns {Promise<{requiresModeration: boolean, reasons: string[]}>} Résultat de la vérification
   */
  async checkModeration(service: Service): Promise<{requiresModeration: boolean, reasons: string[]}> {
    const reasons: string[] = [];
    const content = `${service.title} ${service.summary || ''} ${service.description || ''}`.toLowerCase();
    
    // Vérifier les mots-clés interdits
    this.FORBIDDEN_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        reasons.push(`Contient le mot-clé interdit: "${keyword}"`);
      }
    });
    
    return {
      requiresModeration: reasons.length > 0,
      reasons
    };
  }

  /**
   * Effectue une validation complète d'un service
   * @param service Service à valider
   * @param existingServices Liste des services existants
   * @param currentUser Utilisateur actuel
   * @param isEditing Indique si c'est une édition (true) ou une création (false)
   * @returns Résultat de la validation complète
   */
  async validateService(
    service: Service,
    existingServices: Service[],
    currentUser: User,
    isEditing: boolean = false
  ): Promise<{
    isValid: boolean,
    requiresModeration: boolean,
    errors: {field: string, message: string}[],
    moderationReasons: string[]
  }> {
    const errors: {field: string, message: string}[] = [];
    
    // Vérifier le nombre de services actifs
    if (service.isActive && !isEditing) {
      const activeServicesCount = existingServices.filter(s => 
        s.provider && s.provider.id === currentUser.id && s.isActive
      ).length;
      
      const canCreateResult = await this.canCreateActiveService(currentUser.id, activeServicesCount);
      if (!canCreateResult.isValid) {
        errors.push({
          field: 'isActive',
          message: canCreateResult.message
        });
      }
    }
    
    // Vérifier l'unicité du titre
    const titleResult = await this.validateUniqueTitle(
      service.title, 
      existingServices, 
      isEditing ? service.id : undefined
    );
    if (!titleResult.isValid) {
      errors.push({
        field: 'title',
        message: titleResult.message
      });
    }
    
    // Vérifier l'absence de contacts directs
    if (service.description) {
      const contactResult = await this.validateNoDirectContact(service.description);
      if (!contactResult.isValid) {
        errors.push({
          field: 'description',
          message: contactResult.message
        });
      }
    }
    
    // Vérifier la modération automatique
    const moderationResult = await this.checkModeration(service);
    
    return {
      isValid: errors.length === 0,
      requiresModeration: moderationResult.requiresModeration,
      errors,
      moderationReasons: moderationResult.reasons
    };
  }
}

// Exporter une instance du service
const serviceValidationService = new ServiceValidationService();
export default serviceValidationService; 