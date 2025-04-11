import { Service, User } from '../types';

/**
 * Configuration for the automated service validation bot
 */
export interface ValidationConfig {
  // Title validation
  minTitleLength: number;
  maxTitleLength: number;
  
  // Description validation
  minDescriptionLength: number;
  
  // Price validation
  minPrice: number;
  maxPrice: number;
  
  // Banned words and patterns that trigger automatic rejection
  bannedWords: string[];
  
  // Required score thresholds
  validatedThreshold: number;
  rejectedThreshold: number;
}

/**
 * Result of the automated service validation
 */
export interface ValidationResult {
  status: 'validated' | 'validated_prod' | 'rejected' | 'pending' | 'revision';
  score: number;
  report: string;
  detailedReport: {
    category: string;
    passed: boolean;
    score: number;
    message: string;
  }[];
  moderatedByBot: boolean;
  revisionFeedback?: string;
}

/**
 * Default configuration for the validation bot
 */
const DEFAULT_CONFIG: ValidationConfig = {
  minTitleLength: 10,
  maxTitleLength: 100,
  minDescriptionLength: 200,
  minPrice: 500,
  maxPrice: 200000,
  bannedWords: [
    'whatsapp', 'telegram', 'signal', 'facebook', 'instagram',
    'numéro', 'contactez-moi', 'contactez moi', 'appelez-moi', 'appelez moi',
    'certificat', 'faux document', 'diplôme', 'permis', 'contrefaçon',
    'hacke', 'pirater', 'piratage', 'tricher', 'examen',
    'carte bancaire', 'compte bancaire', 'western union',
    'casino', 'jeu d\'argent', 'paris sportif',
    'porno', 'sexuel', 'adulte',
  ],
  validatedThreshold: 80,
  rejectedThreshold: 60
};

/**
 * Service validation bot that analyzes services and assigns scores and statuses
 */
export class ServiceValidationBot {
  private config: ValidationConfig;
  
  constructor(config?: Partial<ValidationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Validates a service using the configured rules
   * @param service Service to validate
   * @param user User who created the service
   * @returns Validation result with score, status and report
   */
  public validateService(service: Service, user: User): ValidationResult {
    const detailedReport: {
      category: string;
      passed: boolean;
      score: number;
      message: string;
    }[] = [];
    let totalScore = 0;
    
    // Check for banned content first (automatic rejection)
    const bannedContentCheck = this.checkForBannedContent(service);
    if (!bannedContentCheck.passed) {
      return {
        status: 'rejected',
        score: -100,
        report: 'Service automatically rejected: ' + bannedContentCheck.message,
        detailedReport: [bannedContentCheck],
        moderatedByBot: true
      };
    }
    
    // 1. Validate title
    const titleCheck = this.validateTitle(service.title);
    detailedReport.push(titleCheck);
    totalScore += titleCheck.score;
    
    // 2. Validate description
    const descriptionCheck = this.validateDescription(service.description);
    detailedReport.push(descriptionCheck);
    totalScore += descriptionCheck.score;
    
    // 3. Validate price
    const priceCheck = this.validatePrice(service.price);
    detailedReport.push(priceCheck);
    totalScore += priceCheck.score;
    
    // 4. Validate images
    const imageCheck = this.validateImages(service);
    detailedReport.push(imageCheck);
    totalScore += imageCheck.score;
    
    // 5. Validate tags and keywords
    const tagsCheck = this.validateTags(service.tags || []);
    detailedReport.push(tagsCheck);
    totalScore += tagsCheck.score;
    
    // 6. Validate category
    const categoryCheck = this.validateCategory(service.category);
    detailedReport.push(categoryCheck);
    totalScore += categoryCheck.score;
    
    // 7. Check for coherence between title, description and price
    const coherenceCheck = this.validateCoherence(service);
    detailedReport.push(coherenceCheck);
    totalScore += coherenceCheck.score;
    
    // 8. Check user profile completeness
    const profileCheck = this.validateUserProfile(user);
    detailedReport.push(profileCheck);
    totalScore += profileCheck.score;
    
    // Determine status based on score
    let status: 'pending' | 'validated' | 'rejected' = 'pending';
    if (totalScore >= this.config.validatedThreshold) {
      status = 'validated';
    } else if (totalScore < this.config.rejectedThreshold) {
      status = 'rejected';
    }
    
    // Generate summary report
    const report = this.generateReport(totalScore, status, detailedReport);
    
    return {
      status,
      score: totalScore,
      report,
      detailedReport,
      moderatedByBot: true
    };
  }
  
  /**
   * Checks if the service contains banned content
   */
  private checkForBannedContent(service: Service) {
    const contentToCheck = [
      service.title || '',
      service.description || '',
      service.shortDescription || '',
      ...(service.tags || [])
    ].join(' ').toLowerCase();
    
    const foundBannedWords: string[] = [];
    
    this.config.bannedWords.forEach(word => {
      if (contentToCheck.includes(word.toLowerCase())) {
        foundBannedWords.push(word);
      }
    });
    
    if (foundBannedWords.length > 0) {
      return {
        category: 'Banned Content',
        passed: false,
        score: -100,
        message: `Service contains banned words or phrases: ${foundBannedWords.join(', ')}`
      };
    }
    
    return {
      category: 'Banned Content',
      passed: true,
      score: 0,
      message: 'No banned content detected'
    };
  }
  
  /**
   * Validates the title of the service
   */
  private validateTitle(title: string = '') {
    const { minTitleLength, maxTitleLength } = this.config;
    
    if (!title || title.trim().length === 0) {
      return {
        category: 'Title',
        passed: false,
        score: 0,
        message: 'Title is missing'
      };
    }
    
    if (title.length < minTitleLength) {
      return {
        category: 'Title',
        passed: false,
        score: 0,
        message: `Title is too short (${title.length} chars). Minimum required: ${minTitleLength} characters`
      };
    }
    
    if (title.length > maxTitleLength) {
      return {
        category: 'Title',
        passed: false,
        score: 0,
        message: `Title is too long (${title.length} chars). Maximum allowed: ${maxTitleLength} characters`
      };
    }
    
    // Check if title is all caps (might be spammy)
    if (title === title.toUpperCase() && title.length > 10) {
      return {
        category: 'Title',
        passed: false,
        score: 5,
        message: 'Title is in all caps, which appears unprofessional'
      };
    }
    
    return {
      category: 'Title',
      passed: true,
      score: 10,
      message: 'Title has appropriate length and format'
    };
  }
  
  /**
   * Validates the description of the service
   */
  private validateDescription(description: string = '') {
    const { minDescriptionLength } = this.config;
    
    if (!description || description.trim().length === 0) {
      return {
        category: 'Description',
        passed: false,
        score: 0,
        message: 'Description is missing'
      };
    }
    
    if (description.length < minDescriptionLength) {
      return {
        category: 'Description',
        passed: false,
        score: 5,
        message: `Description is too short (${description.length} chars). Minimum recommended: ${minDescriptionLength} characters`
      };
    }
    
    // Check if the description has some structure (paragraphs, lists, etc.)
    const hasStructure = description.includes('\n') || description.includes('\r') || 
                        description.includes('- ') || description.includes('• ');
    
    // Check if description has sections (indicated by line breaks)
    const paragraphs = description.split(/\n+/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length >= 3 && hasStructure) {
      return {
        category: 'Description',
        passed: true,
        score: 15,
        message: 'Description is well structured and detailed'
      };
    }
    
    if (description.length >= minDescriptionLength * 1.5) {
      return {
        category: 'Description',
        passed: true,
        score: 12,
        message: 'Description has sufficient length but could be better structured'
      };
    }
    
    return {
      category: 'Description',
      passed: true,
      score: 10,
      message: 'Description has acceptable length but could be improved'
    };
  }
  
  /**
   * Validates the price of the service
   */
  private validatePrice(price: number = 0) {
    const { minPrice, maxPrice } = this.config;
    
    if (price <= 0) {
      return {
        category: 'Price',
        passed: false,
        score: 0,
        message: 'Price must be greater than zero'
      };
    }
    
    if (price < minPrice) {
      return {
        category: 'Price',
        passed: false,
        score: 5,
        message: `Price (${price} XOF) is below the minimum recommendation (${minPrice} XOF)`
      };
    }
    
    if (price > maxPrice) {
      return {
        category: 'Price',
        passed: false,
        score: 5,
        message: `Price (${price} XOF) exceeds the maximum recommendation (${maxPrice} XOF)`
      };
    }
    
    return {
      category: 'Price',
      passed: true,
      score: 10,
      message: 'Price is within the acceptable range'
    };
  }
  
  /**
   * Validates images for the service
   */
  private validateImages(service: Service) {
    // Check for images in different formats (images array, image property, gallery)
    const images = [
      ...(service.images || []),
      ...(service.gallery || [])
    ];
    
    if (service.image) {
      images.push(service.image);
    }
    
    // Filter out empty strings or null values
    const validImages = images.filter(img => img && img.trim().length > 0);
    
    if (validImages.length === 0) {
      return {
        category: 'Images',
        passed: false,
        score: 0,
        message: 'No images provided for the service'
      };
    }
    
    if (validImages.length === 1) {
      return {
        category: 'Images',
        passed: true,
        score: 10,
        message: 'Service has one image'
      };
    }
    
    if (validImages.length >= 3) {
      return {
        category: 'Images',
        passed: true,
        score: 15,
        message: `Service has ${validImages.length} images, which is excellent`
      };
    }
    
    return {
      category: 'Images',
      passed: true,
      score: 12,
      message: `Service has ${validImages.length} images`
    };
  }
  
  /**
   * Validates tags and keywords
   */
  private validateTags(tags: string[] = []) {
    const validTags = tags.filter(tag => tag && tag.trim().length > 0);
    
    if (validTags.length === 0) {
      return {
        category: 'Tags',
        passed: false,
        score: 0,
        message: 'No tags or keywords added'
      };
    }
    
    // Check for tag spam (too many similar tags)
    const uniqueTagsCount = new Set(validTags.map(t => t.toLowerCase())).size;
    
    if (validTags.length > 10) {
      return {
        category: 'Tags',
        passed: false,
        score: 3,
        message: 'Too many tags may be considered as tag spamming'
      };
    }
    
    if (uniqueTagsCount < validTags.length * 0.7) {
      return {
        category: 'Tags',
        passed: false,
        score: 5,
        message: 'Some tags appear to be duplicates or very similar'
      };
    }
    
    if (validTags.length >= 3 && validTags.length <= 7) {
      return {
        category: 'Tags',
        passed: true,
        score: 10,
        message: 'Good use of relevant tags'
      };
    }
    
    return {
      category: 'Tags',
      passed: true,
      score: 8,
      message: 'Tags are present but could be optimized'
    };
  }
  
  /**
   * Validates the service category
   */
  private validateCategory(category: any) {
    if (!category) {
      return {
        category: 'Category',
        passed: false,
        score: 0,
        message: 'No category selected'
      };
    }
    
    // Check if it's a string or an object with an id
    if (typeof category === 'string' && category.trim().length > 0) {
      return {
        category: 'Category',
        passed: true,
        score: 5,
        message: 'Category properly selected'
      };
    }
    
    if (typeof category === 'object' && category.id) {
      return {
        category: 'Category',
        passed: true,
        score: 5,
        message: 'Category properly selected'
      };
    }
    
    return {
      category: 'Category',
      passed: false,
      score: 0,
      message: 'Invalid category format'
    };
  }
  
  /**
   * Validates coherence between service title, description and price
   */
  private validateCoherence(service: Service) {
    // This is a simplistic approach, ideally you would use more advanced NLP
    // to determine how related the title, description and price are
    
    // Check if key terms from the title appear in the description
    const title = service.title || '';
    const description = service.description || '';
    
    if (!title || !description) {
      return {
        category: 'Coherence',
        passed: false,
        score: 0,
        message: 'Cannot evaluate coherence with missing title or description'
      };
    }
    
    // Extract significant words from title (ignore common words, prepositions, etc.)
    const titleWords = title.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[.,;:!?]/g, ''));
    
    // Check how many significant title words appear in the description
    const descriptionLower = description.toLowerCase();
    const matchingWords = titleWords.filter(word => descriptionLower.includes(word));
    
    const coherenceScore = Math.min(20, Math.floor((matchingWords.length / Math.max(1, titleWords.length)) * 20));
    
    if (coherenceScore >= 15) {
      return {
        category: 'Coherence',
        passed: true,
        score: 20,
        message: 'Excellent coherence between title and description'
      };
    }
    
    if (coherenceScore >= 10) {
      return {
        category: 'Coherence',
        passed: true,
        score: 15,
        message: 'Good coherence between title and description'
      };
    }
    
    if (coherenceScore >= 5) {
      return {
        category: 'Coherence',
        passed: true,
        score: 10,
        message: 'Acceptable coherence, but could be improved'
      };
    }
    
    return {
      category: 'Coherence',
      passed: false,
      score: 5,
      message: 'Poor coherence between title and description'
    };
  }
  
  /**
   * Validates the completeness of the user profile
   */
  private validateUserProfile(user: User) {
    if (!user) {
      return {
        category: 'User Profile',
        passed: false,
        score: 0,
        message: 'User information not available'
      };
    }
    
    let profileScore = 0;
    const checkPoints = [];
    
    // Check verification status
    if (user.isVerified) {
      profileScore += 3;
      checkPoints.push('verified account');
    }
    
    // Check if email is verified
    if (user.emailVerified) {
      profileScore += 2;
      checkPoints.push('verified email');
    }
    
    // Check if user has a bio
    if (user.bio && user.bio.length >= 100) {
      profileScore += 2;
      checkPoints.push('complete bio');
    }
    
    // Check if user has skills
    if (user.skills && user.skills.length >= 3) {
      profileScore += 1;
      checkPoints.push('listed skills');
    }
    
    // Check if user has an avatar
    if (user.avatar) {
      profileScore += 1;
      checkPoints.push('profile picture');
    }
    
    // Check location
    if (user.location) {
      profileScore += 1;
      checkPoints.push('location information');
    }
    
    if (profileScore >= 8) {
      return {
        category: 'User Profile',
        passed: true,
        score: 10,
        message: `Excellent profile completeness: ${checkPoints.join(', ')}`
      };
    }
    
    if (profileScore >= 5) {
      return {
        category: 'User Profile',
        passed: true,
        score: 7,
        message: `Good profile: ${checkPoints.join(', ')}`
      };
    }
    
    if (profileScore >= 3) {
      return {
        category: 'User Profile',
        passed: true,
        score: 5,
        message: `Basic profile: ${checkPoints.join(', ')}`
      };
    }
    
    return {
      category: 'User Profile',
      passed: false,
      score: 0,
      message: 'Incomplete user profile'
    };
  }
  
  /**
   * Generates a human-readable report from the validation results
   */
  private generateReport(totalScore: number, status: string, detailedReport: any[]): string {
    const statusMap = {
      validated: '✅ VALIDATED',
      pending: '🟡 PENDING REVIEW',
      rejected: '❌ REJECTED'
    };
    
    const passedChecks = detailedReport.filter(check => check.passed);
    const failedChecks = detailedReport.filter(check => !check.passed);
    
    let report = `## Service Validation Bot Report\n\n`;
    report += `**Status:** ${statusMap[status as keyof typeof statusMap] || status}\n`;
    report += `**Quality Score:** ${totalScore}/100\n\n`;
    
    if (status === 'rejected' && failedChecks.length > 0) {
      report += `### ❌ Critical Issues:\n`;
      failedChecks.forEach(check => {
        report += `- **${check.category}:** ${check.message}\n`;
      });
      report += '\n';
    }
    
    report += `### ✓ Passed Checks (${passedChecks.length}):\n`;
    passedChecks.forEach(check => {
      report += `- **${check.category} (+${check.score} pts):** ${check.message}\n`;
    });
    
    if (failedChecks.length > 0 && status !== 'rejected') {
      report += `\n### ⚠️ Areas for Improvement (${failedChecks.length}):\n`;
      failedChecks.forEach(check => {
        report += `- **${check.category}:** ${check.message}\n`;
      });
    }
    
    if (status === 'validated') {
      report += `\n🎉 Congratulations! Your service has been automatically validated by our system.`;
    } else if (status === 'pending') {
      report += `\n⏳ Your service will be manually reviewed by our team.`;
    } else {
      report += `\n📝 Please address the issues above and resubmit your service.`;
    }
    
    return report;
  }
}

// Export a singleton instance with default configuration
export const serviceValidationBot = new ServiceValidationBot();

export default serviceValidationBot; 