import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Service } from '../entities/service.entity';
import { ServiceValidationHistory } from '../entities/service-validation-history.entity';
import { ServiceValidationResult } from '../entities/service-validation-result.entity';
import { ServiceStatus } from '../enums/service-status.enum';
import { UsersService } from '../../users/users.service';
import { ValidationFilters, ValidationResult } from '../interfaces/validation.interface';

@Injectable()
export class ServiceValidationService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    
    @InjectRepository(ServiceValidationHistory)
    private validationHistoryRepository: Repository<ServiceValidationHistory>,
    
    @InjectRepository(ServiceValidationResult)
    private validationResultRepository: Repository<ServiceValidationResult>,
    
    private usersService: UsersService,
  ) {}

  /**
   * Get services that need validation with filters
   */
  async getPendingServices(filters: ValidationFilters) {
    const { status, category, search, page, limit, sortBy, sortDirection } = filters;
    
    // Build query with filters
    const query = this.servicesRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.validationResult', 'validationResult');
      
    // Apply filters
    if (status) {
      query.andWhere('validationResult.status = :status', { status });
    }
    
    if (category) {
      query.andWhere('category.id = :category', { category });
    }
    
    if (search) {
      query.andWhere('(service.title LIKE :search OR service.description LIKE :search)', { 
        search: `%${search}%` 
      });
    }
    
    // Sort options
    if (sortBy) {
      const direction = sortDirection === 'desc' ? 'DESC' : 'ASC';
      
      if (sortBy === 'score') {
        query.orderBy('validationResult.score', direction as 'ASC' | 'DESC');
      } else if (sortBy === 'status') {
        query.orderBy('validationResult.status', direction as 'ASC' | 'DESC');
      } else if (sortBy === 'price') {
        query.orderBy('service.price', direction as 'ASC' | 'DESC');
      } else if (sortBy === 'provider') {
        query.orderBy('provider.name', direction as 'ASC' | 'DESC');
      } else {
        query.orderBy(`service.${sortBy}`, direction as 'ASC' | 'DESC');
      }
    } else {
      // Default sort by creation date
      query.orderBy('service.createdAt', 'ASC');
    }
    
    // Count total before pagination
    const total = await query.getCount();
    
    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);
    
    // Execute query
    const services = await query.getMany();
    
    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get validation statistics
   */
  async getValidationStats() {
    const [
      total,
      pending,
      validated,
      rejected,
      revision,
      inProduction
    ] = await Promise.all([
      this.validationResultRepository.count(),
      this.validationResultRepository.count({ where: { status: ServiceStatus.PENDING } }),
      this.validationResultRepository.count({ where: { status: ServiceStatus.VALIDATED } }),
      this.validationResultRepository.count({ where: { status: ServiceStatus.REJECTED } }),
      this.validationResultRepository.count({ where: { status: ServiceStatus.REVISION } }),
      this.validationResultRepository.count({ where: { status: ServiceStatus.VALIDATED_PROD } })
    ]);
    
    return {
      total,
      pending,
      validated,
      rejected,
      revision,
      inProduction
    };
  }

  /**
   * Get service with its validation details
   */
  async getServiceWithValidationDetails(serviceId: string) {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
      relations: ['provider', 'category', 'validationResult']
    });
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }
    
    // Get the validation result or create a default one
    let validationResult: ValidationResult;
    
    if (service.validationResult) {
      validationResult = {
        status: service.validationResult.status,
        score: service.validationResult.score,
        report: service.validationResult.report,
        detailedReport: service.validationResult.detailedReport,
        moderatedByBot: service.validationResult.moderatedByBot,
        revisionFeedback: service.validationResult.revisionFeedback
      };
    } else {
      // Create a default pending validation
      validationResult = {
        status: ServiceStatus.PENDING,
        score: 0,
        report: 'Service en attente de validation',
        detailedReport: [],
        moderatedByBot: false
      };
    }
    
    return { service, validationResult };
  }

  /**
   * Run analysis on a service
   */
  async analyzeService(serviceId: string) {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
      relations: ['provider', 'category']
    });
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }
    
    // In a real application, this would be a more complex analysis
    // This is a simplified example
    const validationResult = this.runServiceValidationAnalysis(service);
    
    // Save the validation result
    await this.saveValidationResult(service, validationResult);
    
    return { 
      service, 
      validationResult 
    };
  }

  /**
   * Run automated validation analysis on a service
   * In a real application, this would be more complex
   */
  private runServiceValidationAnalysis(service: Service): ValidationResult {
    // Simplified scoring algorithm
    let score = 0;
    const detailedReport: { category: string; passed: boolean; score: number; message: string; }[] = [];
    
    // Check title length (up to 20 points)
    const titleLength = service.title?.length || 0;
    if (titleLength >= 10 && titleLength <= 100) {
      const titleScore = Math.min(20, Math.floor(titleLength / 5));
      score += titleScore;
      detailedReport.push({
        category: 'Title',
        passed: true,
        score: titleScore,
        message: `Title has a good length (${titleLength} characters)`
      });
    } else {
      detailedReport.push({
        category: 'Title',
        passed: false,
        score: 0,
        message: `Title length should be between 10 and 100 characters (current: ${titleLength})`
      });
    }
    
    // Check description length (up to 30 points)
    const descriptionLength = service.description?.length || 0;
    if (descriptionLength >= 100) {
      const descScore = Math.min(30, Math.floor(descriptionLength / 20));
      score += descScore;
      detailedReport.push({
        category: 'Description',
        passed: true,
        score: descScore,
        message: `Description is detailed (${descriptionLength} characters)`
      });
    } else {
      detailedReport.push({
        category: 'Description',
        passed: false,
        score: 0,
        message: `Description is too short (${descriptionLength} characters). Aim for at least 100 characters.`
      });
    }
    
    // Check price (up to 15 points)
    if (service.price > 0) {
      const priceScore = Math.min(15, Math.floor(service.price / 1000));
      score += priceScore;
      detailedReport.push({
        category: 'Price',
        passed: true,
        score: priceScore,
        message: `Price is set to ${service.price} XOF`
      });
    } else {
      detailedReport.push({
        category: 'Price',
        passed: false,
        score: 0,
        message: 'Price must be greater than 0'
      });
    }
    
    // Check for images (up to 15 points)
    const hasImages = service.images?.length > 0;
    if (hasImages) {
      const imagesCount = service.images?.length || 0;
      const imageScore = Math.min(15, imagesCount * 5);
      score += imageScore;
      detailedReport.push({
        category: 'Images',
        passed: true,
        score: imageScore,
        message: `Service has ${imagesCount} image(s)`
      });
    } else {
      detailedReport.push({
        category: 'Images',
        passed: false,
        score: 0,
        message: 'Service has no images'
      });
    }
    
    // Check for tags (up to 10 points)
    if (service.tags?.length > 0) {
      const tagScore = Math.min(10, service.tags.length * 2);
      score += tagScore;
      detailedReport.push({
        category: 'Tags',
        passed: true,
        score: tagScore,
        message: `Service has ${service.tags.length} tag(s)`
      });
    } else {
      detailedReport.push({
        category: 'Tags',
        passed: false,
        score: 0,
        message: 'Service has no tags'
      });
    }
    
    // Check for category (10 points)
    if (service.category) {
      score += 10;
      detailedReport.push({
        category: 'Category',
        passed: true,
        score: 10,
        message: `Service is categorized as ${service.category.name}`
      });
    } else {
      detailedReport.push({
        category: 'Category',
        passed: false,
        score: 0,
        message: 'Service has no category'
      });
    }
    
    // Generate final status based on score
    let status = ServiceStatus.PENDING;
    if (score >= 80) {
      status = ServiceStatus.VALIDATED;
    } else if (score < 50) {
      status = ServiceStatus.REJECTED;
    }
    
    // Generate report
    const report = `Service analyzed with a score of ${score}/100. ${
      status === ServiceStatus.VALIDATED 
        ? 'Quality is good and service can be validated.' 
        : status === ServiceStatus.REJECTED 
          ? 'Quality is poor and service should be rejected.'
          : 'Service needs improvements before being validated.'
    }`;
    
    return {
      status,
      score,
      report,
      detailedReport,
      moderatedByBot: true
    };
  }

  /**
   * Save validation result for a service
   */
  private async saveValidationResult(service: Service, validationResult: ValidationResult) {
    // Check if service already has a validation result
    let result = await this.validationResultRepository.findOne({
      where: { service: { id: service.id } }
    });
    
    if (result) {
      // Update existing result
      result.status = validationResult.status;
      result.score = validationResult.score;
      result.report = validationResult.report;
      result.detailedReport = validationResult.detailedReport;
      result.moderatedByBot = validationResult.moderatedByBot;
      
      // Keep existing feedback if status is revision
      if (result.status !== ServiceStatus.REVISION) {
        result.revisionFeedback = null;
      }
    } else {
      // Create new result
      result = this.validationResultRepository.create({
        service,
        status: validationResult.status,
        score: validationResult.score,
        report: validationResult.report,
        detailedReport: validationResult.detailedReport,
        moderatedByBot: validationResult.moderatedByBot
      });
    }
    
    await this.validationResultRepository.save(result);
    
    // Return the saved result
    return result;
  }

  /**
   * Update service validation status
   */
  async updateServiceStatus(
    serviceId: string, 
    status: string, 
    adminId: string,
    feedback?: string
  ) {
    // Validate status
    if (!Object.values(ServiceStatus).includes(status as ServiceStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
      relations: ['validationResult']
    });
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }
    
    // Get admin user
    const admin = await this.usersService.findOne(adminId);
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }
    
    // Update service active status based on validation status
    if (status === ServiceStatus.VALIDATED_PROD) {
      service.isActive = true;
    } else if (status === ServiceStatus.REJECTED) {
      service.isActive = false;
    }
    
    await this.servicesRepository.save(service);
    
    // Update or create validation result
    let validationResult = service.validationResult;
    
    if (!validationResult) {
      validationResult = this.validationResultRepository.create({
        service,
        status: status as ServiceStatus,
        score: 0,
        report: `Status set to ${status} by admin`,
        detailedReport: [],
        moderatedByBot: false
      });
    } else {
      validationResult.status = status as ServiceStatus;
      validationResult.moderatedByBot = false;
      
      // Add revision feedback if provided and status is revision
      if (status === ServiceStatus.REVISION && feedback) {
        validationResult.revisionFeedback = feedback;
      } else if (status !== ServiceStatus.REVISION) {
        validationResult.revisionFeedback = null;
      }
    }
    
    await this.validationResultRepository.save(validationResult);
    
    // Create history entry
    await this.createValidationHistoryEntry(service, admin, status as ServiceStatus, feedback);
    
    return {
      success: true,
      message: `Service ${serviceId} status updated to ${status}`,
      service,
      validationResult
    };
  }

  /**
   * Create validation history entry
   */
  private async createValidationHistoryEntry(
    service: Service,
    admin: any,
    status: ServiceStatus,
    feedback?: string
  ) {
    const historyEntry = this.validationHistoryRepository.create({
      service,
      admin,
      status,
      feedback,
      timestamp: new Date()
    });
    
    return this.validationHistoryRepository.save(historyEntry);
  }

  /**
   * Get validation history for a service
   */
  async getServiceValidationHistory(serviceId: string) {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId }
    });
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }
    
    const history = await this.validationHistoryRepository.find({
      where: { service: { id: serviceId } },
      relations: ['admin'],
      order: { timestamp: 'DESC' }
    });
    
    return { history };
  }
} 