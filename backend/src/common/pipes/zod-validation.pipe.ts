import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Logger } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);
  
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      this.logger.debug(`Validation de données pour '${metadata.type}' avec le type '${metadata.metatype?.name || 'inconnu'}'`);
      
      // Valider les données d'entrée avec le schéma Zod
      const result = this.schema.parse(value);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        // Convertir les erreurs Zod en format lisible pour le débogage
        const formattedError = error.format();
        
        // Afficher les données reçues (sans mots de passe)
        const sanitizedValue = this.sanitizeValue(value);
        
        this.logger.error(
          `❌ Erreur de validation ZOD [${metadata.type}]: ${JSON.stringify(formattedError, null, 2)}`,
          `\nDonnées reçues: ${JSON.stringify(sanitizedValue, null, 2)}`
        );
        
        // Convertir les erreurs Zod en message d'erreur lisible pour la réponse
        const validationError = fromZodError(error);
        
        throw new BadRequestException({
          message: 'Erreur de validation',
          errors: validationError.details,
          validation: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code
          })),
          pipe: 'ZodValidationPipe',
          target: metadata.type,
          receivedData: sanitizedValue,
          formattedErrors: formattedError,
          statusCode: 400,
        });
      }
      this.logger.error(`❌ Erreur inattendue lors de la validation: ${error.message}`);
      throw error;
    }
  }
  
  // Méthode pour masquer les données sensibles avant de les logger
  private sanitizeValue(value: unknown): any {
    if (!value || typeof value !== 'object') {
      return value;
    }
    
    const sanitized = { ...value };
    
    // Masquer les champs sensibles
    const sensitiveFields = ['password', 'passwordConfirmation', 'currentPassword', 'newPassword'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[MASKED]';
      }
    }
    
    return sanitized;
  }
} 