import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      // Valider les données d'entrée avec le schéma Zod
      const result = this.schema.parse(value);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        // Convertir les erreurs Zod en format lisible pour le débogage
        const formattedError = error.format();
        console.error('❌ Erreur de validation ZOD:', JSON.stringify(formattedError, null, 2));
        
        // Convertir les erreurs Zod en message d'erreur lisible pour la réponse
        const validationError = fromZodError(error);
        
        throw new BadRequestException({
          message: 'Erreur de validation',
          errors: validationError.details,
          validation: error.errors.map(err => err.message),
          pipe: 'ZodValidationPipe',
          formattedErrors: formattedError,
          statusCode: 400,
        });
      }
      throw error;
    }
  }
} 